export enum ElementType {
  Line,
  Arc,
  Size,
  Point,
  Text,
  Contour
}

export const eps = 1e-7;

export class Vector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  assign(p: Vector) {
    this.x = p.x;
    this.y = p.y;
  }

  equals(p: Vector) {
    return equals(this, p);
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get squaredLength() {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): boolean {
    let l = this.length;
    if (l > eps) {
      let il = 1 / l;
      this.x *= il;
      this.y *= il;
      return true;
    }
    return false;
  }

  normalized() {
    let result = this.clone();
    if (result.normalize()) {
      return result;
    }
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
  }

  negative() {
    return new Vector(-this.x, -this.y);
  }

  orthogonal() {
    if (Math.abs(this.x) > Math.abs(this.y)) {
      return new Vector(Math.sign(this.x), 0);
    } else {
      return new Vector(0, Math.sign(this.y));
    }
  }

  scale(value: number) {
    this.x *= value;
    this.y *= value;
    return this;
  }

  scaled(value: number) {
    return new Vector(this.x * value, this.y * value);
  }

  move(dir: Vector) {
    this.x += dir.x;
    this.y += dir.y;
    return this;
  }

  moved(dir: Vector) {
    return new Vector(this.x + dir.x, this.y + dir.y);
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  transform(m) {
    let x = this.x,
      y = this.y;
    this.x = m[0] * x + m[4] * y + m[12];
    this.y = m[1] * x + m[5] * y + m[13];
  }

  transformPersp(m): boolean {
    let x = this.x,
      y = this.y,
      w = m[3] * x + m[7] * y + m[15];
    w = w || 1.0;
    this.x = (m[0] * x + m[4] * y + m[12]) / w;
    this.y = (m[1] * x + m[5] * y + m[13]) / w;
    let z = (m[2] * x + m[6] * y + m[14]) / w;
    return z > -1 && z < 1;
  }

  perpCCW(): Vector {
    return new Vector(-this.y, this.x);
  }

  perpCW(): Vector {
    return new Vector(this.y, -this.x);
  }

  isZero() {
    return Math.abs(this.x) < eps && Math.abs(this.y) < eps;
  }
}

export function newVector(x: number, y: number) {
  return new Vector(x, y);
}

export function fromVec3(arr: Float64Array) {
  return new Vector(arr[0], arr[1]);
}

export class Rect {
  min = new Vector();
  max = new Vector();

  empty() {
    this.min.x = this.min.y = Number.MAX_VALUE;
    this.max.x = this.max.y = -Number.MAX_VALUE;
  }

  add(p: Vector) {
    this.min.x = Math.min(this.min.x, p.x);
    this.min.y = Math.min(this.min.y, p.y);
    this.max.x = Math.max(this.max.x, p.x);
    this.max.y = Math.max(this.max.y, p.y);
  }

  get center(): Vector {
    return new Vector(
      (this.min.x + this.max.x) * 0.5,
      (this.min.y + this.max.y) * 0.5
    );
  }

  get width() {
    return this.max.x - this.min.x;
  }

  get height() {
    return this.max.y - this.min.y;
  }
}

export class Element {
  protected _type: ElementType;
  protected _id: number;
  private _owner: Contour;

  color: string;
  thickness: number;
  selected: boolean;

  get id() {
    return this._id;
  }

  ensureId() {
    if (!this.id) {
      // [300..2147483300]
      this._id = Math.floor(Math.random() * 2147483000) + 300;
    }
  }

  assignId(newId: number) {
    this._id = newId;
  }

  get owner() {
    return this._owner;
  }

  set owner(value: Contour) {
    this._owner = value;
  }

  get type() {
    return this._type;
  }

  get line(): Line {
    let elem: Element = this;
    return elem.type === ElementType.Line ? <Line>elem : undefined;
  }

  get point(): Point {
    let elem: Element = this;
    return elem.type === ElementType.Point ? <Point>elem : undefined;
  }

  get contour(): Contour {
    let elem: Element = this;
    return elem.type === ElementType.Contour ? <Contour>elem : undefined;
  }

  tagData: any;

  static create(data: any) {
    let type = <ElementType>ElementType[<string>data.type];
    let curve: Element = undefined;
    switch (type) {
      case ElementType.Line:
        curve = new Line();
        break;
      case ElementType.Arc:
        curve = new Arc();
        break;
      case ElementType.Size:
        curve = new Size();
        break;
      case ElementType.Point:
        curve = new Point();
        break;
      case ElementType.Contour:
        curve = new Contour();
        break;
    }
    if (curve) {
      curve.load(data);
    }
    return curve;
  }

  save(): any {
    return {
      type: ElementType[this.type],
      id: this._id
    };
  }

  load(data: any) {
    this._id = data.id;
  }

  clone(): this {
    let data = this.save();
    return <this>Element.create(data);
  }

  get length() {
    return 0;
  }

  distance(pos: Vector) {
    return Number.POSITIVE_INFINITY;
  }

  addSizeToRect(rect: Rect) {}

  get size(): Rect {
    let result = new Rect();
    result.empty();
    this.addSizeToRect(result);
    return result;
  }

  transform(matrix) {}
}

export class Line extends Element {
  constructor(p1?, p2?: Vector) {
    super();
    this._type = ElementType.Line;
    if (p1) {
      this._p1.assign(p1);
    }
    if (p2) {
      this._p2.assign(p2);
    }
  }
  private _p1 = new Vector();
  private _p2 = new Vector();
  public aux = false;

  get p1() {
    return this._p1;
  }
  get p2() {
    return this._p2;
  }

  set p1(p: Vector) {
    this._p1.assign(p);
  }
  set p2(p: Vector) {
    this._p2.assign(p);
  }

  invert() {
    let x1 = this.p1.x;
    let y1 = this.p1.y;
    this.p1 = this.p2;
    this._p2.set(x1, y1);
  }

  get length() {
    return distance(this.p1, this.p2);
  }

  get dir() {
    return subtract(this.p2, this.p1);
  }

  get normDir() {
    let v = subtract(this.p2, this.p1);
    v.normalize();
    return v;
  }

  get middle() {
    return middle(this.p1, this.p2);
  }

  evalPoint(pos: Vector) {
    return lineEvalPoint(pos, this.p1, this.p2);
  }

  addSizeToRect(rect: Rect) {
    rect.add(this.p1);
    rect.add(this.p2);
  }

  distance(pos: Vector) {
    return pointSegmentDistance(pos, this.p1, this.p2);
  }

  save(): any {
    let data = super.save();
    data.x1 = this.p1.x;
    data.y1 = this.p1.y;
    data.x2 = this.p2.x;
    data.y2 = this.p2.y;
    if (this.aux) {
      data.aux = this.aux;
    }
    return data;
  }

  load(data: any) {
    super.load(data);
    this.p1.set(data.x1, data.y1);
    this.p2.set(data.x2, data.y2);
    this.aux = !!data.aux;
  }

  transform(matrix) {
    this.p1.transform(matrix);
    this.p2.transform(matrix);
  }
}

export class Arc extends Element {
  constructor() {
    super();
    this._type = ElementType.Arc;
  }
  p1 = new Vector();
  p2 = new Vector();
  pc = new Vector();
  closed = true; // circle
  dir = true; // anti clockwise

  transform(matrix) {
    this.p1.transform(matrix);
    this.p2.transform(matrix);
    this.pc.transform(matrix);
    /// TODO: invert dir
  }
}

export enum SizeSelection {
  All,
  Text,
  Dir1,
  Dir2
}

export class Size extends Element {
  constructor(p1?: Vector, p2?: Vector, textPos?: Vector) {
    super();
    this._type = ElementType.Size;
    if (p1 && p2) {
      this.p1.assign(p1);
      this.p2.assign(p2);
      if (textPos) {
        this.textPos.assign(textPos);
      } else {
        this.textPos.set((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5);
      }
      let dir = subtract(this.textPos, pointLineProjection(this.textPos, p1, p2));
      this.dim1 = add(p1, dir);
      this.dim2 = add(p2, dir);
    }
  }
  // size points
  p1 = new Vector();
  p2 = new Vector();
  // dimension points
  dim1 = new Vector();
  dim2 = new Vector();
  textPos = new Vector();
  selectionMode = SizeSelection.All;

  prefix: string;
  postfix: string;
  horizontal = false;

  get value() {
    return distance(this.p1, this.p2);
  }

  addSizeToRect(rect: Rect) {
    rect.add(this.p1);
    rect.add(this.p2);
    rect.add(this.dim1);
    rect.add(this.dim2);
    rect.add(this.textPos);
  }

  transform(matrix) {
    this.p1.transform(matrix);
    this.p2.transform(matrix);
    this.dim1.transform(matrix);
    this.dim2.transform(matrix);
    this.textPos.transform(matrix);
  }
}

export class Point extends Element {
  pos = new Vector();

  constructor() {
    super();
    this._type = ElementType.Point;
  }

  addSizeToRect(rect: Rect) {
    rect.add(this.pos);
  }

  transform(matrix) {
    this.pos.transform(matrix);
  }

  distance(pos: Vector) {
    return distance(pos, this.pos);
  }
}

export class Text extends Element {
  pos = new Vector();
  text: string;
  hideIfOverlap = false;

  constructor() {
    super();
    this._type = ElementType.Text;
  }

  addSizeToRect(rect: Rect) {
    rect.add(this.pos);
  }

  transform(matrix) {
    this.pos.transform(matrix);
  }
}

export class Contour extends Element {
  items = new Array<Element>();
  fillColor: string;

  constructor() {
    super();
    this._type = ElementType.Contour;
  }

  ensureId() {
    super.ensureId();
    for (let elem of this.items) {
      elem.ensureId();
    }
  }

  get count() {
    return this.items.length;
  }

  get length() {
    let l = 0;
    for (let e of this.items) {
      l += e.length;
    }
    return l;
  }

  clear() {
    this.items.length = 0;
  }

  add(curve: Element) {
    if (curve) {
      curve.owner = this;
      this.items.push(curve);
    }
    return curve;
  }

  remove(index) {
    this.items.splice(index, 1);
  }

  removeById(id: number) {
    for (let i = 0; i < this.items.length; ++i)
      if (this.items[i].id === id) {
        this.items.splice(i, 1);
        break;
      }
  }

  insert(curve: Element, index: number) {
    if (curve) {
      curve.owner = this;
      this.items.splice(index, 0, curve);
    }
  }

  find(id: number): Element {
    for (let elem of this.items) {
      if (elem.id === id) {
        return elem;
      }
    }
  }

  distance(pos: Vector) {
    let distance = Number.POSITIVE_INFINITY;
    for (let elem of this.items) {
      distance = Math.min(distance, elem.distance(pos));
    }
    return distance;
  }

  closest(pos: Vector) {
    let distance = Number.POSITIVE_INFINITY;
    let result: Element;
    for (let elem of this.items) {
      let cur = elem.distance(pos);
      if (cur < distance) {
        result = elem;
        distance = cur;
      }
    }
    return result;
  }

  distanceFilter(pos: Vector, filter: (e: Element) => boolean) {
    let distance = Number.POSITIVE_INFINITY;
    for (let elem of this.items) {
      if (filter(elem)) {
        distance = Math.min(distance, elem.distance(pos));
      }
    }
    return distance;
  }

  addLine(p1, p2: Vector) {
    let line = new Line();
    line.owner = this;
    line.p1 = p1;
    line.p2 = p2;
    this.items.push(line);
    return line;
  }

  addLinexy(x1: number, y1: number, x2: number, y2: number) {
    let line = new Line();
    line.owner = this;
    line.p1.set(x1, y1);
    line.p2.set(x2, y2);
    this.items.push(line);
    return line;
  }

  addRectxy(x1: number, y1: number, x2: number, y2: number) {
    this.addLinexy(x1, y1, x2, y1);
    this.addLinexy(x2, y1, x2, y2);
    this.addLinexy(x2, y2, x1, y2);
    this.addLinexy(x1, y2, x1, y1);
  }

  addDiamond(pos: Vector, dir1: Vector, size1: number, size2: number) {
    let dir2 = dir1.perpCW();
    let p1 = addScale(pos, dir1, size1);
    let p2 = addScale(pos, dir2, size2);
    let p3 = addScale(pos, dir1, -size1);
    let p4 = addScale(pos, dir2, -size2);
    this.addLine(p1, p2);
    this.addLine(p2, p3);
    this.addLine(p3, p4);
    this.addLine(p4, p1);
  }

  addPolygon(points: Vector[]) {
    for (let k = 1; k < points.length; ++k) {
      this.addLine(points[k - 1], points[k]);
    }
    this.addLine(points[points.length - 1], points[0]);
  }

  addPolygonxy(points: number[]) {
    for (let k = 3; k < points.length; k += 2) {
      this.addLinexy(
        points[k - 3],
        points[k - 2],
        points[k - 1],
        points[k - 0]
      );
    }
    this.addLinexy(
      points[points.length - 2],
      points[points.length - 1],
      points[0],
      points[1]
    );
  }

  addSize(p1: Vector, p2: Vector, textPos?: Vector) {
    let size = new Size(p1, p2, textPos);
    size.owner = this;
    this.items.push(size);
    return size;
  }

  addSizexy(x1, y1, x2, y2, textx?, texty?) {
    let textPos: Vector;
    if (textx && texty) {
      textPos = newVector(textx, texty);
    }
    return this.addSize(newVector(x1, y1), newVector(x2, y2), textPos);
  }

  addText(pos: Vector, value: string): Text {
    let text = new Text();
    text.owner = this;
    text.text = value;
    text.pos.assign(pos);
    this.items.push(text);
    return text;
  }

  addPoint(pos: Vector): Point {
    let point = new Point();
    point.owner = this;
    point.pos.assign(pos);
    this.items.push(point);
    return point;
  }

  addPointxy(x: number, y: number): Point {
    let point = new Point();
    point.owner = this;
    point.pos.set(x, y);
    this.items.push(point);
    return point;
  }

  addContour(): Contour {
    let contour = new Contour();
    this.add(contour);
    return contour;
  }

  save(): any {
    let data = super.save();
    let elements = [];
    this.items.forEach(curve => elements.push(curve.save()));
    data.elements = elements;
    return data;
  }

  load(data: any) {
    this.clear();
    super.load(data);
    let elements = data.elements;
    elements.forEach(curveData => this.add(Element.create(curveData)));
  }

  addSizeToRect(rect: Rect) {
    for (let item of this.items) {
      item.addSizeToRect(rect);
    }
  }

  transform(matrix) {
    for (let item of this.items) {
      item.transform(matrix);
    }
  }

  isPointInside(point: Vector) {
    let rayDirX = Math.random() + 0.1;
    let rayDirY = Math.random() + 0.1;
    let rayLengthSqr = rayDirX * rayDirX + rayDirY * rayDirY;
    let _2rayLengthSqr = 2 * rayLengthSqr;
    let intersectCount = 0;
    for (let elem of this.items) {
      let line = elem.line;
      if (line) {
        if (line.p1.x < point.x && line.p2.x < point.x) {
          continue;
        }
        if (line.p1.y < point.y && line.p2.y < point.y) {
          continue;
        }
        let lineDirX = line.p2.x - line.p1.x;
        let lineDirY = line.p2.y - line.p1.y;
        let denominator = rayDirX * lineDirY - rayDirY * lineDirX;
        if (Math.abs(denominator) > eps) {
          let k2 =
            (point.y * rayDirX -
              rayDirY * point.x +
              rayDirY * line.p1.x -
              line.p1.y * rayDirX) /
            denominator;
          if (k2 >= 0 && k2 < 1) {
            let intPosX = line.p1.x + k2 * lineDirX;
            if (intPosX > point.x) {
              ++intersectCount;
            }
          }
        }
      }
    }
    return intersectCount % 2 === 1;
  }
}

export function clamp(value, min, max: number) {
  return value > min ? (value < max ? value : max) : min;
}

export function equals(p1, p2: Vector): boolean {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  return Math.abs(dx) < eps && Math.abs(dy) < eps;
}

export function distance(p1, p2: Vector): number {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function dot(p1: Vector, p2: Vector) {
  return p1.x * p2.x + p1.y * p2.y;
}

export function cross(p1: Vector, p2: Vector) {
  return p1.x * p2.y - p1.y * p2.x;
}

export function add(p1: Vector, p2: Vector) {
  return new Vector(p1.x + p2.x, p1.y + p2.y);
}

export function subtract(p1: Vector, p2: Vector) {
  return new Vector(p1.x - p2.x, p1.y - p2.y);
}

export function middle(p1: Vector, p2: Vector) {
  return new Vector((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5);
}

export function addScale(p1: Vector, p2: Vector, scale: number) {
  return new Vector(p1.x + p2.x * scale, p1.y + p2.y * scale);
}

export function pointLineProjectionPar(p: Vector, line1: Vector, dir: Vector) {
  let w = subtract(p, line1);
  let c1 = dot(w, dir);
  let c2 = dot(dir, dir);
  let b = 0;
  if (Math.abs(c2) > eps) {
    b = c1 / c2;
  }
  return b;
}

export function pointLineProjection(p: Vector, line1: Vector, line2: Vector) {
  let dir = subtract(line2, line1);
  let w = subtract(p, line1);
  let c1 = dot(w, dir);
  let c2 = dot(dir, dir);
  let b = 0;
  if (Math.abs(c2) > eps) {
    b = c1 / c2;
  }
  return addScale(line1, dir, b);
}

export function pointLineDistance(p: Vector, linePos: Vector, lineDir: Vector) {
  let par = pointLineProjectionPar(p, linePos, lineDir);
  let p2x = linePos.x + lineDir.x * par;
  let p2y = linePos.y + lineDir.y * par;
  let dx = p.x - p2x;
  let dy = p.y - p2y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pointSegmentDistance(p: Vector, seg1: Vector, seg2: Vector) {
  let dir = subtract(seg2, seg1);
  if (dir.isZero()) {
    return distance(p, seg1);
  }
  let par = pointLineProjectionPar(p, seg1, dir);
  if (par < 0) {
    par = 0;
  } else if (par > 1) {
    par = 1;
  }
  let p2x = seg1.x + dir.x * par;
  let p2y = seg1.y + dir.y * par;
  let dx = p.x - p2x;
  let dy = p.y - p2y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lineEvalPoint(p: Vector, line1: Vector, line2: Vector) {
  let d1x = p.x - line1.x;
  let d1y = p.y - line1.y;
  let d2x = line2.x - line1.x;
  let d2y = line2.y - line1.y;
  return d1x * d2y - d1y * d2x;
}

export function lineLineIntersect(
  L1P1: Vector,
  L1D: Vector,
  L2P1: Vector,
  L2D: Vector
) {
  if (Math.abs(cross(L1D, L2D)) > eps) {
    let t1 =
      (L2D.x * L1P1.y - L2D.y * L1P1.x - L2D.x * L2P1.y + L2D.y * L2P1.x) /
      (L1D.x * L2D.y - L1D.y * L2D.x);
    let t2 =
      (L1D.x * L1P1.y - L1D.y * L1P1.x - L1D.x * L2P1.y + L1D.y * L2P1.x) /
      (L1D.x * L2D.y - L1D.y * L2D.x);
    return [t1, t2];
  }
}
