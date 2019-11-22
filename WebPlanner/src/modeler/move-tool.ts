import { glMatrix } from './geometry/common';
import { vec3, mat4, plane, Box } from './geometry';
import { Entity, Designer, MountType, EntityRay, BuilderApplyItem } from "./designer";
import { CameraAction, MouseInfo } from './actions';
import { pb } from './pb/scene';
import { ProjectCollisionHandler } from './project-handler';
import { createReplica } from './syncer';
import { ContainerManager } from './container';
import { OBBIntersector } from './collision-handler';
import { FloorBuilder } from './floorplanner';

export class MoveTool extends CameraAction {
  private _clickedEntity: Entity;
  private _moveSelection = false;
  private initialMove = false; // true if user started move by drag&drop
  private restorePositions?: () => void;
  protected _mountType: MountType;
  protected movePlane: Float64Array;
  private _collisionHandler: ProjectCollisionHandler;
  private _collisionUpdate = true;
  private containerManager: ContainerManager;
  private _entityForReplace: Entity;

  get collisionHandler() {
    if (!this._collisionHandler) {
      this._collisionHandler = new ProjectCollisionHandler(this.ds);
    }
    if (this._collisionUpdate) {
      this._collisionHandler.update();
      this._collisionUpdate = false;
    }
    return this._collisionHandler;
  }

  get moveSelection() {
    return this._moveSelection;
  }

  private translateSelection(dir) {
    let selection = this.ds.selection.items;
    for (let k = 0; k < selection.length; k++) {
      let entity = selection[k];
      // because drag&drop models hidden before first move
      entity.visible = true;
      let localDir = entity.parent.NtoLocal(dir);
      entity.translate(localDir);
    }
  }

  private canStartMove() {
    if (!this.ds.editable) {
      return false;
    }
    for (let e of this.ds.selection.items) {
      if (e.data.wall || e.data.room || e.data.ceiling) {
        return false;
      }
      if (e.data.model && !e.data.model.id) {
        return false;
      }
    }
    return true;
  }

  startMove(initialMove = false) {
    if (!initialMove && !this.canStartMove()) {
      return false;
    }
    this.initialMove = initialMove;
    this._moveSelection = true;
    this.movePlane = undefined;
    this._curContainer = undefined;
    this.containerManager = undefined;
    let oldPositions = this.ds.selectedItems.map(e => ({ e, parent: e.parent, matrix: mat4.fcopy(e.matrix) }));
    this.restorePositions = () => {
      oldPositions.forEach(data => {
        data.e.parent = data.parent;
        data.e.matrix = data.matrix;
        data.e.changed(true);
      });
    };
    this.updateMove();
    return true;
  }

  updateMove() {
    let selected = this.ds.selected;
    this._mountType = MountType.Default;
    if (selected) {
      this._mountType = selected.data.mountType;
    }
    this._collisionUpdate = true;
  }

  cancelMove() {
    this._moveSelection = false;
    if (this.restorePositions) {
      this.restorePositions();
      this.restorePositions = undefined;
    }
    this.ds.apply('', {}, true, 'clear');
    if (this.initialMove) {
      this.ds.selected.delete();
    }
  }

  escape() {
    if (this._moveSelection) {
      this.cancelMove();
    } else if (this.ds.hasSelection) {
      this.ds.selection.clear();
    } else {
      super.escape();
    }
  }

  execTranslateSelection(dir) {
    this.translateSelection(dir);
    let items = this.ds.selection.items.map(e => {
      let result: BuilderApplyItem = { uid: e, matrix: e.matrix, parent: e.parent };
      if (e.data.roof) {
        result.updateRoof = true;
      }
      return result;
    });
    this.ds.applyBatch('Move', items);
  }

  insertWallSurfaceElement(element: Entity, roomId: string) {
    let commands: BuilderApplyItem[] = [];
    let elementPos = element.elastic && element.elastic.position;
    let insert = {
      insertModelId: element.data.model.id,
      modelName: element.name,
      sku: element.data.model.sku
    };
    this.ds.root.forAll(e => {
      if (e.type === FloorBuilder.wallContainerType && e.name === roomId) {
        let hasSame = e.children && e.children.find(
          child => child !== element && child.elastic && child.elastic.position === elementPos
        );
        if (!hasSame) {
          commands.push({ uid: e, insert });
        }
      }
    });
    return commands;
  }

