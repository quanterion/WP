import { glMatrix } from './geometry/common';
import { vec3 } from './geometry/vec3';
import { mat4 } from './geometry/mat4';
import { plane } from './geometry/plane';
import { Entity } from './designer';
import * as actions from './actions';
import * as geom from './geometry/geometry';
import * as galgo from './geometry/geom_algorithms';
import { FloorBuilder, PlanWall } from './floorplanner';

const AUX_LINE_SIZE = 100000;
const AUX_LINE_COLOR = '4090FF';
const AUX_LINE_THICKNESS = 1.0;

export class DrawingOptions {
  walls = true;
  corners = true;
  aux = true;
  rooms = true;
  wallId?: number;
  roomId?: string;
  roomColor = '999';
  wallColor = 'BBB';
  fillColor = '9CBC1A';
  highlightColor = '1ABC9C';
  selectedRoom?: string;
}

export function makeFloorDrawing(
  floor: Entity,
  floorBuilder: FloorBuilder,
  options: DrawingOptions
) {
  let contour = new geom.Contour();
  let isWallSelected = (w: PlanWall) =>
    w && (w.elem.selected || w.elem.id === options.wallId);
  let someWallsSelected = false;

  for (let wall of floorBuilder.walls) {
    let selected = isWallSelected(wall);
    if (!selected && !options.walls) continue;
    let wallContour = floorBuilder.makeWallContour(wall);
    wallContour.fillColor = options.fillColor;
    wallContour.tagData = {
      selected,
      edit: {
        type: 'movewall',
        elemId: wall.elem.id
      }
    };
    if (selected) {
      someWallsSelected = true;
      wallContour.selected = true;
    }
    if (!options.corners && selected) {
      let pos = wall.from.pos;
      contour.addPoint(wall.from.pos).tagData = {
        edit: { type: 'move-point', pos }
      };
      pos = wall.to.pos;
      contour.addPoint(wall.to.pos).tagData = {
        edit: { type: 'move-point', pos }
      };
    }
    contour.add(wallContour);
  }

  for (let floorRoom of floorBuilder.rooms) {
    let roomContour = floorRoom.contour;
    let area = galgo.contourArea(roomContour);
    let roomCenter = galgo.choosePointInsideContour(roomContour, area);
    let prefix = 'Area = ';
    let roomEntity = floorBuilder.findRoomEntity(floorRoom.name);
    if (roomEntity && roomEntity.name) {
      prefix = roomEntity.name + '\n';
    }
    contour.addText(
      roomCenter,
      `${prefix}${floor.ds.floatToStr(area * 1e-6)} m2`
    ).hideIfOverlap = true;

    let roomSelected = (options.roomId === floorRoom.name) || (options.roomId === '*');
    for (let k = 0; k < roomContour.items.length; k++) {
      let line = roomContour.items[k].line;
      if (options.rooms) {
        let roomBorderLine = contour.add(line.clone());
        roomBorderLine.color = options.roomColor;
        if (roomSelected) {
          roomBorderLine.color = options.highlightColor;
        }
      }
      let curWall = floorBuilder.findWall(line.id);

      if (someWallsSelected) {
        let prevLine =
          roomContour.items[(k - 1 + roomContour.count) % roomContour.count]
            .line;
        let nextLine = roomContour.items[(k + 1) % roomContour.count].line;

        let prevWall = floorBuilder.findWall(prevLine.id);
        let nextWall = floorBuilder.findWall(nextLine.id);
        if (!prevWall || !nextWall) {
          continue;
        }
        let useSize =
          isWallSelected(prevWall) ||
          isWallSelected(nextWall) ||
          (curWall &&
            (isWallSelected(curWall.from.touch) ||
              isWallSelected(curWall.to.touch)));
        if (!useSize) {
          continue;
        }
      }

      if (someWallsSelected || roomSelected) {
        let normDir = line.normDir;
        let perpDir = normDir.perpCW();
        if (!curWall || floorBuilder.isInteriorWall(line.id)) {
          perpDir.negate();
        }
        let textPos = geom.addScale(line.middle, perpDir, 300);
        let size = contour.addSize(line.p1, line.p2, textPos);
        if (curWall) {
          size.tagData = {
            edit: {
              type: 'editwall',
              floorId: floor.uidStr,
              roomName: floorRoom.name,
              elemId: line.id,
              pos: line.middle,
              wallId: options.wallId,
              directional: !options.wallId
            }
          };
        }
      }
    }
  }

  let addSizeAlongLine = (
    line: geom.Line,
    rightOffset: boolean,
    t1: number,
    t2: number,
    editData: any
  ) => {
    let normDir = line.normDir;
    let perpDir = rightOffset ? normDir.perpCW() : normDir.perpCCW();
    let p1 = geom.addScale(line.p1, normDir, t1);
    let p2 = geom.addScale(line.p1, normDir, t2);
    let textPos = geom.addScale(geom.middle(p1, p2), perpDir, 300);
    let size = contour.addSize(p1, p2, textPos);
    size.tagData = {
      edit: editData
    };
  };

  // add size for free standing walls that doesn't make any rooms
  for (let wall of floorBuilder.walls) {
    if (wall.children.length > 0) continue;
    let needSizes =
      isWallSelected(wall) ||
      isWallSelected(wall.from.touch) ||
      isWallSelected(wall.to.touch);
    if (needSizes) {
      let limits = floorBuilder.computeWallLimits(wall);
      let line = wall.elem.line;
      addSizeAlongLine(line, true, limits.tRightMin, limits.tRightMax, {
        type: 'editwall',
        floorId: floor.uidStr,
        elemId: line.id,
        oldSize: limits.tRightMax - limits.tRightMin
      });
      addSizeAlongLine(line, false, limits.tLeftMin, limits.tLeftMax, {
        type: 'editwall',
        floorId: floor.uidStr,
        elemId: line.id,
        oldSize: limits.tLeftMax - limits.tLeftMin
      });

      let addTouchSizes = (touchWall: PlanWall) => {
        // tmin ..tmax - interval on the correct side of touch wall
        let touchLine = touchWall.elem.line;
        let right = touchLine.evalPoint(line.middle) > 0;
        let touchLimits = floorBuilder.computeWallLimits(touchWall);
        let tmin = right ? touchLimits.tRightMin : touchLimits.tLeftMin;
        let tmax = right ? touchLimits.tRightMax : touchLimits.tLeftMax;

        // interval - projection of wall on touch wall
        let inter = touchWall.computeWallIntersection(
          wall,
          right,
          floorBuilder.calcWallOffsetFunction
        );
        if (!inter) {
          return;
        }

        // try to limit tmin .. tmax interval to surrounding walls
        for (let ttouch of touchWall.touch) {
          for (let twall of ttouch.walls) {
            if (
              twall !== wall &&
              touchLine.evalPoint(twall.elem.line.middle) > 0 === right
            ) {
              let tinter = touchWall.computeWallIntersection(
                twall,
                right,
                floorBuilder.calcWallOffsetFunction
              );
              if (tinter) {
                if (tinter.t2 > tmin && tinter.t2 < inter.t1) {
                  tmin = tinter.t2;
                }
                if (tinter.t1 < tmax && tinter.t1 > inter.t2) {
                  tmax = tinter.t1;
                }
              }
            }
          }
        }

        let normDir = touchLine.normDir;
        if (inter && touchLimits) {
          if (inter.t1 - tmin > 1) {
            addSizeAlongLine(touchLine, right, tmin, inter.t1, {
              type: 'shiftwall',
              floorId: floor.uidStr,
              wallId: line.id,
              oldSize: inter.t1 - tmin,
              dirx: normDir.x,
              diry: normDir.y
            });
          }
          if (tmax - inter.t2 > 1) {
            addSizeAlongLine(touchLine, right, inter.t2, tmax, {
              type: 'shiftwall',
              floorId: floor.uidStr,
              wallId: line.id,
              oldSize: tmax - inter.t2,
              dirx: -normDir.x,
              diry: -normDir.y
            });
          }
        }
      };

      if (wall.from.touch) {
        addTouchSizes(wall.from.touch);
      } else {
        for (let nearWall of wall.from.walls) {
          if (nearWall !== wall) {
            addTouchSizes(nearWall);
          }
        }
      }
      if (wall.to.touch) {
        addTouchSizes(wall.to.touch);
      } else {
        for (let nearWall of wall.to.walls) {
          if (nearWall !== wall) {
            addTouchSizes(nearWall);
          }
        }
      }
    }
  }

  if (options.corners && options.walls) {
    for (let corner of floorBuilder.corners) {
      contour.addPoint(corner.pos).tagData = {
        edit: { type: 'move-point', pos: corner.pos.clone() }
      };
    }
  }

  if (options.aux) {
    for (let elem of floorBuilder.map.items) {
      if (elem.line && elem.line.aux) {
        let aux = contour.add(elem.clone());
        aux.color = AUX_LINE_COLOR;
        aux.thickness = AUX_LINE_THICKNESS;
      }
    }
  }
  return contour;
}

