import { glMatrix } from './geometry/common';
import { vec3 } from './geometry/vec3';
import { mat4 } from './geometry/mat4';
import { plane } from './geometry/plane';
import { Entity, Designer, MountType } from './designer';
import * as actions from './actions';
import { MoveTool } from './move-tool';
import * as geom from './geometry/geometry';
import { Box } from './geometry/box';
import * as ftools from './floor-tools';
import { FloorBuilder } from './floorplanner';
import { pb } from './pb/scene';
import { ProjectCollisionHandler } from './project-handler';
import { ElementRange } from './render/vector-renderer';

export class EditorTool extends MoveTool {
  private sizeEntity: Entity;
  private sizeContourTransform: number[];
  private _tryEditElem: geom.Element;

  constructor(ds: Designer) {
    super(ds);
    this.sizeEntity = this.ds.temp.addChild();
  }

  private addModelSizes(item: Entity) {
    let sizeEntity = this.sizeEntity;
    let contour = new geom.Contour();
    sizeEntity.drawing = contour;
    sizeEntity.box.setIdentity();
    sizeEntity.translation = item.toGlobal(item.box.center);

    let viewDir = item.NtoLocal(this.ds.camera.viewDir);
    let maxCoord = vec3.maxCoord(viewDir);
    let iaxis1 = (maxCoord + 1) % 3;
    let iaxis2 = (maxCoord + 2) % 3;
    let vaxis1 = vec3.fromAxis(iaxis1);
    let vaxis2 = vec3.fromAxis(iaxis2);
    let rightDir = item.NtoLocal(this.ds.camera.rightDir);
    if (
      Math.abs(vec3.dot(rightDir, vaxis1)) <
      Math.abs(vec3.dot(rightDir, vaxis2))
    ) {
      let temp = iaxis1;
      iaxis1 = iaxis2;
      iaxis2 = temp;
    }

    sizeEntity.orient(
      item.NtoGlobal(vec3.fromAxis(maxCoord)),
      item.NtoGlobal(vec3.fromAxis(iaxis2))
    );

    let box = item.sizeBox;
    let addSize = (x1, y1, x2, y2, dir) => {
      let p1 = vec3.create();
      let p2 = vec3.create();
      p1[iaxis1] = x1;
      p1[iaxis2] = y1;
      p1[maxCoord] = box.center[maxCoord];
      p2[iaxis1] = x2;
      p2[iaxis2] = y2;
      p2[maxCoord] = box.center[maxCoord];
      p1 = item.toGlobal(p1);
      p2 = item.toGlobal(p2);
      p1 = sizeEntity.toLocal(p1);
      p2 = sizeEntity.toLocal(p2);
      let size = contour.addSizexy(p1[0], p1[1], p2[0], p2[1]);
      size.tagData = {
        edit: { type: 'move', dir: dir, value: size.value, directional: false }
      };
    };

    let sceneSize = this.ds.box.diagonal;
    let collisionHandler = new ProjectCollisionHandler(this.ds);
    collisionHandler.update();

    let dir1 = item.NtoGlobal(vec3.fromAxis(iaxis1, true));
    let dist1 = collisionHandler.moveDistance(dir1, sceneSize);
    let dir2 = item.NtoGlobal(vec3.fromAxis(iaxis1, false));
    let dist2 = collisionHandler.moveDistance(dir2, sceneSize);

    const sizeRatio = this.ds.camera.perspective ? 2 : 1e10;
    if (dist1 > 1 && dist2 > 1) {
      if (dist2 * sizeRatio > dist1) addSize(
        box.min[iaxis1] - dist1,
        box.center[iaxis2],
        box.min[iaxis1],
        box.center[iaxis2],
        dir1
      );
      if (dist1 * sizeRatio > dist2) addSize(
        box.max[iaxis1],
        box.center[iaxis2],
        box.max[iaxis1] + dist2,
        box.center[iaxis2],
        dir2
      );
    }

    dir1 = item.NtoGlobal(vec3.fromAxis(iaxis2, true));
    dist1 = collisionHandler.moveDistance(dir1, sceneSize);
    dir2 = item.NtoGlobal(vec3.fromAxis(iaxis2, false));
    dist2 = collisionHandler.moveDistance(dir2, sceneSize);
    if (dist1 > 1 && dist2 > 1) {
      if (dist2 * sizeRatio > dist1) addSize(
        box.center[iaxis1],
        box.min[iaxis2] - dist1,
        box.center[iaxis1],
        box.min[iaxis2],
        dir1
      );
      if (dist1 * sizeRatio > dist2) addSize(
        box.center[iaxis1],
        box.max[iaxis2] + dist2,
        box.center[iaxis1],
        box.max[iaxis2],
        dir2
      );
    }
  }

