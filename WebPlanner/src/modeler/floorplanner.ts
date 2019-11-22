import { glMatrix } from './geometry/common';
import { vec3 } from './geometry/vec3';
import { mat4 } from './geometry/mat4';
import { Box } from './geometry/box';
import * as geom from './geometry/geometry';
import * as galgo from './geometry/geom_algorithms';
import { Designer, Entity, BuilderApplyItem } from './designer';
import { Md5 } from './md5';

export class Corner<WallType> {
  constructor(public x: number, public y: number) {}

  get pos() {
    return new geom.Vector(this.x, this.y);
  }
  walls: WallType[] = [];
}

export class RoomCorner extends Corner<RoomWall> {
  findNextWall(wall: RoomWall) {
    let prevCorner = wall.from === this ? wall.to : wall.from;
    let prevDir = new geom.Vector(this.x - prevCorner.x, this.y - prevCorner.y);
    prevDir.normalize();
    let nextWall: RoomWall;
    let minAngle = 1 + 2; // normalized cosinus between previous and next direction
    for (let curWall of this.walls) {
      if (curWall.elem.id !== wall.elem.id && !curWall.internal) {
        let nextCorner = curWall.from === this ? curWall.to : curWall.from;
        let nextDir = new geom.Vector(
          nextCorner.x - this.x,
          nextCorner.y - this.y
        );
        nextDir.normalize();
        let curAngle = geom.dot(prevDir, nextDir);
        if (curAngle > -1.0 + geom.eps) {
          if (geom.cross(prevDir, nextDir) < 0) {
            curAngle = 2 - curAngle;
          }
          if (curAngle < minAngle) {
            nextWall = curWall;
            minAngle = curAngle;
          }
        }
      }
    }
    return nextWall;
  }

  get isInternal() {
    if (this.walls.length < 2) {
      return true;
    }
    let exits = 0;
    for (let wall of this.walls) {
      if (!wall.internal) {
        exits++;
      }
    }
    return exits < 2;
  }
}

export class WallCorner extends Corner<PlanWall> {
  touch: PlanWall;

  get isIsolated() {
    return !this.touch && this.walls.length <= 1;
  }
}

type CalcWallOffset = (id: number, right: boolean) => number;

export class Wall<CornerType> {
  constructor(
    // original elem
    public elem: geom.Element,
    public from: CornerType,
    public to: CornerType,
    protected _isInverted = false
  ) {}

  get isInverted() {
    return this._isInverted;
  }

  invert() {
    let temp = this.from;
    this.from = this.to;
    this.to = temp;
    this._isInverted = !this.isInverted;
  }
}

export class RoomWall extends Wall<RoomCorner> {
  internal = false;
  // room element
  wallElem: geom.Element;

  clone() {
    return new RoomWall(this.elem, this.from, this.to, this._isInverted);
  }

  inverted() {
    let result = new RoomWall(this.elem, this.to, this.from, !this._isInverted);
    result.internal = this.internal;
    return result;
  }

  dir() {
    return geom.subtract(this.to.pos, this.from.pos);
  }
}

interface RoomToFloorElementMap {
   [id: number]: number
};

class WallInterval {
  constructor(
    public id: number,
    public t1: number,
    public t2: number,
  ) {
  }

  add(int: WallInterval) {
    this.t1 = Math.min(this.t1, int.t1);
    this.t2 = Math.max(this.t2, int.t2);
    this.id = this.id ^ int.id;
  }

  inside(t: number) {
    return (t >= this.t1) && (t <= this.t2) ||
      (t <= this.t1) && (t >= this.t2);
  }

  intervalInside(small: WallInterval) {
    return this.inside(small.t1) && this.inside(small.t2);
  }

  get valid() {
    return this.t2 > this.t1;
  }

  swap() {
    let t1 = this.t1;
    this.t1 = this.t2;
    this.t2 = t1;
  }

  static newEmpty(id: number = 0) {
    return new WallInterval(id, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
  }

  get tmiddle() {
    return (this.t1 + this.t2) / 2;
  }
}

interface WallLimits {
  tRightMin: number;
  tLeftMin: number;
  tRightMax: number;
  tLeftMax: number;
}

export class PlanWall extends Wall<WallCorner> {
  // corners lying on this wall
  touch: WallCorner[] = [];
  // room walls
  children: RoomWall[] = [];

  clone() {
    return new PlanWall(this.elem, this.from, this.to, this._isInverted);
  }

  inverted() {
    return new PlanWall(this.elem, this.to, this.from, !this._isInverted);
  }

  dir() {
    return geom.subtract(this.to.pos, this.from.pos);
  }

  ensureTouchConstraints() {
    let elem = this.elem.line;
    let dest = elem.p1;
    let dir = elem.dir;
    for (let corner of this.touch) {
      for (let touchWall of corner.walls) {
        let touchLine = touchWall.elem.line;
        let inter = geom.lineLineIntersect(
          touchLine.p1,
          touchLine.dir,
          dest,
          dir
        );
        if (inter) {
          let interPos = geom.addScale(dest, dir, inter[1]);
          if (touchWall.from === corner) {
            touchWall.elem.line.p1.assign(interPos);
          } else {
            touchWall.elem.line.p2.assign(interPos);
          }
        }
      }
    }
  }

  computeWallIntersection(
    wall: PlanWall,
    right: boolean,
    offset: CalcWallOffset
  ): WallInterval {
    let leftOffset = offset(wall.elem.id, true);
    let rightOffset = offset(wall.elem.id, false);
    let elemDir = wall.dir().normalized();
    if (!elemDir) {
      elemDir = new geom.Vector(1, 0);
    }
    let elemPos = wall.from.pos;
    let rightLinePos = geom.addScale(elemPos, elemDir.perpCW(), rightOffset);
    let leftLinePos = geom.addScale(elemPos, elemDir.perpCCW(), leftOffset);

    let curDir = this.dir();
    curDir.normalize();
    let curPos = geom.addScale(
      this.from.pos,
      right ? curDir.perpCW() : curDir.perpCCW(),
      offset(this.elem.id, right)
    );
    let inter1 = geom.lineLineIntersect(curPos, curDir, rightLinePos, elemDir);
    let inter2 = geom.lineLineIntersect(curPos, curDir, leftLinePos, elemDir);
    if (inter1 && inter2) {
      let t1 = inter1[0];
      let t2 = inter2[0];
      return new WallInterval(0, Math.min(t1, t2), Math.max(t1, t2));
    }
  }