  execReplacing(original: Entity, newEntity: Entity) {
    let modelInfo = newEntity.data.model;
    let modelName = newEntity.name;
    let replaceModelInfo = {
      insertModelId: modelInfo.id,
      modelName: modelName,
      sku: modelInfo.sku
    };
    let items: BuilderApplyItem[] = [
      { uid: original, replace: replaceModelInfo},
      { uid: newEntity, remove: true }
    ];
    this.ds.applyBatch('Replace model', items);
    let searchRoot = this.ds.root;
    let searchRootName = 'this project';
    if (ContainerManager.isElasticContainer(original.parent) && ContainerManager.isContainerItem(original)) {
      searchRoot = original.findParent(p => !!p.data.model, true, true);
      searchRootName = 'this container';
    }
    let entitiesForReplace = this.findSameEntities(original, searchRoot, [original, newEntity]);
    let message = `${original.name} has been replaced to ${modelName}.`;
    if (entitiesForReplace && entitiesForReplace.length > 0) {
      message += ` There are still ${entitiesForReplace.length} such models in ${searchRoot.name || searchRootName}. Replace all?`;
      this.ds.snack(message, 'REPLACE ALL', 6000).subscribe(_ => {
        let changes: BuilderApplyItem[] = entitiesForReplace.map(e => ({
          uid: e,
          replace: replaceModelInfo
        }));
        this.ds.applyBatch('Replace models', changes,
          undefined, undefined, modelInfo.id).then(_ => {
            message = `${entitiesForReplace.length} ${original.name} models have been replaced to ${modelName}.`
            this.ds.snack(message, 'OK');
          });
      });
    } else {
      this.ds.snack(message, 'OK');
    }
  }

  endMove(insert: boolean = false) {
    this.initialMove = false;
    if (this._moveSelection) {
      let selected = this.ds.selected;
      this._moveSelection = false;
      let containerMode = false;
      if (ContainerManager.isContainerItem(selected) && this._curContainer && this.containerManager) {
        selected.parent = this._curContainer;
        selected.matrix = mat4.fmultiply(this._curContainer.invGlobalMatrix, selected.matrix);
        containerMode = true;
      }
      let items = this.ds.selection.items.map(e => {
        let result: BuilderApplyItem = {
          uid: e,
          matrix: e.matrix,
          parent: e.parent,
          parentIndex: this._curContainerIndex
        };
        if (e.data.roof) {
          result.updateRoof = true;
        }
        return result;
      });

      if (containerMode) {
        let shiftActions = this.containerManager.shiftSplittersIfNeeded(selected);
        if (shiftActions) {
          items = [...shiftActions, ...items];
        }
      }
      let replacableEntity = this._entityForReplace;
      if (selected && insert && selected.type === FloorBuilder.wallContainerType && !replacableEntity) {
        let ray = this.createRay(this.lastMouse);
        ray.filter = e => !e.selected;
        this.intersect(ray);
        if (ray.entity instanceof Entity) {
          let roomId: string;
          if (ray.entity.data.room) {
            roomId = ray.entity.data.room.id;
          }
          if (ray.entity.data.ceiling) {
            roomId = ray.entity.data.ceiling.id;
          }
          if (roomId) {
            let inserts = this.insertWallSurfaceElement(selected, roomId);
            if (inserts.length > 0) {
              items = [...inserts, {uid: selected, remove: true}];
            }
            selected.visible = true;
          }
        }
      }

      if (selected && !selected.visible) {
        this.ds.applyBatch('Move', [], undefined, 'clear');
      } else if (insert && replacableEntity) {
        this.execReplacing(replacableEntity, selected);
      } else {
        let isFillPos = e => e.elastic && e.elastic.position === pb.Elastic.Position.Fill;
        if (selected && isFillPos(selected)) {
          let oldFill = selected.parent.children.find(e => !e.selected && isFillPos(e));
          if (oldFill) {
            items.push({ uid: oldFill, remove: true});
          }
        }
        this.ds.applyBatch('Move', items, undefined, 'finish');
      }
    }
    this._entityForReplace = undefined;
    this._clickedEntity = undefined;
    this.restorePositions = undefined;
  }

  private putIntoWall(entity: Entity, wall: Entity) {
    let newAxisZ = vec3.axisz;
    let backSide = wall.NtoLocal(this.ds.camera.viewDir)[2] > glMatrix.EPSILON;
    if (backSide) {
      newAxisZ = vec3.axis_z;
    }
    let referenceBox = entity.sizeBox;
    let localPos = this.ds.selection.pos || referenceBox.center;
    localPos[2] = referenceBox.minz;

    let entityPoint = vec3.fcopy(localPos);
    entityPoint = entity.toGlobal(entityPoint);

    let entityWallPoint = wall.toLocal(entityPoint);
    entityWallPoint[2] = wall.contentBox.minz;

    entity.parent = wall;
    entity.orient(newAxisZ, vec3.axisy);
    entityPoint = vec3.fcopy(localPos);
    entityPoint = entity.toParent(entityPoint);
    let shift = vec3.fsub(entityWallPoint, entityPoint);
    entity.translate(shift);
    if (this._mountType === MountType.InsideWallAtBottom) {
      entity.matrix[13] = -referenceBox.miny;
    }

    if (entity.elastic && entity.elastic.box && wall.contentBox) {
      if (
        !glMatrix.equalsd(entity.elastic.box.extent[2], wall.contentBox.extent[2])
      ) {
        this.ds.apply('Resize model', {
          uid: entity,
          size: { '#depth': wall.contentBox.extent[2] }
        }, undefined, 'next');
      }
    }

    let newMatrix = mat4.fcopy(entity.matrix);
    newMatrix[14] =
      (backSide ? wall.contentBox.maxz : wall.contentBox.minz) -
      entity.sizeBox.minz;
    entity.matrix = newMatrix;
  }