export function createFloorDrawing(
  item: Entity,
  dest: Entity,
  plan: FloorBuilder,
  activePoint?: geom.Vector,
  selectedWall?: number,
  selectedRoom?: string,
  alignInfo?: galgo.PointAlignInfo,
  wallsAndCorners = true
) {
  let roomBox = item.box;
  dest.contentBox = item.box.copy();
  dest.contentBox.enlarge(500);
  let sizePos = vec3.fromValues(
    roomBox.center[0],
    roomBox.min[1],
    roomBox.center[2]
  );
  dest.translation = item.toGlobal(sizePos);
  dest.orient(item.NtoGlobal(vec3.axisy), item.NtoGlobal(vec3.axis_z));

  if (activePoint) {
    let corner = plan.corners.find(c => c.pos.equals(activePoint));
    if (corner) {
      corner.walls.forEach(w => (w.elem.selected = true));
    }
  }

  let options = new DrawingOptions();
  options.wallId = selectedWall;
  options.roomId = selectedRoom;
  options.walls = wallsAndCorners;
  options.corners = wallsAndCorners;
  options.rooms = wallsAndCorners;
  if (!plan.check()) {
    options.wallColor = 'FF0000';
  }
  let contour = makeFloorDrawing(item, plan, options);
  dest.drawing = contour;

  if (activePoint) {
    contour.addPoint(activePoint).selected = true;
  }

  if (alignInfo && activePoint) {
    if (alignInfo.xfixed) {
      let line = contour.addLinexy(
        activePoint.x,
        -AUX_LINE_SIZE,
        activePoint.x,
        AUX_LINE_SIZE
      );
      line.color = AUX_LINE_COLOR;
      line.thickness = AUX_LINE_THICKNESS;
    }
    if (alignInfo.yfixed) {
      let line = contour.addLinexy(
        -AUX_LINE_SIZE,
        activePoint.y,
        AUX_LINE_SIZE,
        activePoint.y
      );
      line.color = AUX_LINE_COLOR;
      line.thickness = AUX_LINE_THICKNESS;
    }
    if (alignInfo.line) {
      let snapLine = alignInfo.line;
      let pos = snapLine.middle;
      let dir = snapLine.normDir;
      let p1 = geom.addScale(pos, dir, -AUX_LINE_SIZE);
      let p2 = geom.addScale(pos, dir, AUX_LINE_SIZE);
      let line = contour.addLine(p1, p2);
      line.color = AUX_LINE_COLOR;
      line.thickness = AUX_LINE_THICKNESS;
    }
  }

  let transformation = mat4.fromXRotation(mat4.create(), Math.PI * 0.5);
  mat4.mul(transformation, item.globalMatrix, transformation);
  mat4.mul(transformation, dest.invMatrix, transformation);
  contour.transform(transformation);
  dest.boxChanged();
  dest.changed();
  return contour;
}

