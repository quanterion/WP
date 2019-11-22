import { WebDesigner } from 'modeler/webdesigner';
import {
  mat4,
  vec3,
  glMatrix,
  Size,
  newVector,
  addScale,
  pointLineProjectionPar,
  Box
} from 'modeler/geometry';
import { RenderMode } from 'modeler/render/renderer';
import { Entity } from 'modeler/designer';
import { Room, FloorBuilder } from 'modeler/floorplanner';
import { makeFloorDrawing, DrawingOptions } from 'modeler/floor-tools';
import { tap } from 'rxjs/operators';
import { ProjectCollisionHandler } from 'modeler/project-handler';

export interface ImageMakerParams {
  mode?: string;
  view?: number[];
  width?: number;
  height?: number;
  size?: number;
  dimensions?: 'article' | 'floor';
  hideOutOfPriceElements?: boolean;
  perspective?: boolean;
  fit?: boolean;
  background?: false;
  model?: Entity;
  hideLayers?: string[];
  hideList?: { visible: boolean }[];
  fontSize?: number;
}

export class ImageMaker {
  constructor(private ds: WebDesigner, private outOfPriceElements: Entity[]) {}

  renderImage(params: ImageMakerParams = {}) {
    let hideList: { visible: boolean }[] = [];
    if (params.hideOutOfPriceElements) {
      for (let e of this.outOfPriceElements) {
        if (e.visible) {
          hideList.push(e);
        }
      }
    }
    if (params.hideLayers) {
      for (let layer of this.ds.layers) {
        if (layer.visible && params.hideLayers.includes(layer.name)) {
          hideList.push(layer);
        }
      }
    }

    if (params.hideList) {
      for (let item of params.hideList) {
        if (item && item.visible) {
          hideList.push(item);
        }
      }
    }

    if (params.model) {
      let hideChildren = (e: Entity) => {
        if (e === params.model) {
          return false;
        }
        let exclude: Entity;
        if (e.children) {
          for (let child of e.children) {
            if (!hideChildren(child)) {
              exclude = child;
            }
          }
        }
        if (exclude) {
          for (let child of e.children) {
            if (child.visible && child !== exclude) {
              hideList.push(child);
            }
          }
        } else {
          hideList.push(e);
        }
        return !!exclude;
      }
      hideChildren(this.ds.root);
      this.ds.modelChanged();
      params.fit = true;
    }

    for (let item of hideList) {
      item.visible = false;
    }

    let camera = mat4.fcopy(this.ds.camera.matrix);
    if (params.view && params.view.length === 2) {
      camera = mat4.ftransformation(vec3.origin, vec3.axisz, vec3.axisy);
      mat4.rotateY(camera, camera, glMatrix.toRadian(params.view[0]));
      mat4.rotateX(camera, camera, glMatrix.toRadian(params.view[1]));
      params.fit = true;
      if (params.model) {
        // TODO:
        camera = mat4.fmultiply(params.model.invGlobalMatrix, camera);
      }
    }
    this.ds.selection.clear();
    this.ds.render.lock();
    this.ds.render.lockLights();

    let sizes: Entity;
    if (params.dimensions) {
      if (params.dimensions === 'article') {
        sizes = this.createArticleSizes();
      }
      if (params.dimensions === 'floor') {
        sizes = this.createFloorSizes();
      }
    }
    if (params.perspective !== undefined && params.perspective !== this.ds.camera.perspective) {
      params.fit = true;
    }
    return this.ds.render
      .takePicture({
        width: params.width || params.size || this.ds.canvas.width,
        height: params.height || params.size,
        mode: RenderMode[params.mode],
        camera: camera,
        perspective: params && params.perspective,
        drawings: !!(params && !!params.dimensions),
        invalidate: false,
        taa: true,
        fit: !!params.fit,
        background: params.background,
        fontSize: params.fontSize
      }).pipe(
        tap(_ => {
          if (sizes) {
            sizes.delete();
          }
          for (let e of hideList) {
            e.visible = true;
          }
          this.ds.render.unlockLights();
          this.ds.render.unlock();
          this.ds.invalidate();
        })
      );
  }