  private selectStartPlane(mouse: MouseInfo) {
    let result = plane.createPN(this.ds.selection.globalPos, vec3.axisy);
    let roof = this.ds.selected && this.ds.selected.data.roof;
    let canMoveDown = this.collisionHandler.moveDistance(vec3.axis_y, 1, 1) > 0.5;
    if (!roof && !this.initialMove && canMoveDown && this._mountType !== MountType.Floor) {
      let back = this.ds.selectedItems[0].NtoGlobal(vec3.axis_z);
      if (this.collisionHandler.moveDistance(back, 1, 1) < 0.1) {
        result = plane.createPN(this.ds.selection.globalPos, vec3.fnegate(back));
      }
    }
    let noCollisions = mouse.ctrl || !this.options.collisions;
    if (noCollisions && this._mountType !== MountType.Floor) {
      result = plane.createPN(this.ds.selection.globalPos, this.ds.camera.orthoViewDir);
    }
    return result;
  }

  private haveSameCoord(p1: Float64Array, p2: Float64Array) {
    let eps = OBBIntersector.cEps2;
    for (let i = 0; i < 3; i++) {
      if (glMatrix.equals(p1[i], p2[i], eps)) {
        return true;
      }
    }
  }

  private tryCorrectVector(p1: Float64Array, p2: Float64Array, distance: number[], originalMoveDir: Float64Array, moveDir: Float64Array) {
    let corrected = false;
    for (let i = 0; i < 3; i++) {
      if (!glMatrix.equalsd(originalMoveDir[i], 0)) {
        let diff = p1[i] + originalMoveDir[i] - p2[i];
        if (Math.abs(diff) < distance[i]) {
          distance[i] = Math.abs(diff);
          moveDir[i] = originalMoveDir[i] - diff;
          corrected = true;
        }
      }
    }
    return corrected;
  }

  private checkAxes(e1: Entity, e2: Entity) {
    let ax1 = e1.NtoGlobal(vec3.axisx);
    let ay1 = e1.NtoGlobal(vec3.axisy);
    let ax2 = e2.NtoGlobal(vec3.axisx);
    let ay2 = e2.NtoGlobal(vec3.axisy);
    let checkDot = (a, b) => {
      let dot = Math.abs(vec3.dot(a, b));
      return glMatrix.equalsd(dot, 1) || glMatrix.equalsd(dot, 0);
    }
    return checkDot(ax1, ax2) && checkDot(ay1, ay2);
  }

  private isEntityOnScreen(e: Entity) {
    let entityPoint = vec3.create();
    for (let i = 0; i < 8; i++) {
      e.box.getPoint(i, entityPoint);
      if (this.ds.onScreen(e.toGlobal(entityPoint))) {
        return true;
      }
    }
  }

  private tryAlignEntities(movedEntity: Entity, checkedEntity: Entity, originalMoveDir: Float64Array,
    moveDir: Float64Array, distance: number[]) {
    if (this.isEntityOnScreen(checkedEntity) && this.checkAxes(movedEntity, checkedEntity)) {
      let aligned = false;
      let originalLocalDir = movedEntity.NtoLocal(originalMoveDir);
      let localDir = movedEntity.NtoLocal(moveDir);
      let checkedEntityMin = movedEntity.toLocal(checkedEntity.toGlobal(checkedEntity.box.min));
      let checkedEntityMax = movedEntity.toLocal(checkedEntity.toGlobal(checkedEntity.box.max));
      let movedEntityMin = movedEntity.box.min;
      let movedEntityMax = movedEntity.box.max;
      if (this.haveSameCoord(movedEntityMin, checkedEntityMax) || this.haveSameCoord(movedEntityMax, checkedEntityMin)
        || this.haveSameCoord(movedEntityMax, checkedEntityMax) || this.haveSameCoord(movedEntityMin, checkedEntityMin)) {
        let entityPoint = vec3.create();
        for (let i = 0; i < 8; i++) {
          movedEntity.box.getPoint(i, entityPoint);
          if (this.tryCorrectVector(entityPoint, checkedEntityMax, distance, originalLocalDir, localDir)) {
            aligned = true;
          }
          if (this.tryCorrectVector(entityPoint, checkedEntityMin, distance, originalLocalDir, localDir)) {
            aligned = true;
          }
        }
      }
      if (aligned) {
        return movedEntity.NtoGlobal(localDir);
      }
    }
  }