export class FloorMapEditorTool extends actions.CameraAction {
  constructor(private _floor: Entity) {
    super(_floor.ds);
    this.startDrag('floormapeditortool');
    this._plan = new FloorBuilder(_floor);
    this._plan.init();
    this._roomPlane = plane.createPN(
      _floor.toGlobal(vec3.origin),
      _floor.NtoGlobal(vec3.axisy)
    );
    this._floorContour = this._plan.map.clone();
    this.bindContour = this._plan.map.clone();
    this.resetContour();
  }

  protected selectedWall?: number;
  protected wallsAndCorners = true;
  protected _plan: FloorBuilder;
  private _floorContour: geom.Contour;
  protected bindContour: geom.Contour;
  public newContour: geom.Contour;
  private _roomPlane;
  protected _preview: Entity;

  protected resetContour() {
    this.newContour = this._floorContour.clone();
  }

  protected moveTo(dest: geom.Vector) {
    // abstract
  }

  protected move(mouse: actions.MouseInfo) {
    let ray = this.createRay(mouse);
    if (ray.intersectPlane(this._roomPlane)) {
      let pos3d = this._floor.toLocal(ray.intersectPos);
      let pos2d = new geom.Vector(pos3d[0], pos3d[2]);
      let alignInfo = new galgo.PointAlignInfo();
      let alignedPoint = pos2d;
      // shift disables point snapping
      if (!mouse.shift) {
        alignedPoint = galgo.alignPosition(
          this.bindContour,
          pos2d,
          this.ds.unitsInPixel() * 10,
          undefined,
          alignInfo
        );
      }
      this.moveTo(alignedPoint);
      this.updateDrawing(alignedPoint, alignInfo);
    }
    super.move(mouse);
  }