  computeLimits(offset: CalcWallOffset): WallLimits {
    let leftOffset = offset(this.elem.id, true);
    let rightOffset = offset(this.elem.id, false);
    let selfLength = this.elem.length;
    let elemDir = this.dir().normalized();
    if (!elemDir) {
      elemDir = new geom.Vector(1, 0);
    }
    let elemPos = this.from.pos;
    let rightLinePos = geom.addScale(elemPos, elemDir.perpCW(), rightOffset);
    let leftLinePos = geom.addScale(elemPos, elemDir.perpCCW(), leftOffset);
    let tRightMin = Number.NEGATIVE_INFINITY;
    let tLeftMin = Number.NEGATIVE_INFINITY;
    let tRightMax = Number.POSITIVE_INFINITY;
    let tLeftMax = Number.POSITIVE_INFINITY;

    for (let wall of this.from.walls) {
      if (wall !== this) {
        let curDir = wall.dir();
        let invert = false;
        if (wall.to !== this.from) {
          curDir.negate();
          invert = true;
        }
        curDir.normalize();
        let curPos = geom.addScale(
          wall.to.pos,
          curDir.perpCW(),
          offset(wall.elem.id, invert)
        );
        let inter = geom.lineLineIntersect(
          rightLinePos,
          elemDir,
          curPos,
          curDir
        );
        tRightMin = Math.max(tRightMin, inter ? inter[0] : 0);

        curPos = geom.addScale(
          wall.to.pos,
          curDir.perpCW(),
          -offset(wall.elem.id, !invert)
        );
        inter = geom.lineLineIntersect(leftLinePos, elemDir, curPos, curDir);
        tLeftMin = Math.max(tLeftMin, inter ? inter[0] : 0);
      }
    }
    if (this.from.touch) {
      let wall = this.from.touch;
      let curDir = wall.dir();
      curDir.normalize();

      let curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        offset(wall.elem.id, false)
      );
      let inter = geom.lineLineIntersect(rightLinePos, elemDir, curPos, curDir);
      tRightMin = Math.max(tRightMin, inter ? inter[0] : 0);

      curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        -offset(wall.elem.id, true)
      );
      inter = geom.lineLineIntersect(rightLinePos, elemDir, curPos, curDir);
      tRightMin = Math.max(tRightMin, inter ? inter[0] : 0);

      curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        offset(wall.elem.id, false)
      );
      inter = geom.lineLineIntersect(leftLinePos, elemDir, curPos, curDir);
      tLeftMin = Math.max(tLeftMin, inter ? inter[0] : 0);

      curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        -offset(wall.elem.id, true)
      );
      inter = geom.lineLineIntersect(leftLinePos, elemDir, curPos, curDir);
      tLeftMin = Math.max(tLeftMin, inter ? inter[0] : 0);
    }

    for (let wall of this.to.walls) {
      if (wall !== this) {
        let curDir = wall.dir();
        let invert = false;
        if (wall.from !== this.to) {
          curDir.negate();
          invert = true;
        }
        curDir.normalize();
        let curPos = geom.addScale(
          wall.to.pos,
          curDir.perpCW(),
          offset(wall.elem.id, invert)
        );
        let inter = geom.lineLineIntersect(
          rightLinePos,
          elemDir,
          curPos,
          curDir
        );
        tRightMax = Math.min(tRightMax, inter ? inter[0] : selfLength);

        curPos = geom.addScale(
          wall.to.pos,
          curDir.perpCW(),
          -offset(wall.elem.id, !invert)
        );
        inter = geom.lineLineIntersect(leftLinePos, elemDir, curPos, curDir);
        tLeftMax = Math.min(tLeftMax, inter ? inter[0] : selfLength);
      }
    }

    if (this.to.touch) {
      let wall = this.to.touch;
      let curDir = wall.dir();
      curDir.normalize();

      let curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        offset(wall.elem.id, false)
      );
      let inter = geom.lineLineIntersect(rightLinePos, elemDir, curPos, curDir);
      tRightMax = Math.min(tRightMax, inter ? inter[0] : selfLength);

      curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        -offset(wall.elem.id, true)
      );
      inter = geom.lineLineIntersect(rightLinePos, elemDir, curPos, curDir);
      tRightMax = Math.min(tRightMax, inter ? inter[0] : selfLength);

      curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        offset(wall.elem.id, false)
      );
      inter = geom.lineLineIntersect(leftLinePos, elemDir, curPos, curDir);
      tLeftMax = Math.min(tLeftMax, inter ? inter[0] : selfLength);

      curPos = geom.addScale(
        wall.to.pos,
        curDir.perpCW(),
        -offset(wall.elem.id, true)
      );
      inter = geom.lineLineIntersect(leftLinePos, elemDir, curPos, curDir);
      tLeftMax = Math.min(tLeftMax, inter ? inter[0] : selfLength);
    }

    if (tRightMin === Number.NEGATIVE_INFINITY) tRightMin = 0;
    if (tLeftMin === Number.NEGATIVE_INFINITY) tLeftMin = 0;
    if (tRightMax === Number.POSITIVE_INFINITY) tRightMax = selfLength;
    if (tLeftMax === Number.POSITIVE_INFINITY) tLeftMax = selfLength;

    return { tRightMin, tLeftMin, tRightMax, tLeftMax };
  }

  makeContour(offset: CalcWallOffset) {
    let leftOffset = offset(this.elem.id, true);
    let rightOffset = offset(this.elem.id, false);
    let selfLength = this.elem.length;
    let elem = this.elem.line;

    let { tRightMin, tLeftMin, tRightMax, tLeftMax } = this.computeLimits(
      offset
    );
    let elemDir = this.dir().normalized();
    if (!elemDir) {
      return new geom.Contour();
    }
    let elemPos = this.from.pos;
    let contour = new geom.Contour();
    let p0 = geom.newVector(0, 0);
    let p0right = geom.newVector(tRightMin, -rightOffset);
    let p0left = geom.newVector(tLeftMin, leftOffset);
    if (this.from.touch) {
      p0 = geom.middle(p0left, p0right);
    }
    let p1 = geom.newVector(selfLength, 0);
    let p1right = geom.newVector(tRightMax, -rightOffset);
    let p1left = geom.newVector(tLeftMax, leftOffset);
    if (this.to.touch) {
      p1 = geom.middle(p1left, p1right);
    }

    let leftIntervals: WallInterval[] = [];
    let rightIntervals: WallInterval[] = [];
    // add intervals from rooms
    for (let wall of this.children) {
      let line = wall.wallElem.line;
      let t1 = geom.pointLineProjectionPar(line.p2, elemPos, elemDir);
      let t2 = geom.pointLineProjectionPar(line.p1, elemPos, elemDir);
      if (t2 < t1) {
        t1 = geom.clamp(t1, tLeftMin, tLeftMax);
        t2 = geom.clamp(t2, tLeftMin, tLeftMax);
        let interval = new WallInterval(line.id, t1, t2);
        leftIntervals.push(interval)
      } else {
        t1 = geom.clamp(t1, tRightMin, tRightMax);
        t2 = geom.clamp(t2, tRightMin, tRightMax);
        let interval = new WallInterval(line.id, t1, t2);
        rightIntervals.push(interval);
      }
    }
    // add intervals defined by free walls ( not making any rooms)
    for (let corner of this.touch) {
      let leftInterval = WallInterval.newEmpty(elem.id + 5);
      let rightInterval = WallInterval.newEmpty(elem.id - 5);
      for (let wall of corner.walls) {
        if (wall.children.length === 0) {
          let rightSide = elem.evalPoint(wall.elem.line.middle) > 0;
          let touchInterval = this.computeWallIntersection(wall, rightSide, offset);
          if (touchInterval) {
            if (rightSide) {
              rightInterval.add(touchInterval);
            } else {
              leftInterval.add(touchInterval);
            }
          }
        }
      }

      let insertInterval = (list: WallInterval[], item: WallInterval) => {
        for (let i of list)  {
          // split intervals if item inside i (free wall in room)
          if (i.intervalInside(item)) {
            let t2 = i.t2;
            i.t2 = item.t1;
            item.t1 = item.t2;
            item.t2 = t2;
            break;
          }
        }
        list.push(item);
      }

      if (leftInterval.valid) {
        leftInterval.swap();
        insertInterval(leftIntervals, leftInterval);
      }
      if (rightInterval.valid) {
        insertInterval(rightIntervals, rightInterval);
      }
    }
    leftIntervals.sort((i1, i2) => i2.tmiddle - i1.tmiddle);
    rightIntervals.sort((i1, i2) => i1.tmiddle - i2.tmiddle);

    let startPos = p0;
    let finishPos = p1;

    let lastPos: geom.Vector;
    let lastId: number;
    let lastt = tRightMax;

    // right side
    if (rightIntervals.length > 0) {
      for (let interval of rightIntervals) {
        let from = geom.newVector(interval.t1, -rightOffset);
        let to = geom.newVector(interval.t2, -rightOffset);
        if (lastPos) {
          contour.addLine(lastPos, from).assignId(lastId ^ interval.id);
        } else {
          if (interval.t1 > tRightMin + glMatrix.EPSILON) {
            contour.addLine(startPos, p0right).assignId(interval.id - 2);
            contour.addLine(p0right, from).assignId(interval.id - 3);
          } else {
            contour.addLine(startPos, from).assignId(interval.id - 2);
          }
        }
        contour.addLine(from, to).assignId(interval.id - 1);
        lastPos = to;
        lastId = interval.id;
        lastt = interval.t2;
      }
      // lastline
      if (lastt < tRightMax - glMatrix.EPSILON) {
        contour.addLine(lastPos, p1right).assignId(lastId || 1000 - 4);
        lastPos = p1right;
      }
      contour.addLine(lastPos, finishPos).assignId(lastId || 1000 - 3);
    } else {
      contour.addLine(p0, p0right).assignId(elem.id - 1);
      contour.addLine(p0right, p1right).assignId(elem.id - 2);
      contour.addLine(p1right, p1).assignId(elem.id - 3);
    }

    // left side
    let leftFirstIndex = contour.count;
    if (leftIntervals.length > 0) {
      lastPos = undefined;
      lastId = undefined;
      for (let interval of leftIntervals) {
        let from = geom.newVector(interval.t1, leftOffset);
        let to = geom.newVector(interval.t2, leftOffset);
        if (lastPos) {
          contour.addLine(lastPos, from).assignId(lastId ^ interval.id);
        } else {
          if (interval.t1 < tLeftMax - glMatrix.EPSILON) {
            contour.addLine(finishPos, p1left).assignId(interval.id + 3);
            contour.addLine(p1left, from).assignId(interval.id + 2);
          } else {
            contour.addLine(finishPos, from).assignId(interval.id + 2);
          }
        }
        contour.addLine(from, to).assignId(interval.id + 1);
        lastPos = to;
        lastId = interval.id;
        lastt = interval.t2;
      }
      // last line
      if (lastt > tLeftMin + glMatrix.EPSILON) {
        contour.addLine(lastPos, p0left).assignId(lastId || 2000 + 4);
        lastPos = p0left;
      }
      contour.addLine(lastPos, startPos).assignId(lastId || 2000 + 3);
    } else {
      contour.addLine(p1, p1left).assignId(elem.id + 1);
      contour.addLine(p1left, p0left).assignId(elem.id + 2);
      contour.addLine(p0left, p0).assignId(elem.id + 3);
    }

    let mergeSegments = (id1: number, id2: number) => {
      let line1 = contour.items[id1].line;
      let line2 = contour.items[id2].line;
      if (
        geom.pointLineDistance(line2.p2, line1.p1, line1.normDir) < geom.eps
      ) {
        line1.p2 = line2.p2;
        contour.remove(id2);
      }
    };

    mergeSegments(leftFirstIndex - 1, leftFirstIndex);
    mergeSegments(contour.count - 1, 0);

    return contour;
  }
}