  private moveDefault(mouse: MouseInfo) {
    if (!this.movePlane) {
      this.movePlane = this.selectStartPlane(mouse);
    }
    let ray = this.createRay(mouse);
    let tryJump = true;
    let bindingFound = false;
    if (ray.intersectPlane(this.movePlane)) {
      let tryMoveDir = vec3.fsub(ray.intersectPos, this.ds.selection.globalPos);
      let roof = this.ds.selected && this.ds.selected.data.roof;
      if (roof) {
        tryMoveDir[1] = 0;
      }
      if (mouse.ctrl || roof || !this.options.collisions) {
        this.translateSelection(tryMoveDir);
        this._collisionUpdate = true;
        return;
      }

      let dist = this.ds.unitsInPixel(this.ds.selection.globalPos);
      let initialDistValue = dist * 15;
      let distance = [initialDistValue, initialDistValue, initialDistValue];
      let originalMoveDir = vec3.fcopy(tryMoveDir);
      if (this.ds.selection.pivot) {
        this.ds.root.forEach(e => {
          if (!!e.data.model) {
            if (!e.isSelected) {
              let newMoveDir = this.tryAlignEntities(this.ds.selection.pivot, e, originalMoveDir, tryMoveDir, distance);
              if (newMoveDir) {
                tryMoveDir = newMoveDir;
                bindingFound = true;
                tryJump = false;
              }
            }
          }
          // exit recursion
          return false;
        });
      }

      let moveDir = tryMoveDir;
      if (bindingFound && !this.collisionHandler.isIntersect(mat4.ftranslation(moveDir), true)) {
        this.collisionHandler.moveDynamic(moveDir);
      } else {
        moveDir = this.collisionHandler.move(tryMoveDir);
      }
      if (!this.collisionHandler.isDynamicInsideBox(this.ds.box)) {
        moveDir = vec3.origin;
        this._collisionUpdate = true;
      }
      this.translateSelection(moveDir);
      let diff = vec3.fsub(tryMoveDir, moveDir);
      if (vec3.length(diff) < this.ds.unitsInPixel()) {
        let dirInsidePlane = vec3.fnegate(this.movePlane);
        let transform = mat4.ftranslation(dirInsidePlane);
        if (this.collisionHandler.isIntersect(transform, false)) {
          tryJump = false;
        }
      } else if (!this.ds.camera.perspective) {
        let transform = mat4.ftranslation(diff);
        if (!this.collisionHandler.isIntersect(transform, false)) {
          if (this.collisionHandler.isDynamicInsideBox(this.ds.box, transform)) {
            this.collisionHandler.moveDynamic(diff);
            this.translateSelection(diff);
          }
        }
      }
    }

    if ((this.ds.camera.perspective || this.initialMove)) {
      if (tryJump && this.ds.selected) {
        ray.intersected = false;
        this.jumpTo(ray);
      }
    }
    // update owner
    let floorPlan = this.findFloorPlan(ray.entity);
    if (floorPlan) {
      for (let item of this.ds.selection.items) {
        if (item.parent !== floorPlan && !this.isFloorPlan(item)) {
          item.retransform(item.parent, floorPlan);
          item.parent = floorPlan;
          this._collisionUpdate = true;
        }
      }
    }
  }

  private jumpTo(ray: EntityRay) {
    const jumpThresold = this.ds.unitsInPixel(this.ds.selection.globalPos) * (this.ds.canvas.height / 10);
    // jump to new pos along given ray
    ray.distance = this.ds.box.maxSize * 2;
    let intInfo = this.collisionHandler.rayIntersectStatic(ray);
    if (ray.intersected && glMatrix.equalsd(Math.abs(intInfo.intersectNormal[1]), 1)) {
      // move along horizontal plane
      let pivot = this.ds.selectedItems[0];
      let planePos = ray.intersectPos;
      let localLastPos = this.ds.selection.pos || pivot.box.center;
      if (intInfo.intersectNormal[1] > 0) {
        planePos[1] += localLastPos[1] - pivot.box.miny;
      } else {
        planePos[1] -= pivot.box.maxy - localLastPos[1];
      }
      let newPlane = plane.createPN(planePos, vec3.axisy);

      ray.intersected = false;
      ray.distance = this.ds.box.maxSize * 2;
      if (ray.intersectPlane(newPlane) && this.ds.box.inside(ray.intersectPos)) {
        let dir = vec3.fsub(ray.intersectPos, this.ds.selection.globalPos);
        let transform = mat4.ftranslation(dir);
        let willBeInside = this.ds.box.boxInside(pivot.box.copy().transform(pivot.globalMatrix).transform(transform));
        let willIntersect = this.collisionHandler.isIntersect(transform);
        if (willBeInside && willIntersect) {
          let inside = this.ds.box.boxInside(pivot.box.copy().transform(pivot.globalMatrix));
          if (inside) {
            let intersect = this.collisionHandler.isIntersect(mat4.fidentity());
            if (intersect) {
              // ignore future intersection if currently model intersect anyways
              willIntersect = false;
            }
          }
        }

        if (!willIntersect && willBeInside) {
          this.collisionHandler.moveDynamic(dir);
          this.translateSelection(dir);
          this.movePlane = newPlane;
        }
      }
    } else if (ray.intersected) {
      // try rotate to wall
      let transformed = false;
      let pivot = this.ds.selection.pivot;
      let oldPivotMatrix = mat4.fcopy(pivot.matrix);
      let oldAxisZ = pivot.NtoGlobal(vec3.axisz);
      let pivotGlobalMatrix = pivot.globalMatrix;
      let localLastPos = this.ds.selection.pos || pivot.box.center;
      pivot.orient(intInfo.intersectNormal, vec3.axisy);
      let planePos = ray.intersectPos;
      vec3.scaleAndAdd(planePos, planePos, intInfo.intersectNormal, localLastPos[2] - pivot.box.minz);
      let newPlane = plane.createPN(planePos, intInfo.intersectNormal);

      if (!plane.equals(newPlane, this.movePlane)) {
        ray.intersected = false;
        ray.distance = this.ds.box.maxSize * 2;
        if (ray.intersectPlane(newPlane) && this.ds.box.inside(ray.intersectPos)) {
          let dir = vec3.fsub(pivot.globalToParent(ray.intersectPos), pivot.toParent(localLastPos));

          // continue move along the floor until user moves high enough
          if (dir[1] > 0) {
            if (dir[1] < jumpThresold || this._mountType === MountType.Floor) {
              dir[1] = 0;
              newPlane = undefined;
            }
          }

          pivot.translate(dir);
          let transform = mat4.fmultiply(pivot.globalMatrix, mat4.finvert(pivotGlobalMatrix));
          if (!this.collisionHandler.isIntersect(transform)) {
            this._collisionUpdate = true;
            if (newPlane) {
              this.movePlane = newPlane;
            }
            transformed = true;
            pivot.visible = true;
          } else if (!vec3.equals(oldAxisZ, pivot.NtoGlobal(vec3.axis_z))) {
            // jump on the floor level
            let pivotBox = pivot.box.copy().transform(pivot.globalMatrix);
            ray.pos = pivotBox.center;
            ray.dir = vec3.axis_y;
            ray.intersected = false;
            ray.distance = pivotBox.sizey;
            this.collisionHandler.rayIntersectStatic(ray);
            if (ray.intersected) {
              let adjustDir = vec3.fscale(vec3.axisy, pivotBox.sizey * 0.5 - ray.distance);
              pivot.translate(pivot.NtoLocal(adjustDir));
              let transform = mat4.fmultiply(pivot.globalMatrix, mat4.finvert(pivotGlobalMatrix));
              if (!this.collisionHandler.isIntersect(transform)) {
                this._collisionUpdate = true;
                transformed = true;
                pivot.visible = true;
              }
            }
          }
        }
      }
      if (transformed) {
        let transform = mat4.fmultiply(pivot.globalMatrix, mat4.finvert(pivotGlobalMatrix));
        for (let e of this.ds.selectedItems) {
          if (e !== pivot) {
            let newGlobal = mat4.fmultiply(transform, e.globalMatrix);
            e.matrix = mat4.fmultiply(mat4.finvert(e.parent.globalMatrix), newGlobal);
          }
        }
      } else {
        pivot.matrix = oldPivotMatrix;
      }
    }
  }