  protected updateDrawing(activePoint?: geom.Vector, alignInfo?: galgo.PointAlignInfo) {
    if (!this._preview) this._preview = this.ds.temp.addChild();
    this._plan.updateMap(this.newContour);
    createFloorDrawing(
      this._floor,
      this._preview,
      this._plan,
      activePoint,
      this.selectedWall,
      undefined,
      alignInfo,
      this.wallsAndCorners
    );
    this.invalidate();
  }

  protected up(mouse: actions.MouseInfo) {
    this.finish();
  }

  protected finishing() {
    if (this._preview) {
      this._preview.delete();
      this._preview = undefined;
    }
    super.finishing();
  }
}

export class FloorCornerTool extends FloorMapEditorTool {
  constructor(floor: Entity, point: geom.Vector) {
    super(floor);
    this._sourcePos = point.clone();
    this.fillMovingPoints(this.newContour);
  }

  private _sourcePos: geom.Vector;
  private _movingPoints: Array<geom.Vector> = [];
  private _movingElems: number[] = [];

  private fillMovingPoints(contour: geom.Contour) {
    for (let elem of contour.items) {
      if (elem.line) {
        if (elem.line.p1.equals(this._sourcePos)) {
          this._movingPoints.push(elem.line.p1);
          this._movingElems.push(elem.id);
        }
        if (elem.line.p2.equals(this._sourcePos)) {
          this._movingPoints.push(elem.line.p2);
          this._movingElems.push(elem.id);
        }
      } else if (elem.point) {
        if (elem.point.pos.equals(this._sourcePos))
          this._movingPoints.push(elem.point.pos);
      }
    }
  }

  protected moveTo(dest: geom.Vector) {
    for (let pos of this._movingPoints) pos.assign(dest);
    for (let id of this._movingElems) {
      let wall = this._plan.findWall(id);
      wall.ensureTouchConstraints();
    }
  }
}