export class Room {
  walls = new Array<RoomWall>();
  private _contour: geom.Contour;
  private _name: string;

  get name() {
    if (!this._name)
      this._name = this.walls
        .map(wall => wall.elem.id)
        .sort((a, b) => a - b)
        .join('|');
    return this._name;
  }

  findWall(elemId: number): RoomWall {
    for (let currentWall of this.walls)
      if (currentWall.elem.id === elemId) {
        return currentWall;
      }
  }

  nextWall(wall: RoomWall, shift = 1) {
    let index = this.walls.indexOf(wall);
    let nextIndex = (index + shift + this.walls.length) % this.walls.length;
    return this.walls[nextIndex];
  }

  get contour() {
    if (!this._contour) {
      this._contour = new geom.Contour();
      for (let wall of this.walls) {
        wall.wallElem = this._contour.addLinexy(
          wall.from.x,
          wall.from.y,
          wall.to.x,
          wall.to.y
        );
        wall.wallElem.assignId(wall.elem.id);
      }
    }
    return this._contour;
  }

  mergeWalls(mapper: RoomToFloorElementMap) {
    if (this.walls.length < 2) return;
    let merged = false;
    for (let k = 0; k < this.walls.length * 2; ) {
      let index1 = k % this.walls.length;
      let index2 = (k + 1) % this.walls.length;
      let wall1 = this.walls[index1];
      let wall2 = this.walls[index2];
      let origElem1 = mapper[wall1.elem.id];
      let origElem2 = mapper[wall2.elem.id];
      if (origElem1 && origElem1 === origElem2) {
        this.walls.splice(index2, 1);
        wall1.to = wall2.to;
        wall1.elem = new geom.Line(wall1.from.pos, wall2.to.pos);
        wall1.elem.assignId(wall2.elem.id);
        merged = true;
      } else {
        ++k;
      }
    }
    if (merged) {
      this._name = undefined;
      this._contour = undefined;
      if (this.contour.count < 2) {
        throw new Error('Invalid room');
      }
    }
  }

  adjustContour(offset: CalcWallOffset) {
    let ok = true;
    for (let wall of this.walls) {
      ok =
        ok &&
        galgo.equidistantElement(
          wall.wallElem,
          offset(wall.elem.id, !wall.isInverted)
        );
    }
    let elems = this.contour.items;
    if (elems.length > 1) {
      let prevElem = elems[elems.length - 1];
      for (let k = 0; k < elems.length; ++k) {
        let elem = elems[k];
        if (!galgo.connectElements(prevElem, elem)) {
          let connector = new geom.Line();
          connector.p1 = prevElem.line.p2;
          connector.p2 = elem.line.p1;
          this.contour.insert(connector, k);
          k = k + 1;
        }
        prevElem = elem;
      }
    }
    return ok;
  }

  calcArea() {
    return galgo.contourArea(this.contour);
  }

  invert() {
    this.walls.reverse();
    for (let wall of this.walls) {
      wall.invert();
    }
    this._name = undefined;
    this._contour = undefined;
  }
}

export class FloorPlan<
  CornerType extends Corner<WallType>,
  WallType extends Wall<CornerType>
> {
  protected _corners = new Array<CornerType>();
  protected _walls = new Array<WallType>();

  constructor(protected _contour: geom.Contour) {}

  get map() {
    return this._contour;
  }

  protected createCorner(x: number, y: number): CornerType {
    return undefined;
  }

  protected createWall(
    elem: geom.Element,
    from: CornerType,
    to: CornerType
  ): WallType {
    return undefined;
  }

  public findOrAddCorner(pos: geom.Vector) {
    for (let corner of this._corners) {
      if (
        glMatrix.equalsd(corner.x, pos.x) &&
        glMatrix.equalsd(corner.y, pos.y)
      ) {
        return corner;
      }
    }
    let corner = this.createCorner(pos.x, pos.y);
    this._corners.push(corner);
    return corner;
  }

  get corners() {
    return this._corners;
  }

  get walls() {
    return this._walls;
  }

  protected addWalls(contour: geom.Contour) {
    for (let elem of contour.items) {
      let line = elem.line;
      if (line && !line.aux) {
        let from = this.findOrAddCorner(line.p1);
        let to = this.findOrAddCorner(line.p2);
        let wall = this.createWall(elem, from, to);
        from.walls.push(wall);
        to.walls.push(wall);
        this._walls.push(wall);
      }
    }
  }

  findWall(elemId: number): WallType {
    for (let currentWall of this._walls)
      if (currentWall.elem.id === elemId) {
        return currentWall;
      }
  }
}