  private findFloorPlan(e: Entity) {
    while (e) {
      if (this.isFloorPlan(e)) {
        return e;
      }
      e = e.parent;
    }
  }

  private isWall(e: Entity) {
    return e && (!!e.data.wall || !!e.data.slope);
  }

  private isFloorPlan(e: Entity) {
    return e && e.data.floor;
  }

  isWallElement(e: Entity) {
    return e && this.isWall(e.parent);
  }

  private intersectRayWithWall(ray: EntityRay, wall: Entity) {
    if (this.isWall(wall) && wall.contentBox) {
      let curPlane = plane.createPN(
        this.ds.selection.globalPos,
        wall.NtoGlobal(vec3.axisz)
      );
      // we should check whether point of intersection lies on the wall before actually modifying ray.distance
      let intDistance = ray.calcPlaneIntersectionDistance(curPlane);
      if (intDistance) {
        let interPos = ray.getPoint(intDistance);
        interPos = wall.toLocal(interPos);
        let box = wall.contentBox;
        if (
          interPos[0] > box.minx &&
          interPos[0] < box.maxx &&
          interPos[1] > box.miny &&
          interPos[1] < box.maxy
        ) {
          if (ray.intersectPlane(curPlane)) {
            ray.entity = wall;
          }
        }
      }
      if (!ray.intersected) {
        let curPlane = plane.createPN(
          this.ds.selection.globalPos,
          wall.NtoGlobal(vec3.axisy)
        );
        if (ray.intersectPlane(curPlane)) {
          ray.entity = wall;
        }
      }
    }
  }

  private limitMoveInsideWall(dir: Float64Array, entity: Entity, orthoMode) {
    let wall = entity.parent;
    dir = wall.NtoLocal(dir);
    dir[2] = 0;
    if (this._mountType === MountType.InsideWallAtBottom) {
      dir[1] = 0;
    }
    if (this._mountType === MountType.InsideWall && orthoMode) {
      // y will be applied if its a first time setup only
      let newy =
        (wall.box.sizey - entity.box.sizey) * 0.5 -
        entity.box.miny;
      dir[1] = newy - entity.translation[1];
    }

    let entityBox = new Box();
    entityBox.clear();
    entityBox.addOBB(entity.sizeBox, entity.matrix);
    let wallBox = wall.box;
    if (wall.data.wall) {
      wallBox = wallBox.copy();
      wallBox.minx = wallBox.maxx = wallBox.centerx;
      for (let interval of wall.data.wall.roomIntervals) {
        wallBox.addCoord(interval.t1, 0);
        wallBox.addCoord(interval.t2, 0);
      }
    }
    if (entityBox.maxx + dir[0] > wallBox.maxx) {
      dir[0] = wallBox.maxx - entityBox.maxx;
    }
    if (entityBox.minx + dir[0] < wallBox.minx) {
      dir[0] = wallBox.minx - entityBox.minx;
    }
    if (entityBox.maxy + dir[1] > wallBox.maxy) {
      dir[1] = wallBox.maxy - entityBox.maxy;
    }
    if (entityBox.miny + dir[1] < wallBox.miny) {
      dir[1] = wallBox.miny - entityBox.miny;
    }
    return wall.NtoGlobal(dir);
  }