  createFloorSizes() {
    let sizeEntity = this.ds.temp.addChild();
    let floor = this.ds.root.children.find(e => !!e.data.floor);
    if (!floor) {
      return sizeEntity;
    }
    let roomBox = floor.computeBox(e => e.visible && !e.data.light);
    sizeEntity.contentBox = new Box();
    let roomExtent = roomBox.extent;
    sizeEntity.contentBox.set([
      -roomExtent[0] * 0.5,
      -roomExtent[2] * 0.5,
      -1.0,
      roomExtent[0] * 0.5,
      roomExtent[2] * 0.5,
      1.0
    ]);
    sizeEntity.contentBox.enlarge(this.ds.unitsInPixel() * 20);
    let sizePos = vec3.fromValues(
      roomBox.center[0],
      roomBox.min[1],
      roomBox.center[2]
    );
    sizeEntity.translation = floor.toGlobal(sizePos);
    sizeEntity.orient(floor.NtoGlobal(vec3.axisy), floor.NtoGlobal(vec3.axisz));

    let floorBuilder = new FloorBuilder(floor);
    floorBuilder.init();
    let drawingOptions = new DrawingOptions();
    drawingOptions.roomId = '*';
    drawingOptions.walls = false;
    drawingOptions.fillColor = 'DDD';
    drawingOptions.corners = false;
    drawingOptions.aux = false;
    drawingOptions.rooms = false;
    this.splitRoomByArticles(floor, floorBuilder, sizeEntity);
    sizeEntity.drawing = makeFloorDrawing(floor, floorBuilder, drawingOptions);

    let transformation = mat4.fromXRotation(mat4.create(), Math.PI * 0.5);
    mat4.mul(transformation, floor.globalMatrix, transformation);
    mat4.mul(transformation, sizeEntity.invMatrix, transformation);
    sizeEntity.drawing.contour.transform(transformation);
    sizeEntity.boxChanged();
    return sizeEntity;
  }

  private splitRoomByArticles(floor: Entity, builder: FloorBuilder, owner: Entity) {
    this.ds.root.forEach(child => {
      let insideContainer = child.parent.elastic && child.parent.elastic.container;
      if (child.data.model && child.isVisible && !insideContainer) {
        if (this.splitRoomByArticle(child, floor, builder)) {
          this.createArticleDepthSize(child, owner);
        } else {
          this.createArticleXYSize(child, owner);
        }
        return false;
      }
    });
  }

  private splitRoomByArticle(
    article: Entity,
    floor: Entity,
    builder: FloorBuilder
  ) {
    let toVector = (p: Float64Array) => newVector(p[0], p[2]);
    let eps = glMatrix.EPSILON;
    let box = article.sizeBox;
    let p1 = box.min;
    let p2 = vec3.fcopy(box.min);
    p2[0] = box.maxx;
    let p = vec3.fmiddle(p1, p2);
    p = floor.toLocal(article.toGlobal(p));

    let dist = 200;
    let childRoom: Room = undefined;
    for (let room of builder.rooms) {
      if (room.contour.distance(toVector(p)) < dist) {
        childRoom = room;
      }
    }

    if (childRoom) {
      p1 = floor.toLocal(article.toGlobal(p1));
      p2 = floor.toLocal(article.toGlobal(p2));
      let line = childRoom.contour.closest(toVector(p)).line;
      let index = childRoom.contour.items.indexOf(line);
      let t1 = pointLineProjectionPar(toVector(p1), line.p1, line.dir);
      let t2 = pointLineProjectionPar(toVector(p2), line.p1, line.dir);
      if (t1 > t2) {
        let ttemp = t1;
        t1 = t2;
        t2 = ttemp;
      }
      let split1 = addScale(line.p1, line.dir, t1);
      let split2 = addScale(line.p1, line.dir, t2);
      let part1 = line;
      if (t1 < eps && t2 < 1 - eps) {
        let part2 = line.clone();
        childRoom.contour.insert(part2, index + 1);
        part1.p2 = split2;
        part2.p1 = split2;
        return true;
      } else if (t1 > eps && t2 > 1 - eps) {
        let part2 = line.clone();
        childRoom.contour.insert(part2, index + 1);
        part1.p2 = split1;
        part2.p1 = split1;
        return true;
      } else if (t1 > eps && t1 < 1 - eps && t2 > eps && t2 < 1 - eps) {
        let part2 = line.clone();
        childRoom.contour.insert(part2, index + 1);
        let part3 = line.clone();
        childRoom.contour.insert(part3, index + 2);
        part1.p2 = split1;
        part2.p1 = split1;
        part2.p2 = split2;
        part3.p1 = split2;
        return true;
      }
    }
  }