export class FloorRoomPlan extends FloorPlan<RoomCorner, RoomWall> {
  rooms = new Array<Room>();

  protected createCorner(x: number, y: number): RoomCorner {
    return new RoomCorner(x, y);
  }

  protected createWall(
    elem: geom.Element,
    from: RoomCorner,
    to: RoomCorner
  ): RoomWall {
    return new RoomWall(elem, from, to);
  }

  build(offset: CalcWallOffset, mapper: RoomToFloorElementMap = {}) {
    this._walls = [];
    this._corners = [];
    this.rooms = [];
    this._contour.ensureId();
    this.addWalls(this._contour);
    this.markInternallWalls();
    this.addRooms(mapper);
    this.adjustRoomContours(offset);
  }

  private markInternallWalls() {
    let next = true;
    while (next) {
      next = false;
      for (let wall of this._walls) {
        if (!wall.internal && (wall.from.isInternal || wall.to.isInternal)) {
          wall.internal = true;
          next = true;
        }
      }
    }
  }

  private findTightestRoom(wall: RoomWall) {
    let room = new Room();
    room.walls.push(wall.clone());
    let curCorner = wall.to;
    let lastWall = wall;
    while (true) {
      let nextWall = curCorner.findNextWall(lastWall);
      if (!nextWall) {
        room = undefined;
        break;
      }
      if (room.findWall(nextWall.elem.id)) {
        if (room.walls[0].elem.id !== nextWall.elem.id) {
          room = undefined;
        }
        break;
      }
      nextWall = nextWall.from === curCorner
        ? nextWall.clone()
        : nextWall.inverted();
      room.walls.push(nextWall);
      lastWall = nextWall;
      curCorner = nextWall.to;
    }
    return room;
  }

  private addRooms(mapper: RoomToFloorElementMap) {
    let newRooms = {};

    let tryAddRoom = (wall: RoomWall) => {
      let room = this.findTightestRoom(wall);
      if (room) {
        let roomTempName = room.name;
        if (!newRooms[roomTempName]) {
          let area = room.calcArea();
          if (area > geom.eps) {
            room.mergeWalls(mapper);
            newRooms[roomTempName] = room;
            this.rooms.push(room);
            return true;
          }
        }
      }
    };

    for (let wall of this._walls) {
      if (!wall.internal) {
        if (!tryAddRoom(wall)) {
          tryAddRoom(wall.inverted());
        }
      }
    }
  }

  private adjustRoomContours(offset: CalcWallOffset) {
    for (let room of this.rooms) {
      room.adjustContour(offset);
    }
  }
}

export class FloorWallPlan extends FloorPlan<WallCorner, PlanWall> {
  protected createCorner(x: number, y: number): WallCorner {
    return new WallCorner(x, y);
  }

  protected createWall(
    elem: geom.Element,
    from: WallCorner,
    to: WallCorner
  ): PlanWall {
    return new PlanWall(elem, from, to);
  }

  buildWalls() {
    this._walls = [];
    this._corners = [];
    this._contour.ensureId();
    this.addWalls(this._contour);
    this.makeTouchInfo();
  }

  ensureTouchConstraints() {
    for (let wall of this.walls) {
      wall.ensureTouchConstraints();
    }
  }

  private makeTouchInfo() {
    for (let wall of this._walls) {
      let wallPos = wall.from.pos;
      let wallDir = wall.dir();
      for (let corner of this._corners) {
        if (geom.pointLineDistance(corner.pos, wallPos, wallDir) < geom.eps) {
          let t = geom.pointLineProjectionPar(corner.pos, wallPos, wallDir);
          if (t > geom.eps && t < 1 - geom.eps) {
            corner.touch = wall;
            wall.touch.push(corner);
          }
        }
      }
    }
  }
}

interface WallData {
  thickness?: number;
  height?: number;
  baseline?: number;
  material?: string;
  catalog?: number;
}

interface RoomData {
  material?: string;
  catalog?: number;
}

export class FloorBuilder {
  // contains room map
  private _roomPlan: FloorRoomPlan;
  // contains walls which touch and child data
  private _wallPlan: FloorWallPlan;
  private _wallThickness = 100;
  private _wallHeight = 2500;
  private _wallMaterial = 'wall';
  private _wallCatalog?: number;
  private _floorMaterial = 'floor';
  private _floorCatalog?: number;
  private _ceilingMaterial;
  private _ceilingCatalog?: number;
  // contains actual walls
  private _wallMap = new geom.Contour();
  // contains splitted walls
  private _roomMap = new geom.Contour();
  private _roomWallsToPlanWalls: RoomToFloorElementMap;
  private _existingWalls: { [id: number]: Entity } = {};
  private _existingWallData: { [id: number]: WallData } = {};
  private _existingRooms: { [id: number]: Entity } = {};
  private _existingCeilings: { [id: number]: Entity } = {};
  private _existingRoomData: { [id: number]: RoomData } = {};
  private _existingCeilingData: { [id: number]: RoomData } = {};

  constructor(private _floor?: Entity) {}

  floorThickness = 50;
  ceilingThickness = 10;
  static readonly wallContainerType = 'wp-wall-surface';

  get wallThicknes() {
    return this._wallThickness;
  }

  set wallThicknes(value: number) {
    this._wallThickness = value;
  }

  get wallHeight() {
    return this._wallHeight;
  }

  set wallHeight(value: number) {
    this._wallHeight = value;
  }

  get wallMaterial() {
    return this._wallMaterial;
  }

  setWallMaterial(name: string, catalog: number) {
    this._wallMaterial = name;
    this._wallCatalog = catalog;
  }

  get floorMaterial() {
    return this._floorMaterial;
  }

  setFloorMaterial(name: string, catalog: number) {
    this._floorMaterial = name;
    this._floorCatalog = catalog;
  }

  get ceilingMaterial() {
    return this._ceilingMaterial;
  }

  setCeilingMaterial(name: string, catalog: number) {
    this._ceilingMaterial = name;
    this._ceilingCatalog = catalog;
  }

  private fillExistingItems() {
    this._existingRooms = {};
    this._existingCeilings = {};
    this._existingWalls = {};
    if (!this._floor) {
      return;
    }
    for (let child of this._floor.children) {
      if (child.data.wall) {
        let id = child.data.wall.id;
        if (id) {
          this._existingWalls[id] = child;
          this._existingWallData[id] = child.data.wall;
        }
      }
      if (child.data.room) {
        let id = child.data.room.id;
        if (id) {
          this._existingRooms[id] = child;
          this._existingRoomData[id] = child.data.room;
        }
      }
      if (child.data.ceiling) {
        let id = child.data.ceiling.id;
        if (id) {
          this._existingCeilings[id] = child;
          this._existingCeilingData[id] = child.data.ceiling;
        }
      }
    }
  }

  get calcWallOffsetFunction() {
    return (elemId: number, right: boolean) =>
      this.calcWallOffset(elemId, right);
  }

  private calcWallOffset(elemId: number, right: boolean) {
    let offset = this._wallThickness * 0.5;
    let wallData =
      this._existingWallData[elemId] ||
      this._existingWallData[this._roomWallsToPlanWalls[elemId]];
    if (wallData) {
      let thickness = wallData.thickness || this._wallThickness;
      let shift = 0;
      if (wallData.baseline) {
        if (wallData.baseline < 0) {
          shift = -thickness * 0.5;
        } else if (wallData.baseline > 0) {
          shift = thickness * 0.5;
        }
      }
      offset = thickness * 0.5 + (right ? shift : -shift);
    }
    return offset;
  }