  private moveInsideWalls(mouse: MouseInfo) {
    let ray = this.createRay(mouse);
    ray.filter = (e: Entity) => {
      return (
        e.data.floor || e.data.roof || e.data.slope ||
        (e.parent.data.floor &&
          (this.isWall(e) || e.data.room))
      );
    };
    this.intersect(ray);
    let selected = this.ds.selected;
    if (selected && this.isWallElement(selected) && selected.parent) {
      this.intersectRayWithWall(ray, selected.parent);
    }
    if (ray.intersected) {
      let cameraDir = this.ds.camera.viewDir;
      let orthoMode = glMatrix.equalsd(Math.abs(cameraDir[1]), 1);
      let newPos = ray.intersectPos;
      let dir = vec3.fsub(newPos, this.ds.selection.globalPos);
      if (
        selected &&
        (selected.parent === ray.entity || !this.isWall(ray.entity))
      ) {
        dir = this.limitMoveInsideWall(dir, selected, orthoMode);
      }
      // fix object elevation when moving on plan
      if (orthoMode && !this.initialMove) {
        dir[1] = 0;
      }
      this.translateSelection(dir);
      if (
        this.isWall(ray.entity) &&
        this.ds.selected &&
        this.ds.selected.parent !== ray.entity
      ) {
        this.putIntoWall(this.ds.selected, ray.entity);
      }
    }
  }

  protected _curContainer: Entity;
  protected _curContainerIndex: number;

  private moveToContainer(mouse: MouseInfo) {
    let ray = this.createRay(mouse);
    let container: Entity;
    let selected = this.ds.selected;
    // it prevents inserting model inside containers formed by itself as splitter
    // TODO: relax this condition in future
    // and forbid to insert into neighboring containers only
    if (selected.parent.elastic && selected.parent.elastic.container) {
      let oldRay = ray.toArray();
      ray.transform(selected.parent.invGlobalMatrix);
      if (ray.intersectBox(selected.parent.sizeBox)) {
        container = selected.parent;
      }
      ray.fromArray(oldRay);
    }
    let filterContainerByType = (container: Entity) => {
      let type = container.type;
      if (type === '*') {
        return true;
      }
      let len = type.length;
      if (len > 2 && type.charAt(0) === '/' && type.charAt(len - 1) === '/') {
        let regExp = new RegExp(type.slice(1, -1));
        return !!selected.type.match(regExp);
      }
      return type === selected.type;
    }
    let filter = filterContainerByType;
    let position = selected.elastic.position;
    let elp = pb.Elastic.Position;
    if (selected.data.symmetry && (position === elp.Left || position === elp.Right)) {
      filter = c => filterContainerByType(c) && !!c.data.symmetry;
    }
    if (!container) {
      container = ContainerManager.findContainer(ray, this.root, filter);
    }

    let canInsertToContainer = false;
    if (container) {
      canInsertToContainer = true;
      let splitter = position === elp.VSplitter || position === elp.HSplitter || position === elp.FSplitter;
      let hasInsertedModels = container.children && container.children.some(e => e !== selected && e.data.model);
      // try to find container with the same splitters
      if (splitter && !hasInsertedModels) {
        let p = container.parent;
        if (p && p.elastic && p.elastic.container
          && p.children && p.children.some(child => child.elastic && child.elastic.position === position)) {
          container = p;
        }
      }

      // select top most container for doors
      if (position === elp.Front && !mouse.ctrl) {
        let p = container.findParent(c => c.elastic && c.elastic.container, true);
        if (p) {
          container = p;
        }
      }


      if (!this.containerManager) {
        this.containerManager = new ContainerManager(this.ds);
      }
      let intPos = container.toLocal(ray.intersectPos);
      let { box, index } = ContainerManager.containerFreeBox(container, intPos, selected);
      let pos = box.center;
      let moveBox = selected.sizeBox;
      let movePos = selected.sizeBox.center
      if (splitter) {
        index = -1;
      }
      if (selected.data.symmetry && container.data.symmetry) {
        if (selected.data.symmetry * container.data.symmetry < 0) {
          position = ContainerManager.symmetryElasticPosition(position);
        }
      }

      let moveCoord = ContainerManager.getMovingAxis(position);
      if (moveCoord >= 0) {
        pos[moveCoord] = this.containerManager.alignPointCoordinate(intPos, position, container, selected);
      } else {
        switch (position) {
          case elp.Left: pos[0] = box.minx; movePos[0] = moveBox.minx; break;
          case elp.Right: pos[0] = box.maxx; movePos[0] = moveBox.maxx; break;
          case elp.Bottom: pos[1] = box.miny; movePos[1] = moveBox.miny; break;
          case elp.Top: pos[1] = box.maxy; movePos[1] = moveBox.maxy; break;
          case elp.Back: pos[2] = box.minz; movePos[2] = moveBox.minz; break;
          case elp.Front: pos[2] = box.maxz; movePos[2] = moveBox.maxz; break;
          case elp.LeftRight:
            if (intPos[0] < pos[0]) {
              pos[0] = box.minx;
              movePos[0] = moveBox.minx;
            } else {
              pos[0] = box.maxx;
              movePos[0] = moveBox.maxx;
            }
            break;
          case elp.TopBottom:
            if (intPos[1] < pos[1]) {
              pos[1] = box.miny;
              movePos[1] = moveBox.miny;
            } else {
              pos[1] = box.maxy;
              movePos[1] = moveBox.maxy;
            }
            break;
        }
      }
      canInsertToContainer = this.containerManager.canFit(selected, container);
      if (canInsertToContainer) {
        if (selected.parent === container) {
          selected.setIdentityTransform();
          selected.translate(vec3.fsub(pos, movePos));
          this._curContainerIndex = index;
        } else {
          this._curContainer = container;
          this._curContainerIndex = index;
          selected.parent = this.root;
          selected.setIdentityTransform();
          selected.translate(vec3.fsub(pos, movePos));
          selected.matrix = mat4.fmultiply(container.globalMatrix, selected.matrix);
        }
        selected.visible = true;
        // this.hint = '';
      } else {
        // this.hint = 'Невозможно расположить элемент в контейнере';
      }
    }
    let parentIsContainer = selected.parent && selected.parent.elastic && selected.parent.elastic.container;
    let withoutContainer = !parentIsContainer && !this._curContainer;
    if (!canInsertToContainer && (this.initialMove || withoutContainer || mouse.ctrl)) {
      if (mouse.ctrl || !this._curContainer) {
        this._curContainer = undefined;
      }
      selected.parent = this.root;
      this.moveDefault(mouse);
    }
  }