  createArticleXYSize(article: Entity, owner: Entity) {
    let box = article.computeBox();
    let sizeX = owner.addChild();
    let pos = vec3.fromValues(box.centerx, box.maxy, box.minz);
    sizeX.translation = article.toGlobal(pos);
    sizeX.orient(
      article.NtoGlobal(vec3.axisy),
      article.NtoGlobal(vec3.axis_z)
    );
    sizeX.drawing = new Size(
      newVector(-box.sizex * 0.5, 0),
      newVector(box.sizex * 0.5, 0),
      newVector(0, 100)
    );
    sizeX.retransform(owner.ds.root, owner);

    let sizeY = owner.addChild();
    pos = vec3.fromValues(box.minx, box.maxy, box.centerz);
    sizeY.translation = article.toGlobal(pos);
    sizeY.orient(
      article.NtoGlobal(vec3.axisy),
      article.NtoGlobal(vec3.axis_x)
    );
    sizeY.drawing = new Size(
      newVector(-box.sizez * 0.5, 0),
      newVector(box.sizez * 0.5, 0),
      newVector(0, 100)
    );
    sizeY.retransform(owner.ds.root, owner);
  }

  createArticleDepthSize(article: Entity, owner: Entity) {
    let box = article.computeBox();
    let sizeY = owner.addChild();
    let pos = vec3.fromValues(box.centerx, box.maxy, box.centerz);
    let cd = new ProjectCollisionHandler(this.ds, true, article);
    let offset = 300;
    let textOffset = 0;
    let canMovePosX = cd.moveDistance(article.NtoGlobal(vec3.axisx), offset) < 0;
    let canMoveNegX = cd.moveDistance(article.NtoGlobal(vec3.axis_x), offset) < 0;
    if (canMovePosX) {
      pos[0] = box.maxx;
      textOffset = offset;
    }
    if (canMoveNegX) {
      pos[0] = box.minx - offset;
      textOffset = -offset;
    }
    sizeY.translation = article.toGlobal(pos);
    sizeY.orient(
      article.NtoGlobal(vec3.axisy),
      article.NtoGlobal(vec3.axisx)
    );
    sizeY.drawing = new Size(
      newVector(-box.sizez * 0.5, 0),
      newVector(box.sizez * 0.5, 0),
      newVector(0, textOffset)
    );
    sizeY.retransform(owner.ds.root, owner);
  }

  createArticleSize(article: Entity, owner: Entity) {
    let box = article.computeBox();
    let pos = box.center;
    let sizeEntity = owner.addChild();
    pos[2] = box.minz;
    pos[1] = box.maxy;
    sizeEntity.translation = article.toGlobal(pos);
    sizeEntity.orient(
      article.NtoGlobal(vec3.axisz),
      article.NtoGlobal(vec3.axisy)
    );
    let halfx = box.sizex * 0.5;
    sizeEntity.drawing = new Size(
      newVector(-halfx, 0),
      newVector(halfx, 0),
      newVector(0, 400)
    );

    let cd = new ProjectCollisionHandler(this.ds, true, article);
    let canMovePosX = cd.moveDistance(article.NtoGlobal(vec3.axisx), 10, 11) > 10;
    let canMoveNegX = cd.moveDistance(article.NtoGlobal(vec3.axis_x), 10, 11) > 10;

    let sizeEntityy = owner.addChild();
    pos = box.center;
    let offset = 0;
    pos[2] = box.maxz;
    pos[0] = box.centerx - box.sizex * 0.2;
    if (canMovePosX) {
      offset = 400;
      pos[0] = box.maxx;
      pos[2] = box.minz;
    }
    if (canMoveNegX) {
      offset = -400;
      pos[0] = box.minx;
      pos[2] = box.minz;
    }
    sizeEntityy.translation = article.toGlobal(pos);
    sizeEntityy.orient(
      article.NtoGlobal(vec3.axisz),
      article.NtoGlobal(vec3.axisx)
    );
    let halfy = box.sizey * 0.5;
    sizeEntityy.drawing = new Size(
      newVector(-halfy, 0),
      newVector(halfy, 0),
      newVector(0, offset)
    );
  }

  private addSizes(root: Entity, owner: Entity) {
    if (root.visible) {
      if (root.data.model) {
        let insideContainer = root.parent.elastic && root.parent.elastic.container;
        // hide sizes for baseboard
        if (!insideContainer) {
          this.createArticleSize(root, owner);
        }
      } else if (root.children) {
        for (let child of root.children) {
          this.addSizes(child, owner);
        }
      }
    }
  }

  createArticleSizes() {
    let owner = this.ds.temp.addChild();
    this.addSizes(this.ds.root, owner);
    return owner;
  }
}