  public init(floorMap?: geom.Contour) {
    this.fillExistingItems();
    let floorData = (this._floor && this._floor.data.floor) || {};
    this._wallThickness = floorData.wallThickness || this._wallThickness;
    this._wallHeight = floorData.wallHeight || this._wallHeight;
    this._wallMaterial = floorData.wallMaterial || this._wallMaterial;
    this._wallCatalog = floorData.wallCatalog || this._wallCatalog;
    this._floorMaterial = floorData.floorMaterial || this._floorMaterial;
    this._floorCatalog = floorData.floorCatalog || this._floorCatalog;
    this._ceilingMaterial =
      floorData.ceilingMaterial || this._ceilingMaterial || this._floorMaterial;
    this._ceilingCatalog =
      floorData.ceilingCatalog || this._ceilingCatalog || this._floorCatalog;
    if (!floorMap) {
      floorMap = new geom.Contour();
      if (floorData.map) {
        floorMap.load(floorData.map);
      } else {
        floorMap.addRectxy(0, 0, 5000, 4000);
      }
    }
    this.updateMap(floorMap);
  }

  public updateMap(newMap: geom.Contour) {
    this._wallMap = newMap;
    this._wallMap.ensureId();
    let filteredContour = new geom.Contour();
    filteredContour.items = this._wallMap.items.filter(
      e => e.line && !e.line.aux
    );
    this._roomWallsToPlanWalls = {};
    this._roomMap = galgo.splitContour(
      filteredContour,
      filteredContour,
      this._roomWallsToPlanWalls
    );
    this._roomPlan = new FloorRoomPlan(this._roomMap);
    this._roomPlan.build(
      (id, right) => this.calcWallOffset(id, right),
      this._roomWallsToPlanWalls
    );
    this._wallPlan = new FloorWallPlan(this._wallMap);
    this._wallPlan.buildWalls();
    this.fillChildWalls();
  }

  private fillChildWalls() {
    for (let room of this._roomPlan.rooms) {
      for (let roomWall of room.walls) {
        let wall = this.findWall(roomWall.elem.id);
        if (wall) {
          wall.children.push(roomWall);
        }
      }
    }
  }

  get map() {
    return this._wallMap;
  }

  get rooms(): Room[] {
    return this._roomPlan.rooms;
  }

  get corners(): WallCorner[] {
    return this._wallPlan.corners;
  }

  get walls(): PlanWall[] {
    return this._wallPlan.walls;
  }

  findRoom(name: string) {
    for (let room of this._roomPlan.rooms) {
      if (room.name === name) {
        return room;
      }
    }
  }

  findRoomByWall(wall: RoomWall) {
    for (let room of this._roomPlan.rooms) {
      if (room.walls.includes(wall)) {
        return room;
      }
    }
  }

  removeWall(id: number) {
    this.map.removeById(id);
  }

  removeRoom(name: string) {
    let room = this.findRoom(name);
    let roomDeleted = false;
    let maxAffectedRooms = 1;
    while (room && !roomDeleted && maxAffectedRooms < 100) {
      for (let wall of room.walls) {
        let planWall = this.findWall(wall.elem.id);
        if (planWall.children.length + planWall.touch.length <= maxAffectedRooms) {
          this.map.removeById(planWall.elem.id);
          roomDeleted = true;
        }
      }
      ++maxAffectedRooms;
    }
    return roomDeleted;
  }

  public findRoomEntity(name: string): Entity {
    return this._existingRooms[name];
  }

  public findWall(elemId: number) {
    let wall = this._wallPlan.findWall(elemId);
    if (!wall) {
      let mapId = this._roomWallsToPlanWalls[elemId];
      if (mapId) {
        wall = this._wallPlan.findWall(mapId);
      }
    }
    return wall;
  }

  isInteriorWall(elemId: number) {
    let wall = this.findWall(elemId);
    let left = false;
    let right = false;
    for (let childWall of wall.children) {
      if (!childWall.internal) {
        if (childWall.isInverted) {
          right = true;
        } else {
          left = true;
        }
      }
    }
    return left === right;
  }

  isExteriorWallCCW(wall: PlanWall) {
    for (let child of wall.children) {
      if (!child.isInverted) {
        return true;
      }
    }
    return false;
  }

  private _getWallData(wallElemId: number) {
    let data = this._existingWallData[wallElemId];
    if (!data) {
      data = this._existingWallData[wallElemId] = {};
    }
    return data;
  }

  public setWallThickness(wallElemId: number, value: number) {
    if (value > 0) {
      this._getWallData(wallElemId).thickness = value;
    }
  }

  public setWallHeight(wallElemId: number, value: number) {
    if (value > 0) {
      this._getWallData(wallElemId).height = value;
    }
  }

  public setWallBaseline(wallElemId: number, value: number) {
    this._getWallData(wallElemId).baseline = value;
  }

  public changeWallMaterial(
    wallElemId: number,
    material: string,
    catalog: number
  ) {
    let data = this._getWallData(wallElemId);
    data.material = material;
    data.catalog = catalog;
  }

  private _getRoomData(roomName: string) {
    let data = this._existingRoomData[roomName];
    if (!data) {
      data = this._existingRoomData[roomName] = {};
    }
    return data;
  }

  private _getCeilingData(roomName: string) {
    let data = this._existingCeilingData[roomName];
    if (!data) {
      data = this._existingCeilingData[roomName] = {};
    }
    return data;
  }

  public changeRoomMaterial(
    roomName: string,
    material: string,
    catalog: number
  ) {
    let data = this._getRoomData(roomName);
    data.material = material;
    data.catalog = catalog;
  }

  public changeCeilingMaterial(
    roomName: string,
    material: string,
    catalog: number
  ) {
    let data = this._getCeilingData(roomName);
    data.material = material;
    data.catalog = catalog;
  }

  public shiftWall(wallId: number, dir: geom.Vector) {
    let wall = this.findWall(wallId);
    if (!wall) {
      return false;
    }
    galgo.elasticMove(
      this._wallMap,
      galgo.pointRegion(wall.from.pos.clone()),
      dir
    );
    galgo.elasticMove(
      this._wallMap,
      galgo.pointRegion(wall.to.pos.clone()),
      dir
    );
    this.updateMap(this._wallMap);
    return true;
  }

