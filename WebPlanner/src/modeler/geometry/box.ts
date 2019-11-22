import { vec3 } from './vec3';

export class Box {
  size: Float64Array;
  constructor() {
    this.size = new Float64Array(6);
  }

  static from(data: ArrayLike<number>) {
    let box = new Box();
    box.size.set(data);
    return box;
  }

  static fromMinMax(min: Float64Array, max: Float64Array) {
    let box = new Box()
    let size = [min[0], min[1], min[2], max[0], max[1], max[2]];
    box.set(size);
    return box;
  }

  copy(): Box {
    let box = new Box();
    box.set(this.size);
    return box;
  }

  move(dir) {
    let s = this.size;
    s[0] += dir[0];
    s[1] += dir[1];
    s[2] += dir[2];
    s[3] += dir[0];
    s[4] += dir[1];
    s[5] += dir[2];
  }

  getPoint(index: number, out) {
    let s = this.size;
    switch (index) {
      case 0:
        vec3.set(out, s[0], s[1], s[2]);
        break;
      case 1:
        vec3.set(out, s[0], s[1], s[5]);
        break;
      case 2:
        vec3.set(out, s[0], s[4], s[2]);
        break;
      case 3:
        vec3.set(out, s[0], s[4], s[5]);
        break;

      case 4:
        vec3.set(out, s[3], s[1], s[2]);
        break;
      case 5:
        vec3.set(out, s[3], s[1], s[5]);
        break;
      case 6:
        vec3.set(out, s[3], s[4], s[2]);
        break;
      case 7:
        vec3.set(out, s[3], s[4], s[5]);
        break;
    }
  }

  get min() {
    return this.size.subarray(0, 3);
  }

  get minx() {
    return this.size[0];
  }

  set minx(val: number) {
    this.size[0] = val;
  }

  get miny() {
    return this.size[1];
  }

  set miny(val: number) {
    this.size[1] = val;
  }

  get minz() {
    return this.size[2];
  }

  set minz(val: number) {
    this.size[2] = val;
  }

  get max() {
    return this.size.subarray(3, 6);
  }

  get maxx() {
    return this.size[3];
  }

  set maxx(val: number) {
    this.size[3] = val;
  }

  get maxy() {
    return this.size[4];
  }

  set maxy(val: number) {
    this.size[4] = val;
  }

  get maxz() {
    return this.size[5];
  }

  set maxz(val: number) {
    this.size[5] = val;
  }

  get extent() {
    let s = this.size;
    return new Float64Array([s[3] - s[0], s[4] - s[1], s[5] - s[2]]);
  }

  get sizex() {
    return this.maxx - this.minx;
  }

  get sizey() {
    return this.maxy - this.miny;
  }

  get sizez() {
    return this.maxz - this.minz;
  }

  getSize(axis: number) {
    return this.size[axis + 3] - this.size[axis];
  }

  get maxSize() {
    return Math.max(this.maxx - this.minx, this.maxy - this.miny, this.maxz - this.minz);
  }

  set(size) {
    this.size[0] = size[0];
    this.size[1] = size[1];
    this.size[2] = size[2];
    this.size[3] = size[3];
    this.size[4] = size[4];
    this.size[5] = size[5];
    return this;
  }

  setMin(min) {
    this.size[0] = min[0];
    this.size[0] = min[1];
    this.size[0] = min[2];
    return this;
  }

  setMax(max) {
    this.size[0] = max[0];
    this.size[0] = max[1];
    this.size[0] = max[2];
    return this;
  }

  setByMinMax(min, max) {
    this.size[0] = min[0];
    this.size[1] = min[1];
    this.size[2] = min[2];
    this.size[3] = max[0];
    this.size[4] = max[1];
    this.size[5] = max[2];
    return this;
  }

  setIdentity() {
    this.size[0] = -1;
    this.size[1] = -1;
    this.size[2] = -1;
    this.size[3] = 1;
    this.size[4] = 1;
    this.size[5] = 1;
    return this;
  }