export class AddFloorLedgeTool extends FloorMapEditorTool {
  constructor(
    floor: Entity,
    elemIndex1: number,
    elemIndex2: number
  ) {
    super(floor);
    let newContour = this.newContour;
    this._line1 = newContour.items[elemIndex1].line;
    this._line2 = newContour.items[elemIndex2].line;
    this._newLine1 = new geom.Line();
    this._newLine2 = new geom.Line();
    newContour.insert(this._newLine1, elemIndex2);
    newContour.insert(this._newLine2, elemIndex2 + 1);
    this._sourcePos = this._line1.p2.clone();
  }

  private _sourcePos: geom.Vector;
  private _line1: geom.Line;
  private _line2: geom.Line;
  private _newLine1: geom.Line;
  private _newLine2: geom.Line;

  protected moveTo(dest: geom.Vector) {
    let dir1 = geom.subtract(this._sourcePos, this._line1.p1);
    let t1 = geom.pointLineProjectionPar(dest, this._line1.p1, dir1);
    let dir2 = geom.subtract(this._line2.p2, this._sourcePos);
    let t2 = geom.pointLineProjectionPar(dest, this._sourcePos, dir2);
    if (
      t1 > glMatrix.EPSILON &&
      t1 < 1 - glMatrix.EPSILON &&
      t2 > glMatrix.EPSILON &&
      t2 < 1 - glMatrix.EPSILON
    ) {
      let p1 = geom.addScale(this._line1.p1, dir1, t1);
      let p2 = geom.addScale(this._sourcePos, dir2, t2);

      this._line1.p2.assign(p1);
      this._newLine1.p1.assign(p1);
      this._newLine1.p2.assign(dest);
      this._newLine2.p1.assign(dest);
      this._newLine2.p2.assign(p2);
      this._line2.p1.assign(p2);
    }
  }
}

export class AddFloorBevelTool extends FloorMapEditorTool {
  constructor(
    floor: Entity,
    elemIndex1: number,
    elemIndex2: number
  ) {
    super(floor);
    let newContour = this.newContour;
    this._line1 = newContour.items[elemIndex1].line;
    this._line2 = newContour.items[elemIndex2].line;
    this._bevelTangent = geom.add(this._line1.normDir, this._line2.normDir);
    this._bevelTangent.normalize();
    this._bevelLine = new geom.Line();
    newContour.insert(this._bevelLine, elemIndex2);
    this._sourcePos = this._line1.p2.clone();
  }

  private _sourcePos: geom.Vector;
  private _line1: geom.Line;
  private _line2: geom.Line;
  private _bevelTangent: geom.Vector;
  private _bevelLine: geom.Line;

  protected moveTo(dest: geom.Vector) {
    let dir1 = geom.subtract(this._sourcePos, this._line1.p1);
    let dir2 = geom.subtract(this._line2.p2, this._sourcePos);
    let params1 = geom.lineLineIntersect(
      this._line1.p1,
      dir1,
      dest,
      this._bevelTangent
    );
    let params2 = geom.lineLineIntersect(
      this._sourcePos,
      dir2,
      dest,
      this._bevelTangent
    );
    if (params1 && params2) {
      if (
        params1[0] > glMatrix.EPSILON &&
        params1[0] < 1 - glMatrix.EPSILON &&
        params2[0] > glMatrix.EPSILON &&
        params2[0] < 1 - glMatrix.EPSILON
      ) {
        let p1 = geom.addScale(this._line1.p1, dir1, params1[0]);
        let p2 = geom.addScale(this._sourcePos, dir2, params2[0]);

        this._line1.p2.assign(p1);
        this._bevelLine.p1.assign(p1);
        this._bevelLine.p2.assign(p2);
        this._line2.p1.assign(p2);
      }
    }
  }
}

export class SplitWallTool extends FloorMapEditorTool {
  constructor(floor: Entity, private wallId: number) {
    super(floor);
    let newContour = this.newContour;
    let elem = newContour.find(wallId);
    this._line1 = elem.line;
    this._line2 = new geom.Line();
    this._line2.p2.assign(this._line1.p2);
    newContour.add(this._line2);
  }

  private _line1: geom.Line;
  private _line2: geom.Line;