  public moveWallTo(wallElemId: number, dest: geom.Vector) {
    let wall = this.findWall(wallElemId);
    let movingLine = wall.elem.line;

    let fromPos: number;
    let toPos: number;
    let fromDot = 1;
    let toDot = 1;
    let lineNormDir = movingLine.normDir;

    let calcFromPos = (curWall: PlanWall) => {
      let wall1 = curWall.from === wall.from
        ? curWall.to.pos
        : curWall.from.pos;
      let wall2 = curWall.from === wall.from
        ? curWall.from.pos
        : curWall.to.pos;
      let wallDir = geom.subtract(wall2, wall1);
      let dot = Math.abs(geom.dot(lineNormDir, wallDir.normalized()));
      if (dot < fromDot) {
        let inter = geom.lineLineIntersect(
          wall1,
          wallDir,
          dest,
          movingLine.dir
        );
        if (inter) {
          fromPos = inter[1];
          fromDot = dot;
        }
      }
    };
    for (let curWall of wall.from.walls) {
      calcFromPos(curWall);
    }
    if (wall.from.touch) {
      calcFromPos(wall.from.touch);
    }

    let calcToPos = (curWall: PlanWall) => {
      let wall1 = curWall.to === wall.from ? curWall.to.pos : curWall.from.pos;
      let wall2 = curWall.to === wall.from ? curWall.from.pos : curWall.to.pos;
      let wallDir = geom.subtract(wall2, wall1);
      let inter = geom.lineLineIntersect(wall1, wallDir, dest, movingLine.dir);
      let dot = Math.abs(geom.dot(lineNormDir, wallDir.normalized()));
      if (dot < toDot) {
        let inter = geom.lineLineIntersect(
          wall1,
          wallDir,
          dest,
          movingLine.dir
        );
        if (inter) {
          toPos = inter[1];
          toDot = dot;
        }
      }
    };
    for (let curWall of wall.to.walls) {
      calcToPos(curWall);
    }
    if (wall.to.touch) {
      calcToPos(wall.to.touch);
    }

    fromPos =
      fromPos ||
      geom.pointLineProjectionPar(movingLine.p1, dest, movingLine.dir);
    toPos =
      toPos || geom.pointLineProjectionPar(movingLine.p2, dest, movingLine.dir);

    if (toPos > fromPos - geom.eps) {
      let p1 = geom.addScale(dest, movingLine.dir, fromPos);
      let p2 = geom.addScale(dest, movingLine.dir, toPos);
      galgo.elasticMove(
        this._wallMap,
        galgo.pointRegion(movingLine.p1.clone()),
        geom.subtract(p1, movingLine.p1)
      );
      galgo.elasticMove(
        this._wallMap,
        galgo.pointRegion(movingLine.p2.clone()),
        geom.subtract(p2, movingLine.p2)
      );
    }

    wall.ensureTouchConstraints();
  }

  // resize elemId by moving wallId
  public resizeWithWall(
    elemId: number,
    room: Room,
    newSize: number,
    wallId: number
  ) {
    let roomLine = room.contour.find(elemId).line;
    let sizeDiff = newSize - roomLine.length;
    let wall = this.findWall(wallId);
    let wallLine = wall.elem.line;
    let wallPos = wallLine.middle;

    let sinus = Math.abs(geom.cross(roomLine.normDir, wallLine.normDir));
    if (glMatrix.equalsd(sinus, 0)) {
      let moveDir = wallLine.normDir;
      if (
        geom.pointLineProjectionPar(roomLine.middle, wallLine.middle, moveDir) >
        0
      ) {
        galgo.elasticMove(
          this._wallMap,
          galgo.pointRegion(wallLine.p2.clone()),
          moveDir.scaled(-sizeDiff)
        );
      } else {
        galgo.elasticMove(
          this._wallMap,
          galgo.pointRegion(wallLine.p1.clone()),
          moveDir.scaled(sizeDiff)
        );
      }
    } else {
      let elemWall = this.findWall(elemId);
      let connectedWalls = elemWall.from.walls.find(i => i === wall)
        ? elemWall.from.walls
        : elemWall.to.walls;
      for (let cur of connectedWalls) {
        let curSinus = Math.abs(
          geom.cross(cur.elem.line.normDir, wallLine.normDir)
        );
        if (curSinus > sinus) {
          curSinus = sinus;
        }
      }
      // TODO: it is not always correct because wall points can move along
      // lines of opposite room
      sizeDiff *= sinus;

      let moveDir = wallLine.normDir.perpCCW();
      if (geom.lineEvalPoint(roomLine.middle, wallLine.p1, wallLine.p2) < 0) {
        moveDir.negate();
      }
      let newWallPos = geom.addScale(wallPos, moveDir, sizeDiff);
      this.moveWallTo(wallId, newWallPos);
    }
    this.updateMap(this._wallMap);
    return true;
  }

  // resize free wall by moving all points of map
  public simpleResize(elemId: number, sizeDiff: number) {
    let wall = this.findWall(elemId);
    let wallLine = this._wallMap.find(elemId).line;
    if (wall.to.isIsolated) {
      wallLine.p2 = geom.addScale(
        wallLine.p1,
        wallLine.normDir,
        wallLine.length + sizeDiff
      );
    } else if (wall.from.isIsolated) {
      wallLine.p1 = geom.addScale(wallLine.p1, wallLine.normDir, -sizeDiff);
    } else {
      let region = galgo.halfSpaceRegion(wallLine.middle, wallLine.normDir);
      galgo.elasticMove(
        this._wallMap,
        region,
        wallLine.normDir.scale(sizeDiff * 0.5)
      );
      galgo.elasticMove(
        this._wallMap,
        galgo.invertRegion(region),
        wallLine.normDir.scale(-sizeDiff * 0.5)
      );
    }
    this.updateMap(this._wallMap);
  }

  // smart resize of wall taking into account room
  public resize(
    elemId: number,
    room: Room,
    newSize: number,
    direction?: number,
    pos?: geom.Vector
  ) {
    let roomLine = room.contour.find(elemId).line;
    let wall = room.findWall(elemId);
    let wallLine = wall.elem.line.clone();
    if (geom.dot(roomLine.dir, wallLine.dir) < 0) {
      wallLine.invert();
    }
    let resizeCenter = pos || wallLine.middle;

    let wallOffset = geom.pointSegmentDistance(
      roomLine.middle,
      wall.from.pos,
      wall.to.pos
    );
    let wallIndex = room.walls.indexOf(wall);
    let wallsCount = room.walls.length;
    let prevWall = room.walls[(wallIndex + wallsCount - 1) % wallsCount];
    let nextWall = room.walls[(wallIndex + 1) % wallsCount];

    let sizeDiff = newSize - roomLine.length;

    if (!direction || direction > 0) {
      let moveRegion1 = direction
        ? galgo.pointRegion(wall.to.pos)
        : galgo.halfSpaceRegion(resizeCenter, wallLine.normDir);
      let move1 = sizeDiff;
      if (!direction) {
        move1 *= 0.5;
      }
      if (!moveRegion1(nextWall.to.pos)) {
        let nextElem = room.contour.find(nextWall.elem.id).line;
        let nextWallOffset = geom.pointSegmentDistance(
          nextElem.middle,
          nextWall.from.pos,
          nextWall.to.pos
        );
        let newp2 = geom.addScale(roomLine.p2, roomLine.normDir, move1);
        let newNextDir = geom.subtract(nextElem.p2, newp2).normalized();
        let nextWallPos = geom.addScale(
          newp2,
          newNextDir.perpCW(),
          nextWallOffset
        );
        let lineInter = geom.lineLineIntersect(
          wallLine.p2,
          wallLine.normDir,
          nextWallPos,
          newNextDir
        );
        move1 = lineInter[0];

        let nextNextWall = room.walls[(wallIndex + 2) % wallsCount];
        let nextNextElem = room.contour.find(nextNextWall.elem.id).line;
        let nextNextWallOffset = geom.pointSegmentDistance(
          nextElem.middle,
          nextWall.from.pos,
          nextWall.to.pos
        );
        let nextInter = geom.lineLineIntersect(
          nextWallPos,
          newNextDir,
          nextNextWall.elem.line.p1,
          nextNextElem.normDir
        );
        let nextNextPos = geom.addScale(
          nextNextWall.elem.line.p1,
          nextNextElem.normDir,
          nextInter[1]
        );
        galgo.elasticMove(
          this._wallMap,
          galgo.pointRegion(nextWall.to.pos),
          geom.subtract(nextNextPos, nextWall.to.pos)
        );
      }
      galgo.elasticMove(
        this._wallMap,
        moveRegion1,
        wallLine.normDir.scale(move1)
      );
    }

    if (!direction || direction < 0) {
      let moveRegion2 = direction
        ? galgo.pointRegion(wall.from.pos)
        : galgo.halfSpaceRegion(resizeCenter, wallLine.normDir.negative());
      let move2 = sizeDiff;
      if (!direction) {
        move2 *= 0.5;
      }
      if (!moveRegion2(prevWall.from.pos)) {
        let prevElem = room.contour.find(prevWall.elem.id).line;
        let prevWallOffset = geom.pointSegmentDistance(
          prevElem.middle,
          prevWall.from.pos,
          prevWall.to.pos
        );
        let newp1 = geom.addScale(roomLine.p1, roomLine.normDir, -move2);
        let newPrevDir = geom.subtract(prevElem.p1, newp1).normalized();
        let prevWallPos = geom.addScale(
          newp1,
          newPrevDir.perpCCW(),
          prevWallOffset
        );
        let lineInter = geom.lineLineIntersect(
          wallLine.p1,
          wallLine.normDir,
          prevWallPos,
          newPrevDir
        );
        move2 = -lineInter[0];

        let prevPrevWall =
          room.walls[(wallIndex - 2 + wallsCount) % wallsCount];
        let prevPrevElem = room.contour.find(prevPrevWall.elem.id).line;
        let prevPrevWallOffset = geom.pointSegmentDistance(
          prevElem.middle,
          prevWall.from.pos,
          prevWall.to.pos
        );
        let prevInter = geom.lineLineIntersect(
          prevWallPos,
          newPrevDir,
          prevPrevWall.elem.line.p2,
          prevPrevElem.normDir
        );
        let prevPrevPos = geom.addScale(
          prevPrevWall.elem.line.p2,
          prevPrevElem.normDir,
          prevInter[1]
        );
        galgo.elasticMove(
          this._wallMap,
          galgo.pointRegion(prevWall.from.pos),
          geom.subtract(prevPrevPos, prevWall.from.pos)
        );
      }
      galgo.elasticMove(
        this._wallMap,
        moveRegion2,
        wallLine.normDir.negative().scale(move2)
      );
    }
    this._wallPlan.ensureTouchConstraints();
    this.updateMap(this._wallMap);
  }