  findEntityForReplace(mouse: MouseInfo) {
    let ray = this.createRay(mouse);
    let selected = this.ds.selected;
    let elp = pb.Elastic.Position;
    this._entityForReplace = undefined;
    this.root.forEach(child => {
      let isBothContainerItems = ContainerManager.isContainerItem(selected) && ContainerManager.isContainerItem(child);
      let isBothNotContainerItems = !ContainerManager.isContainerItem(selected) && !ContainerManager.isContainerItem(child);
      let sameElastic = selected.elastic && child.elastic && selected.elastic.position === child.elastic.position;
      let position = sameElastic && selected.elastic.position;
      let isNotIdentical = (child.name !== selected.name || isBothNotContainerItems);
      let forceReplace = position === elp.Fill || mouse.ctrl;
      let isSameType = child.type === selected.type && (isBothContainerItems || isBothNotContainerItems);
      let canBeReplaced = child.data.model || child.type;
      let checkIsContainerModeOrCtrl = sameElastic || (mouse.ctrl && isBothNotContainerItems);
      let isReplaceable = canBeReplaced && checkIsContainerModeOrCtrl && isSameType;
      if (child !== selected && (isNotIdentical || forceReplace) && isReplaceable) {
        let oldRay = ray.toArray();
        ray.transform(child.invGlobalMatrix);
        if (ray.intersectBox(child.box)) {
          this._entityForReplace = child;
        }
        ray.fromArray(oldRay);
      }
    });
    if (this._entityForReplace) {
      selected.visible = true;
      let replacableEnt = this._entityForReplace;
      if (ContainerManager.isContainerItem(replacableEnt) && ContainerManager.isElasticContainer(replacableEnt.parent)) {
        if (!this.containerManager) {
          this.containerManager = new ContainerManager(this.ds);
        }
        if (!this.containerManager.canFit(selected, replacableEnt.parent)) {
          return false;
        }
        this._curContainer = replacableEnt.parent;
      }
      selected.parent = this.root;
      selected.matrix = mat4.fcopy(replacableEnt.globalMatrix);
      let selectedCenter = selected.sizeBox.center;
      let originalCenter = replacableEnt.sizeBox.center;
      if (!selected.elastic || !selected.elastic.position) {
        selectedCenter[1] = selected.sizeBox.miny;
        originalCenter[1] = replacableEnt.sizeBox.miny;
      }
      selectedCenter = selected.toGlobal(selectedCenter);
      originalCenter = replacableEnt.toGlobal(originalCenter);
      selected.translate(vec3.fsub(originalCenter, selectedCenter));
      return true;
    }
    return false;
  }

  findSameEntities(original: Entity, searchRoot: Entity, exclude?: Entity[]) {
    let sameEntities: Entity[] = [];
    let isContainerMode = ContainerManager.isContainerItem(original);
    searchRoot.forEach(e => {
      let searchCondition = e.name === original.name && e.type === original.type;
      let excludeE = exclude && exclude.includes(e);
      if (isContainerMode) {
        searchCondition = searchCondition && e.elastic && e.elastic.position === original.elastic.position;
      }
      if (!excludeE && searchCondition) {
        sameEntities.push(e);
      }
    });
    return sameEntities;
  }