  assign(source: Box) {
    this.set(source.size);
  }

  get center() {
    let s = this.size;
    return new Float64Array([
      (s[0] + s[3]) * 0.5,
      (s[1] + s[4]) * 0.5,
      (s[2] + s[5]) * 0.5
    ]);
  }

  get centerx() {
    return (this.maxx + this.minx) * 0.5;
  }

  get centery() {
    return (this.maxy + this.miny) * 0.5;
  }

  get centerz() {
    return (this.maxz + this.minz) * 0.5;
  }

  get diagonal() {
    let s = this.size;
    let dx = s[0] - s[3];
    let dy = s[1] - s[4];
    let dz = s[2] - s[5];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  get empty() {
    let s = this.size;
    return s[0] > s[3] || s[1] > s[4] || s[2] > s[5];
  }

  addBox(box: Box) {
    let s = this.size;
    let b = box.size;
    if (b[0] < s[0]) s[0] = b[0];
    if (b[1] < s[1]) s[1] = b[1];
    if (b[2] < s[2]) s[2] = b[2];
    if (b[3] > s[3]) s[3] = b[3];
    if (b[4] > s[4]) s[4] = b[4];
    if (b[5] > s[5]) s[5] = b[5];
  }

  addPoint(p) {
    let s = this.size;
    if (p[0] < s[0]) s[0] = p[0];
    if (p[1] < s[1]) s[1] = p[1];
    if (p[2] < s[2]) s[2] = p[2];
    if (p[0] > s[3]) s[3] = p[0];
    if (p[1] > s[4]) s[4] = p[1];
    if (p[2] > s[5]) s[5] = p[2];
  }

  addCoord(value: number, axis: number) {
    let s = this.size;
    if (value < s[axis]) {
      s[axis] = value;
    }
    if (value > s[axis + 3]) {
      s[axis + 3] = value;
    }
  }

  addOBB(box: Box, matrix) {
    if (!box.empty) {
      let p = vec3.create();
      for (let i = 0; i < 8; ++i) {
        box.getPoint(i, p);
        vec3.transformMat4(p, p, matrix);
        this.addPoint(p);
      }
    }
  }

  transform(matrix) {
    let copy = this.copy();
    this.clear();
    this.addOBB(copy, matrix);
    return this;
  }

  clear() {
    let s = this.size;
    s[0] = s[1] = s[2] = Number.MAX_VALUE;
    s[3] = s[4] = s[5] = -Number.MAX_VALUE;
    return this;
  }

  isIntersect(other: Box): boolean {
    let s1 = this.size;
    let s2 = other.size;
    if (s2[0] > s1[3] || s2[3] < s1[0]) return false;
    if (s2[1] > s1[4] || s2[4] < s1[1]) return false;
    if (s2[2] > s1[5] || s2[5] < s1[2]) return false;
    return true;
  }

  enlarge(value: number) {
    let s = this.size;
    s[0] -= value;
    s[1] -= value;
    s[2] -= value;
    s[3] += value;
    s[4] += value;
    s[5] += value;
  }

  inside(pos: Float64Array) {
    let s = this.size;
    let min = pos[0] > s[0] && pos[1] > s[1] && pos[2] > s[2]
    let max = pos[0] < s[3] && pos[1] < s[4] && pos[2] < s[5];
    return min && max;
  }

  boxInside(box: Box) {
    let src = box.size;
    let s = this.size;
    let min1 = src[0] > s[0] && src[1] > s[1] && src[2] > s[2]
    let max1 = src[0] < s[3] && src[1] < s[4] && src[2] < s[5];
    let min2 = src[3] > s[0] && src[4] > s[1] && src[5] > s[2]
    let max2 = src[3] < s[3] && src[4] < s[4] && src[5] < s[5];
    return min1 && max1 && min2 && max2;
  }
}