  protected moveTo(dest: geom.Vector) {
    this._line1.p2.assign(dest);
    this._line2.p1.assign(dest);
  }
}

export class BuildWallTool extends FloorMapEditorTool {
  constructor(floor: Entity) {
    super(floor);
    this.hint = 'Choose the first point of a new wall';
    this.addCommand('APPLY', () => {
      if (this._newLine) {
        this.newContour.removeById(this._newLine.id);
      }
      this.finish();
    });
  }

  private _lastPoint: geom.Vector;
  private _lastMovePoint: geom.Vector;
  private drawLine = false;
  private _newLine: geom.Line;

  protected moveTo(dest: geom.Vector) {
    this._lastMovePoint = dest.clone();
    if (this.drawLine) {
      if (!this._newLine) {
        this._newLine = this.newContour.addLine(
          this._lastPoint,
          dest
        );
        this._newLine.ensureId();
        this._newLine.selected = true;
        this.selectedWall = this._newLine.id;
      }
      this._newLine.p2.assign(dest);
    }
  }

  protected leave(mouse: actions.MouseInfo) {
    if (this._newLine) {
      this.newContour.removeById(this._newLine.id)
      this._newLine = undefined;
      this.selectedWall = undefined;
      this.updateDrawing();
    }
  }

  protected down(mouse: actions.MouseInfo) {}

  protected up(mouse: actions.MouseInfo) {
    if (!this.moving) {
      if (
        this._lastPoint &&
        this._lastMovePoint &&
        this.bindContour.distanceFilter(
          this._lastMovePoint,
          e => e.line && !e.line.aux
        ) < geom.eps
      ) {
        this.finish();
      } else {
        this.bindContour = this.newContour.clone();
        this.bindContour.addPoint(this._lastMovePoint.clone());
        this._lastPoint = this._lastMovePoint;
        this._newLine = undefined;
        this.drawLine = true;
        this.hint = 'Choose next point to build the wall';
      }
    }
  }
}

export class MoveWallTool extends FloorMapEditorTool {
  constructor(floor: Entity, private _elemId: number) {
    super(floor);
    this.selectedWall = _elemId;
    let selected = floor.ds.selected;
    this.wallsAndCorners = !!(selected && selected.data.room);
  }

  protected moveTo(dest: geom.Vector) {
    this.resetContour();
    this._plan.updateMap(this.newContour);
    this._plan.moveWallTo(this._elemId, dest);
  }
}

export class AuxTool extends FloorMapEditorTool {
  aux: geom.Line;

  constructor(floor: Entity, private from: geom.Line) {
    super(floor);
    this.ds.startEditor(0, 0, 0, v => this.offsetEntered(v));
  }

  protected finishing() {
    this.ds.hideEditor();
    super.finishing();
  }

  private offsetEntered(value: number) {
    if (this.aux) {
      let pos = this.from.middle;
      let dir = this.from.normDir;
      if (this.from.evalPoint(this.aux.middle) < 0) {
        value = -value;
      }
      pos = geom.addScale(pos, dir.perpCW(), value);
      this.makeAux(pos);
      this.finish();
    }
  }

  private makeAux(pos: geom.Vector) {
    let dir = this.from.normDir;
    this.aux.p1 = geom.addScale(pos, dir, -AUX_LINE_SIZE);
    this.aux.p2 = geom.addScale(pos, dir, AUX_LINE_SIZE);
    this._plan.updateMap(this.newContour);
  }

  protected moveTo(dest: geom.Vector) {
    if (!this.aux) {
      this.aux = this.newContour.addLinexy(0, 0, 1, 1);
      this.aux.aux = true;
    }
    this.makeAux(dest);
    let editorPos = geom.middle(dest, this.from.middle);
    if (this._preview) {
      let distance = geom.pointLineDistance(
        dest,
        this.from.p1,
        this.from.normDir
      );
      this.ds.updateEditor(this.mouse.x + 50, this.mouse.y - 50, distance);
    }
  }
}