  private addFloorSizes(floor: Entity, wallId?: number, roomId?: string) {
    let sizeEntity = this.sizeEntity;
    let roomBox = floor.box;
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
    let drawingOptions = new ftools.DrawingOptions();
    drawingOptions.wallId = wallId;
    drawingOptions.roomId = roomId;
    drawingOptions.walls = !wallId;
    drawingOptions.corners = !wallId;
    sizeEntity.drawing = ftools.makeFloorDrawing(
      floor,
      floorBuilder,
      drawingOptions
    );

    let transformation = mat4.fromXRotation(mat4.create(), Math.PI * 0.5);
    mat4.mul(transformation, floor.globalMatrix, transformation);
    mat4.mul(transformation, sizeEntity.invMatrix, transformation);
    this.sizeContourTransform = transformation;
    sizeEntity.drawing.contour.transform(transformation);
    sizeEntity.boxChanged();
  }

  private addWallElementSizes(item: Entity) {
    let sizeEntity = this.sizeEntity;
    let contour = new geom.Contour();
    sizeEntity.drawing = contour;
    let elemBox = item.sizeBox;
    sizeEntity.contentBox = item.box.copy();
    sizeEntity.contentBox.enlarge(500);
    let wall = item.parent;
    let viewDir = this.ds.camera.viewDir;
    let walllocalViewDir = wall.NtoLocal(viewDir);
    let itemlocalViewDir = item.NtoLocal(viewDir);

    let sizePos = vec3.fromValues(
      elemBox.center[0],
      elemBox.center[1],
      itemlocalViewDir[2] > 0 ? elemBox.minz : elemBox.maxz
    );
    sizeEntity.translation = item.toGlobal(sizePos);

    let extent = elemBox.extent;
    let boxExtent = item.box.extent;
    let objViewDir = vec3.fsub(item.box.center, item.toLocal(this.ds.camera.viewPos));
    objViewDir[2] *= 2;
    let maxCoord = vec3.maxCoord(objViewDir);
    if (maxCoord === 1) {
      sizeEntity.orient(vec3.axisy, wall.NtoGlobal(vec3.axis_z));
      extent[1] = 0;
    } else {
      sizeEntity.orient(wall.NtoGlobal(vec3.axisz), vec3.axisy);
    }

    let sizeDistance = 150;
    let size = contour.addSizexy(
      -extent[0] * 0.5,
      extent[1] * 0.5 + sizeDistance,
      elemBox.extent[0] * 0.5,
      extent[1] * 0.5 + sizeDistance
    );
    size.tagData = {
      edit: {
        type: 'resize',
        axis: '#width',
        value: extent[0],
        uid: item.uidStr,
        directional: true
      }
    };

    if (maxCoord === 2) {
      let isDoor = item.data.mountType === MountType.InsideWallAtBottom;
      size = contour.addSizexy(
        extent[0] * 0.5 + sizeDistance,
        -extent[1] * 0.5,
        elemBox.extent[0] * 0.5 + sizeDistance,
        extent[1] * 0.5
      );
      size.tagData = {
        edit: {
          type: 'resize',
          axis: '#height',
          value: extent[1],
          uid: item.uidStr,
          directional: !isDoor,
          door: isDoor
        }
      };
    }

    let wallBox = wall.contentBox.copy();
    wallBox.miny = 0;
    let itemBox = new Box();
    itemBox.clear();
    itemBox.addOBB(elemBox, item.matrix);

    let intervals: { t1: number; t2: number }[] = wall.data.wall.roomIntervals;
    if (intervals) {
      for (let interval of intervals) {
        if (walllocalViewDir[2] * (interval.t2 - interval.t1) > 0) {
          let minx = Math.min(interval.t1, interval.t2);
          let maxx = Math.max(interval.t1, interval.t2);
          if (minx - glMatrix.EPSILON < itemBox.minx && maxx + glMatrix.EPSILON > itemBox.maxx) {
            wallBox.minx = minx;
            wallBox.maxx = maxx;
            break;
          }
        }
      }
    }

    let sceneSize = this.ds.box.diagonal;
    let collisionHandler = new ProjectCollisionHandler(this.ds);
    collisionHandler.addCollisionObjects(item.parent);

    let verticalSizePos = extent[1] / 6;
    if (itemBox.minx > wallBox.minx + glMatrix.EPSILON) {
      let distance = itemBox.minx - wallBox.minx;
      let size = contour.addSizexy(
        -extent[0] * 0.5 - distance,
        verticalSizePos,
        -extent[0] * 0.5,
        verticalSizePos
      );
      size.tagData = {
        edit: {
          type: 'move',
          dir: wall.NtoGlobal(vec3.axis_x),
          value: distance
        }
      };

      let dir = item.NtoGlobal(vec3.axis_x);
      let moveDist = collisionHandler.moveDistance(dir, sceneSize, sceneSize);
      if (moveDist < distance + glMatrix.EPSILON) {
        let moveSize = contour.addSizexy(
          -boxExtent[0] * 0.5 - moveDist,
          -verticalSizePos,
          -boxExtent[0] * 0.5,
          -verticalSizePos
        );
        moveSize.tagData = {
          edit: {
            type: 'move',
            dir: wall.NtoGlobal(vec3.axis_x),
            value: moveDist
          }
        };
      }
    }

    if (itemBox.maxx < wallBox.maxx - glMatrix.EPSILON) {
      let distance = wallBox.maxx - itemBox.maxx;
      let size = contour.addSizexy(
        extent[0] * 0.5,
        verticalSizePos,
        extent[0] * 0.5 + distance,
        verticalSizePos
      );
      size.tagData = {
        edit: { type: 'move', dir: wall.NtoGlobal(vec3.axisx), value: distance }
      };

      let dir = item.NtoGlobal(vec3.axisx);
      let moveDist = collisionHandler.moveDistance(dir, sceneSize, sceneSize);
      if (moveDist < distance + glMatrix.EPSILON) {
        let moveSize = contour.addSizexy(
          boxExtent[0] * 0.5,
          -verticalSizePos,
          boxExtent[0] * 0.5 + moveDist,
          -verticalSizePos
        );
        moveSize.tagData = {
          edit: {
            type: 'move',
            dir: wall.NtoGlobal(vec3.axisx),
            value: moveDist
          }
        };
      }
    }

    if (maxCoord === 2) {
      if (!glMatrix.equalsd(itemBox.miny, wallBox.miny)) {
        let distance = itemBox.miny - wallBox.miny;
        let size = contour.addSizexy(
          0.0,
          -extent[1] * 0.5 - distance,
          0.0,
          -extent[1] * 0.5,
          0.0
        );
        size.tagData = {
          edit: {
            type: 'move',
            dir: wall.NtoGlobal(vec3.axis_y),
            value: distance,
            directional: false
          }
        };
      }
    }
  }