  protected move(mouse: MouseInfo) {
    if (this._moveSelection) {
      let selected = this.ds.selected;
      let containerMode = ContainerManager.isContainerItem(selected);
      let wallMode = this._mountType === MountType.InsideWall ||
        this._mountType === MountType.InsideWallAtBottom;
      let moved = false;
      if (selected) {
        let canReplace = selected.data.model || selected.type;
        if (this.initialMove && canReplace && (containerMode || mouse.ctrl)) {
          if (this.findEntityForReplace(mouse)) {
            moved = true;
          }
        }
      }
      if (!moved) {
        this._entityForReplace = undefined;
        if (containerMode) {
          this.moveToContainer(mouse);
        } else if (wallMode) {
          this.moveInsideWalls(mouse);
        } else {
          this.moveDefault(mouse);
        }
      }
      this.ds.modelChanged();
    } else if (
      mouse.left &&
      this.moving &&
      this._clickedEntity &&
      this._clickedEntity.selected &&
      this.canStartMove()
    ) {
      this.startMove();
    } else {
      super.move(mouse);
    }
  }

  protected down(mouse: MouseInfo) {
    super.down(mouse);
    let ray = this.createRay(mouse);
    if (this.intersect(ray)) {
      let entity = <Entity>ray.entity;
      entity = this.takeEntity(entity);
      this._clickedEntity = entity;
      if (!this._moveSelection && entity === this.ds.selection.pivot) {
        this.ds.selection.pos = this.ds.selection.pivot.toLocal(ray.intersectPos);
      }
    }
  }

  protected up(mouse: MouseInfo) {
    this.endMove();
    if (mouse.middle) {
      let ray = this.createRay(mouse);
      if (this.intersect(ray)) {
        let entity = <Entity>ray.entity;
        let animEntity;
        while (entity) {
          if (entity.anim) {
            animEntity = entity;
          }
          entity = entity.parent;
        }
        if (animEntity) {
          this.ds.animateEntity(animEntity);
        }
        this._clickedEntity = entity;
      }
    }
    super.up(mouse);
  }
}

export class DragDropTool extends MoveTool {
  private _dragModel: Entity;

  constructor(ds: Designer, model: string, name: string, sku?: string, insertInfo?: string) {
    super(ds);
    let request = {
      name: 'Insert model',
      undo: 'start',
      type: 'insert-model',
      insertModelId: model,
      flushModelId: model, // intercepted by server dispatch
      modelName: name,
      modelId: "0",
      parentId: ds.rootId,
      sku
    };
    this.hint = 'Загрузка модели...';
    if (insertInfo) {
      let newModel = createReplica(ds, insertInfo);
      newModel.data.model = { id: model, rev: 0 };
      request.modelId = newModel.uidStr;
      this.initModelDrag(newModel);
      // to avoid model jump on server sync
      if (!ContainerManager.isContainerItem(newModel)) {
        this.ds.dragTarget = newModel;
      }
    }
    ds.execute(request).then(data => this.onModelInsert(data));
  }

  openDoors = true;

  isWallElement(e: Entity) {
    return (
      this._mountType === MountType.InsideWall ||
      this._mountType === MountType.InsideWallAtBottom
    );
  }

  onModelInsert(data: any) {
    if (this.finished) {
      return;
    }
    let model = this.ds.entityMap[data.modelId];
    if (model) {
      this.ds.dragTarget = undefined;
      this.initModelDrag(model);
    }
  }

  private initModelDrag(model: Entity) {
    this._mountType = model.data.mountType;
    let modelBox = model.sizeBox;
    let movePoint = modelBox.center;
    movePoint[1] = modelBox.miny;
    this.ds.selected = model;
    this.ds.selection.pos = vec3.fcopy(movePoint);
    if (this.moveSelection) {
      this.updateMove();
    } else {
      // always start move on the floor
      // because if mountType is floor model won't jump on floor until
      // user point on it
      let targetPos = this.ds.box.center;
      targetPos[1] = 0;
      model.translate(vec3.fsub(targetPos, model.toGlobal(movePoint)));
      this.startMove(true);
      model.visible = false;
    }
    this._dragModel = model;
    this.invalidate();
    this.hint = 'Укажите положение объекта';
    this.mousePressed = true;
  }

  protected move(mouse: MouseInfo) {
    if (this._dragModel) {
      super.move(mouse);
    }
  }

  private tryToAnimateModel(m: Entity) {
    let anims = new Array<Entity>();
    let findAnims = (e: Entity) => {
      if (e.children) {
        for (let child of e.children) {
          if (child.anim) {
            anims.push(child);
          }
          findAnims(child);
        }
      }
    };
    findAnims(m);
    if (anims.length === 1) {
      this.ds.animateEntity(anims[0]);
      return true;
    }
  }

  endMove() {
    super.endMove(!!this._dragModel);
    if (this._dragModel) {
      if (!this._curContainer && this._dragModel.parent &&
        this._dragModel.parent.data.wall && this.openDoors) {
        // animate windows and doors
        this.tryToAnimateModel(this._dragModel);
      }
      this._dragModel = undefined;
    }
    this.finish();
  }

  protected finishing() {
    if (this._dragModel) {
      if (this.canceled || !this._dragModel.visible) {
        this.ds.execute({ undo: 'cancel' });
        this._dragModel.delete();
        this._dragModel = undefined;
      } else {
        this.ds.selection.pos = this._dragModel.box.center;
        this.endMove();
      }
    }
  }
}