  public check() {
    let ok = galgo.contourCheck(this._wallMap);
    if (ok) {
      for (let room of this.rooms) {
        if (!galgo.contourCheck(room.contour)) {
          ok = false;
          break;
        }
      }
    }
    return ok;
  }

  public makeWallContour(wall: PlanWall) {
    let contour = wall.makeContour((id, right) =>
      this.calcWallOffset(id, right)
    );
    let pos = wall.elem.line.p1;
    let perp = wall.elem.line.normDir.perpCCW();
    contour.transform(
      mat4.ftransformation([pos.x, pos.y, 0.0], vec3.axisz, [
        perp.x,
        perp.y,
        0.0
      ])
    );
    return contour;
  }

  computeWallLimits(wall: PlanWall): WallLimits {
    return wall.computeLimits((id, right) => this.calcWallOffset(id, right));
  }

  makeWallContours() {
    return this.walls.map(w => this.makeWallContour(w));
  }

  private dirAngle(dir1: geom.Vector, dir2: geom.Vector) {
    let dot = geom.dot(dir1, dir2);
    let angle = Math.acos(dot) * 180 / Math.PI;
    if (geom.cross(dir1, dir2) > 0)  {
      angle = 360 - angle;
    }
    return angle;
  }

  private buildWallContainers(wall: PlanWall, wallHeight: number, e?: Entity) {
    let commands: BuilderApplyItem[] = [];
    let elemDir = wall.dir().normalized();
    let oldContainers = ((e && e.children) || []).filter(e => e.type === FloorBuilder.wallContainerType);
    for (let roomWall of wall.children) {
      let room = this.findRoomByWall(roomWall);
      let prevWall = room.nextWall(roomWall, -1);
      let nextWall = room.nextWall(roomWall, 1);
      let name = room.name;
      let line = roomWall.wallElem.line;
      let t1 = geom.pointLineProjectionPar(line.p2, wall.from.pos, elemDir);
      let t2 = geom.pointLineProjectionPar(line.p1, wall.from.pos, elemDir);

      let roomWallDir = roomWall.dir().normalized();
      let angle1 = this.dirAngle(prevWall.dir().normalized().negative(), roomWallDir);
      let angle2 = this.dirAngle(roomWallDir.negative(), nextWall.dir().normalized());

      let index = oldContainers.findIndex(e => e.name === name);
      let container: BuilderApplyItem = {
        uid: index >= 0 ? oldContainers.splice(index, 1)[0] : '',
        name,
        type: FloorBuilder.wallContainerType,
        elastic: {
          container: true,
          box: [0, 0, 0, Math.abs(t2 - t1), wallHeight, 0],
          params: [
            { name: '@wp_angle1', size: angle1},
            { name: '@wp_angle2', size: angle2}
          ]
        }
      };
      let wallAxisZ = t1 > t2 ? vec3.axisz : vec3.axis_z;
      let offset = this.calcWallOffset(wall.elem.id, t1 < t2);
      let elemPos = vec3.fromValues(t2, 0, offset * wallAxisZ[2]);
      container.matrix = mat4.ftransformation(elemPos, wallAxisZ, vec3.axisy);
      commands.push(container);
    }
    return {commands, oldContainers};
  }