  private addContainerSizes(item: Entity) {
    let sizeEntity = this.sizeEntity;
    let contour = new geom.Contour();
    sizeEntity.drawing = contour;
    let elemBox = new Box();
    elemBox.clear().addOBB(item.sizeBox, item.matrix);
    sizeEntity.contentBox = item.box.copy();
    sizeEntity.contentBox.enlarge(500);
    let container = item.parent;
    let containerBox = container.sizeBox;
    let sizeCenter = containerBox.center;
    sizeCenter[2] = containerBox.maxz;
    sizeEntity.translation = container.toGlobal(sizeCenter);
    sizeEntity.orient(container.NtoGlobal(vec3.axisz), container.NtoGlobal(vec3.axisy));
    let axis = (item.elastic.position - pb.Elastic.Position.Vertical) % 3;

    let minPos = containerBox.min[axis];
    let hasMin = false;
    let maxPos = containerBox.max[axis];
    let hasMax = false;
    for (let child of container.children) {
      if (child !== item && child.elastic && child.elastic.position >= pb.Elastic.Position.Vertical) {
        let min = child.toParent(child.sizeBox.min);
        let max = child.toParent(child.sizeBox.max);
        if (max[axis] > minPos && max[axis] < elemBox.min[axis]) {
          minPos = max[axis];
          hasMin = true;
        }
        if (min[axis] < maxPos && min[axis] > elemBox.max[axis]) {
          maxPos = min[axis];
          hasMax = true;
        }
      }
    }

    const MINSIZE = 1;
    if (axis === 0) {
      let ypos = containerBox.maxy - containerBox.sizey * 0.1;
      let ypos2 = containerBox.maxy - containerBox.sizey * 0.2;
      let size: geom.Size;
      if (elemBox.minx - containerBox.minx > MINSIZE) {
        size = contour.addSizexy(elemBox.minx, ypos, containerBox.minx, ypos);
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axis_x),
            value: elemBox.minx - containerBox.minx
          }
        };
      }
      if (hasMin) {
        size = contour.addSizexy(elemBox.minx, ypos2, minPos, ypos2);
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axis_x),
            value: elemBox.minx - minPos
          }
        };
      }

      if (containerBox.maxx - elemBox.maxx > MINSIZE) {
        size = contour.addSizexy(elemBox.maxx, ypos, containerBox.maxx, ypos);
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axisx),
            value: containerBox.maxx - elemBox.maxx
          }
        };
      }

      if (hasMax) {
        size = contour.addSizexy(elemBox.maxx, ypos2, maxPos, ypos2);
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axisx),
            value: maxPos - elemBox.maxx
          }
        };
      }
    }

    if (axis === 1) {
      let xoffset = elemBox.sizex * 0.2;
      let size: geom.Size;
      if (elemBox.miny - containerBox.miny > MINSIZE) {
        size = contour.addSizexy(elemBox.centerx + xoffset, elemBox.miny, elemBox.centerx + xoffset, containerBox.miny);
        size.horizontal = true;
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axis_y),
            value: elemBox.miny - containerBox.miny
          }
        };
      }
      if (hasMin) {
        size = contour.addSizexy(elemBox.centerx - xoffset, elemBox.miny, elemBox.centerx - xoffset, minPos);
        size.horizontal = true;
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axis_y),
            value: elemBox.miny - minPos
          }
        };
      }

      if (containerBox.maxy - elemBox.maxy > MINSIZE) {
        size = contour.addSizexy(elemBox.centerx + xoffset, elemBox.maxy, elemBox.centerx + xoffset, containerBox.maxy);
        size.horizontal = true;
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axisy),
            value: containerBox.maxy - elemBox.maxy
          }
        };
      }

      if (hasMax) {
        size = contour.addSizexy(elemBox.centerx - xoffset, elemBox.maxy, elemBox.centerx - xoffset, maxPos);
        size.horizontal = true;
        size.tagData = {
          edit: {
            type: 'move',
            dir: container.NtoGlobal(vec3.axisy),
            value: maxPos - elemBox.maxy
          }
        };
      }
    }

    contour.transform(mat4.fromTranslation(mat4.create(), vec3.fnegate(sizeCenter)));
    sizeEntity.boxChanged();
  }

  private makeItemSizes(item: Entity) {
    if (this.child) {
      this._removeSizes();
      return;
    }
    if (item.parent && item.parent.data.wall) {
      this.addWallElementSizes(item);
    } else if (item.data.wall) {
      this.addFloorSizes(item.parent, item.data.wall.id);
    } else if (item.data.floor) {
      this.addFloorSizes(item);
    } else if (item.data.room && item.parent.data.floor) {
      this.addFloorSizes(item.parent, undefined, item.data.room.id);
    } else if (item.elastic && item.elastic.position) {
      let parentContainer = item.parent && item.parent.elastic && item.parent.elastic.container;
      if (parentContainer && item.elastic.position >= pb.Elastic.Position.Vertical) {
        this.addContainerSizes(item);
      }
    } else {
      this.addModelSizes(item);
    }
  }

  private _updateSizes() {
    this._removeSizes();
    let selected = this.ds.selected;
    if (selected && !this.child) {
      this.makeItemSizes(selected);
      this.sizeEntity.visible = true;
    }
  }

  protected selectionChanged() {
    this._updateSizes();
  }

  protected serverSync() {
    this._updateSizes();
  }

  private selectElement(el: geom.Element, cursor: geom.Vector, transform: Float64Array) {
    let changed = false;
    if (el.tagData && el.tagData.edit && !this.mouse.anyButton) {
      if (el.type === geom.ElementType.Size) {
        let size = <geom.Size>el;
        el.selected = true;
        let p1 = size.dim1.clone();
        let p2 = size.dim2.clone();
        let pt = size.textPos.clone();
        p1.transformPersp(transform);
        p2.transformPersp(transform);
        pt.transformPersp(transform);
        let d1 = geom.distance(cursor, p1);
        let d2 = geom.distance(cursor, p2);
        let dt = geom.distance(cursor, pt);
        if ((dt < d1 && dt < d2) || !el.tagData.edit.directional) {
          size.selectionMode = geom.SizeSelection.All;
        } else if (d1 < d2) {
          size.selectionMode = geom.SizeSelection.Dir1;
        } else {
          size.selectionMode = geom.SizeSelection.Dir2;
        }
        changed = true;
      } else if (el.point) {
        el.selected = true;
        changed = true;
      } else if (el.line) {
        if (el.tagData) {
          el.selected = true;
          changed = true;
        } else if (el.owner && el.owner.tagData) {
          el = el.owner;
          el.selected = true;
          changed = true;
        }
      } else if (el.contour) {
        el.selected = true;
        changed = true;
      }
    }
    if (this.sizeEntity.drawing.contour) {
      let contour = this.sizeEntity.drawing.contour;
      for (let elem of contour.items) {
        let shouldBeSelected = elem.tagData && elem.tagData.selected;
        if (elem.selected && elem !== el && !shouldBeSelected) {
          elem.selected = false;
          changed = true;
        }
      }
    }
    if (changed) {
      this.sizeEntity.changed();
    }
  }

  private startEditElem(el: geom.Element) {
    let handled = false;
    let floor = this.ds.selected;
    while (floor && !floor.data.floor) {
      floor = floor.parent;
    }

    if (floor && floor.data.floor) {
      let floorEditor: ftools.FloorMapEditorTool = undefined;
      let editType = el.tagData.edit.type;
      if (el.point) {
        floorEditor = new ftools.FloorCornerTool(
          floor,
          el.tagData.edit.pos
        );
      } else if (editType === 'addledge') {
        floorEditor = new ftools.AddFloorLedgeTool(
          floor,
          el.tagData.edit.elemIndex1,
          el.tagData.edit.elemIndex2
        );
      } else if (editType === 'addbevel') {
        floorEditor = new ftools.AddFloorBevelTool(
          floor,
          el.tagData.edit.elemIndex1,
          el.tagData.edit.elemIndex2
        );
      } else if (editType === 'movewall') {
        floorEditor = new ftools.MoveWallTool(
          floor,
          el.tagData.edit.elemId
        );
      }

      if (floorEditor) {
        handled = true;
        this.run(floorEditor, () => {
          if (!floorEditor.canceled) {
            this._updateFloorMap(floor, floorEditor.newContour);
          } else {
            this._updateSizes();
          }
        });
      }
    }
    return handled;
  }

  protected move(mouse: actions.MouseInfo) {
    if (this.moveSelection && this.moving) {
      this._updateSizes();
    } else if (
      this.sizeEntity.drawing &&
      this.sizeEntity.renderLink &&
      this.ds.editable &&
      this.sizeEntity.renderLink.ranges
    ) {
      let link = this.sizeEntity.renderLink;
      let matrix = mat4.fcopy(link.matrix);
      mat4.multiply(matrix, this.ds.windowTransform, matrix);
      let cursor = new geom.Vector(mouse.x, mouse.y);
      // find element to highlight
      let el = actions.findClosestElem(link.ranges, matrix, cursor, 5, el => el.tagData);
      if (!el && this.sizeEntity.drawing) {
        let ray = this.createRay(mouse);
        let contourPlane = plane.createPN(this.sizeEntity.translation, this.sizeEntity.NtoGlobal(vec3.axisz));
        if (ray.intersectPlane(contourPlane)) {
          let localPos = this.sizeEntity.toLocal(ray.intersectPos);
          let localPos2 = geom.newVector(localPos[0], localPos[1]);
          el = actions.findContourByPoint(this.sizeEntity.drawing.contour, localPos2);
        }
      }
      if (el) {
        this.selectElement(el, cursor, matrix);
      } else {
        let ranges = this.sizeEntity.renderLink.ranges as ElementRange[];
        for (let r of ranges) {
          if (r.elem.selected) {
            r.elem.selected = false;
            this.sizeEntity.changed();
          }
        }
      }

      if (mouse.left && this.moving && this._tryEditElem && !this.child) {
        if (this.startEditElem(this._tryEditElem)) {
          this._removeSizes();
        }
        this._tryEditElem = undefined;
      }
    }
    super.move(mouse);
  }

  private _applySize(size: geom.Size, value: number) {
    let edit = size.tagData.edit;
    if (edit.type === 'move') {
      let dir = edit.dir;
      let dist = edit.value - value;
      this.execTranslateSelection(vec3.fscale(dir, dist));
      this._updateSizes();
    } else if (edit.type === 'resize') {
      let dist = value - edit.value;
      let offset = -(value - edit.value) * 0.5;
      if (edit.door && edit.axis === '#height') {
        offset = 0;
      }
      let offsetDir = edit.axis === '#width' ? vec3.axisx : vec3.axisy;
      if (size.selectionMode === geom.SizeSelection.Dir1) {
        offset = -dist;
      }
      if (size.selectionMode === geom.SizeSelection.Dir2) {
        offset = 0;
      }
      let item = this.ds.selected;
      let oldMatrix = mat4.fcopy(item.matrix);
      offsetDir = item.NtoParent(vec3.fscale(offsetDir, offset));
      item.translate(offsetDir);
      let change = {uid: edit.uid, size: {[edit.axis]: value}, matrix: item.matrix};
      this.ds.apply('Resize', change);
      item.matrix = oldMatrix;
    } else if (edit.type === 'editwall') {
      let dir;
      if (size.selectionMode === geom.SizeSelection.Dir1) {
        dir = -1;
      }
      if (size.selectionMode === geom.SizeSelection.Dir2) {
        dir = 1;
      }

      let floorRoot = this.ds.entityMap[edit.floorId];
      let floor = new FloorBuilder(floorRoot);
      floor.init();
      if (edit.wallId) {
        floor.resizeWithWall(
          edit.elemId,
          floor.findRoom(edit.roomName),
          value,
          edit.wallId
        );
      } else {
        if (edit.roomName) {
          floor.resize(
            edit.elemId,
            floor.findRoom(edit.roomName),
            value,
            dir,
            edit.pos
          );
        } else {
          // TODO: it's possible to create directional resize of free standing walls
          floor.simpleResize(edit.elemId, value - edit.oldSize);
        }
      }
      if (floor.check()) {
        let command = floor.buildFloor();
        this.ds.apply('Edit wall', command);
      }
    } else if (edit.type === 'shiftwall') {
      let floorRoot = this.ds.entityMap[edit.floorId];
      let floor = new FloorBuilder(floorRoot);
      floor.init();
      let dist = value - edit.oldSize;
      let dir = geom.newVector(edit.dirx, edit.diry).scale(dist);
      floor.shiftWall(edit.wallId, dir);
      if (floor.check()) {
        let command = floor.buildFloor();
        this.ds.apply('Shift wall', command);
      }
    }
  }

  private _updateFloorMap(
    floor: Entity,
    map: geom.Contour,
    operationName?: string
  ) {
    let floorBuilder = new FloorBuilder(floor);
    floorBuilder.init();
    floorBuilder.updateMap(map);
    if (floorBuilder.check()) {
      let command = floorBuilder.buildFloor();
      this.ds.apply(operationName || 'Edit floor', command);
    }
  }

  protected down(mouse: actions.MouseInfo) {
    let el = actions.findEntityElement(
      this.sizeEntity,
      mouse,
      el => !!el.tagData
    );
    if (!el && this.sizeEntity.drawing) {
      let ray = this.createRay(mouse);
      let contourPlane = plane.createPN(this.sizeEntity.translation, this.sizeEntity.NtoGlobal(vec3.axisz));
      if (ray.intersectPlane(contourPlane)) {
        let localPos = this.sizeEntity.toLocal(ray.intersectPos);
        let localPos2 = geom.newVector(localPos[0], localPos[1]);
        el = actions.findContourByPoint(this.sizeEntity.drawing.contour, localPos2);
      }
    }
    if (el && !el.tagData && el.owner) {
      el = el.owner;
    }
    if (el && el.tagData && el.tagData.edit && this.ds.editable) {
      if (el.type !== geom.ElementType.Size) {
        this._tryEditElem = el;
      }
    } else {

    }
    super.down(mouse);
  }

  protected up(mouse: actions.MouseInfo) {
    this._tryEditElem = undefined;
    let handled = false;
    let anyEl = actions.findEntityElement(this.sizeEntity, mouse);
    let el = actions.findEntityElement(
      this.sizeEntity,
      mouse,
      el => el.tagData
    );
    if (anyEl && anyEl.line && !this.moving && mouse.middle) {
      handled = true;
      let floor = this.ds.selected.findParent(p => !!p.data.floor);
      let from = anyEl.clone().line;
      from.transform(mat4.finvert(this.sizeContourTransform));
      let floorEditor = new ftools.AuxTool(floor, from);
      this.run(floorEditor, () => {
        if (!floorEditor.canceled) {
          this._updateFloorMap(floor, floorEditor.newContour, 'Add aux line');
        } else {
          this._updateSizes();
        }
      });
    }
    if (el && !this.moving && !handled) {
      if (el.type === geom.ElementType.Size) {
        let size = <geom.Size>el;
        if (size.tagData && size.tagData.edit && this.ds.editable) {
          let textPos = size.textPos.clone();
          let p2 = textPos;
          if (size.selectionMode === geom.SizeSelection.Dir1) {
            p2 = size.dim1;
          }
          if (size.selectionMode === geom.SizeSelection.Dir2) {
            p2 = size.dim2;
          }
          p2 = p2.clone();
          let matrix = this.sizeEntity.windowMatrix;
          textPos.transformPersp(matrix);
          p2.transformPersp(matrix);
          textPos = geom.middle(textPos, p2);
          this.ds.startEditor(textPos.x, textPos.y, size.value, val => {
            this._applySize(size, val);
          });
          handled = true;
        }
      }

      let floor = this.ds.selected;
      while (floor && !floor.data.floor) {
        floor = floor.parent;
      }
      if (floor && !handled) {
        for (let child of floor.children) {
          if (child.data.wall && child.data.wall.id === el.tagData.edit.elemId) {
            this.ds.selected = child;
            handled = true;
            break;
          }
        }
      }
    }

    let oldSelMode = this.selectionMode;
    if (handled) {
      this.selectionMode = false;
    }
    super.up(mouse);
    this.selectionMode = oldSelMode;
    // we need to update after each mouse up because camera can be changed
    // and some sizes are view dependent
    this._updateSizes();
  }

  public addFloorWalls() {
    let floor = this.ds.selected;
    if (floor.parent && !floor.data.floor) {
      floor = floor.parent;
    }
    if (floor && floor.data.floor) {
      let floorEditor = new ftools.BuildWallTool(floor);
      this._removeSizes();
      this.run(floorEditor, () => {
        if (!floorEditor.canceled) {
          this._updateFloorMap(floor, floorEditor.newContour);
        } else {
          this._updateSizes();
        }
      });
    }
  }

  public splitWall() {
    let wall = this.ds.selected;
    if (wall.data.wall) {
      let floor = wall.parent;
      let wallId = this.ds.selected.data.wall.id;
      let floorEditor = new ftools.SplitWallTool(floor, wallId);
      this._removeSizes();
      this.run(floorEditor, () => {
        if (!floorEditor.canceled) {
          this._updateFloorMap(floor, floorEditor.newContour);
        } else {
          this._updateSizes();
        }
      });
    }
  }

  private _removeSizes() {
    this.sizeEntity.drawing = undefined;
    this.sizeEntity.visible = false;
    this.sizeEntity.box.setIdentity();
    this.sizeEntity.changed();
  }

  protected finishing() {
    this.sizeEntity.delete();
    super.finishing();
  }

  public escape() {
    if (this.child) {
      this.child.cancel();
    } else {
      super.escape();
    }
  }
}