  private buildWalls() {
    let commands: BuilderApplyItem[] = [];
    // create or update walls
    for (let wall of this.walls) {
      let wallId = wall.elem.id;
      let dir: number;
      let exteriorWall = !this.isInteriorWall(wallId);
      if (exteriorWall) {
        dir = this.isExteriorWallCCW(wall) ? 1 : -1;
      }
      let command: BuilderApplyItem = {};
      let elemDir = wall.dir().normalized();
      let elemNormal = elemDir.perpCCW();

      let updatedWall = this._existingWalls[wallId];
      let material = this._wallMaterial;
      let catalog = this._wallCatalog;
      let wallData = <WallData>(this._existingWallData[wallId] || {});
      if (updatedWall) {
        material = wallData.material || material;
        catalog = wallData.catalog || catalog;
        command.uid = updatedWall;
        delete this._existingWalls[wallId];
      } else {
        command.parent = '';
      }
      command.catalog = catalog;

      let roomIntervals: { t1: number, t2: number }[] = [];
      for (let roomWall of wall.children) {
        let line = roomWall.wallElem.line;
        let t1 = geom.pointLineProjectionPar(line.p2, wall.from.pos, elemDir);
        let t2 = geom.pointLineProjectionPar(line.p1, wall.from.pos, elemDir);
        let interval = { t1: t1, t2: t2 };
        roomIntervals.push(interval);
      }

      command.data = {
        wall: {
          id: wallId,
          thickness: wallData.thickness,
          height: wallData.height,
          baseline: wallData.baseline,
          // undefined if it is a default wall material
          material: wallData.material,
          catalog: catalog,
          dir: dir,
          roomIntervals: roomIntervals,
        }
      };

      let elemPos = vec3.fromValues(wall.from.pos.x, 0, wall.from.pos.y);
      let wallAxisZ = vec3.fromValues(elemNormal.x, 0, elemNormal.y);
      command.matrix = mat4.ftransformation(elemPos, wallAxisZ, vec3.axisy);
      let profile = wall.makeContour((id, right) => this.calcWallOffset(id, right));
      // we look at the floor from top, but wall extrusion path is oriented from bottom to top
      // so we should mirror profile along OY
      for (let item of profile.items) {
        let line = item.line;
        line.p1.x = -line.p1.x;
        line.p2.x = -line.p2.x;
      }
      let path = new geom.Contour();
      let wallHeight = wallData.height || this.wallHeight;
      path.addLinexy(0, wall.children.length ? -this.floorThickness : 0,
        0, wallHeight + this.ceilingThickness)
      .assignId(1);

      command.builder = {
        type: 'profile',
        material: { name: material },
        profile: profile.save(),
        path: path.save()
      };

      let containers = this.buildWallContainers(wall, wallHeight, updatedWall);
      command.children = containers.commands;
      command.elastic = {
        params: [{ name: '@wp_thickness', size: wallData.thickness || this._wallThickness }]
      }

      Designer.normalizeBuilderItem(command);
      let commandHash = Md5.hashObject(command);
      if (!updatedWall || updatedWall.data.wall.hash !== commandHash) {
        command.data.wall.hash = commandHash as string;
        commands.push(command);
        for (let old of containers.oldContainers) {
          commands.push({uid: old, remove: true});
        }
      }

      // update doors and windows
      if (
        updatedWall &&
        updatedWall.children &&
        updatedWall.children.length > 0
      ) {
        let profileRect = profile.size;
        // if wall thickness will be changed
        if (
          !glMatrix.equalsd(profileRect.min.y, updatedWall.contentBox.minz) ||
          !glMatrix.equalsd(profileRect.max.y, updatedWall.contentBox.maxz)
        ) {
          let wallThickness = profileRect.max.y - profileRect.min.y;
          for (let child of updatedWall.children) {
            if (child.elastic && child.elastic.box) {
              let childBox = new Box();
              childBox.addOBB(child.elastic.box, child.matrix);
              if (
                glMatrix.equalsd(childBox.minz, updatedWall.contentBox.minz) &&
                glMatrix.equalsd(childBox.maxz, updatedWall.contentBox.maxz)
              ) {
                let newMatrix = mat4.fcopy(child.matrix);
                newMatrix[14] =
                  (newMatrix[10] < 0 ? profileRect.max.y : profileRect.min.y) -
                  child.elastic.box.minz;
                let command: any = {
                  uid: child,
                  matrix: newMatrix,
                  size: { '#depth': wallThickness }
                };
                commands.push(command);
              }
            }
          }
        }
      }
    }
    // remove not used walls
    for (let wallId in this._existingWalls) {
      let wall = this._existingWalls[wallId];
      commands.push({
        uid: wall,
        remove: true
      });
    }
    this._existingWalls = {};
    return commands;
  }

  private buildRooms() {
    // TODO: implement fuzzy mapping between existing and created rooms
    // to avoid deleting rooms data after small modifications
    // create or update rooms
    let commands: BuilderApplyItem[] = [];
    for (let room of this._roomPlan.rooms) {
      let command: any = {};
      let command2: any = {};
      let roomId = room.name;
      let updatedRoom = this._existingRooms[roomId];
      let updatedCeiling = this._existingCeilings[roomId];
      let roomData = <RoomData>(this._existingRoomData[roomId] || {});
      let ceilingData = <RoomData>(this._existingCeilingData[roomId] || {});
      if (updatedRoom) {
        command.uid = updatedRoom;
        delete this._existingRooms[roomId];
      } else {
        command.parent = '';
      }
      if (updatedCeiling) {
        command2.uid = updatedCeiling;
        delete this._existingCeilings[roomId];
      } else {
        command2.parent = '';
      }
      command.catalog = roomData.catalog || this._floorCatalog;
      command.data = {
        room: {
          id: roomId,
          thickness: this.floorThickness,
          contour: room.contour.save(),
          material: roomData.material,
          catalog: roomData.catalog
        }
      };

      command2.catalog =
        ceilingData.catalog || this._ceilingCatalog || this._floorCatalog;
      command2.data = {
        ceiling: {
          id: roomId,
          thickness: this.ceilingThickness,
          material: ceilingData.material,
          catalog: ceilingData.catalog,
          dir: -1
        }
      };

      command.matrix = mat4.transformation(
        mat4.create(),
        vec3.fromValues(0, 0, 0),
        vec3.axis_y,
        vec3.axisz
      );
      command2.matrix = mat4.transformation(
        mat4.create(),
        vec3.fromValues(0, this._wallHeight + this.ceilingThickness, 0),
        vec3.axis_y,
        vec3.axisz
      );

      command.builder = {
        type: 'panel',
        material: {
          name: roomData.material || this._floorMaterial,
          thickness: this.floorThickness
        },
        contour: room.contour.save()
      };

      Designer.normalizeBuilderItem(command);
      let commandHash = Md5.hashObject(command);
      if (!updatedRoom || updatedRoom.data.room.hash !== commandHash) {
        command.data.room.hash = commandHash;
        commands.push(command);
      }

      command2.builder = {
        type: 'panel',
        material: {
          name:
            ceilingData.material ||
              this._ceilingMaterial ||
              this._floorMaterial,
          thickness: this.ceilingThickness
        },
        contour: room.contour.save()
      };

      Designer.normalizeBuilderItem(command2);
      let command2Hash = Md5.hashObject(command2);
      if (
        !updatedCeiling ||
        updatedCeiling.data.ceiling.hash !== command2Hash
      ) {
        command2.data.ceiling.hash = command2Hash;
        commands.push(command2);
      }
    }
    // remove not used rooms
    if (this._roomPlan.rooms.length > 0) {
      for (let roomId in this._existingRooms) {
        let room = this._existingRooms[roomId];
        commands.push({
          uid: room,
          remove: true
        });
      }
    }
    this._existingRooms = {};
    this._existingRoomData = {};
    for (let ceilingId in this._existingCeilings) {
      let ceiling = this._existingCeilings[ceilingId];
      commands.push({
        uid: ceiling,
        remove: true
      });
    }
    this._existingCeilings = {};
    this._existingCeilingData = {};
    return commands;
  }

  // makes data to update walls and floor on the server
  public buildFloor(): BuilderApplyItem {
    let walls = this.buildWalls();
    let rooms = this.buildRooms();
    return {
      uid: this._floor || '',
      children: [...walls, ...rooms],
      data: {
        floor: {
          map: this._wallMap.save(),
          aux: this._wallMap.items.some(e => e.line && e.line.aux),
          wallHeight: this.wallHeight,
          wallThickness: this.wallThicknes,
          wallMaterial: this.wallMaterial,
          wallCatalog: this._wallCatalog,
          floorMaterial: this.floorMaterial,
          floorCatalog: this._floorCatalog,
          ceilingMaterial: this.ceilingMaterial,
          ceilingCatalog: this._ceilingCatalog
        }
      }
    };
  }
}

class RoomStatistics {
  constructor(public area: number) {}
}

export class FloorProjectStatistics {
  rooms: RoomStatistics[] = [];
  floorCount = 0;
  livingArea = 0;

  constructor(root: Entity) {
    if (root.children) {
      for (let item of root.children) {
        if (item.data.floor) {
          this.addFloor(item);
        }
      }
    }
  }

  private addFloor(floor: Entity) {
    this.floorCount++;
    let plan = new FloorBuilder(floor);
    plan.init();
    for (let room of plan.rooms) {
      let area = room.calcArea() * 1e-6;
      this.livingArea += area;
      this.rooms.push(new RoomStatistics(area));
    }
    this.livingArea = Math.round(this.livingArea * 10) / 10;
  }
}
