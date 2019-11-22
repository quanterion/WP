import { glMatrix } from './common';
import { vec3 } from './vec3';
import { Box } from './box';

export class Ray {
  pos = vec3.create();
  dir = vec3.fromValues(0, 0, 1);
  distance = 1e10;
  entity: any;
  mesh: any;

  visibleOnly = true; // intersect only visible items
  intersected = false;
  backfaces = false;
  // ray is used for selection picking
  selection = false;

  constructor() {}

  toArray() {
    let result = new Float32Array(6);
    result[0] = this.pos[0];
    result[1] = this.pos[1];
    result[2] = this.pos[2];
    result[3] = this.dir[0];
    result[4] = this.dir[1];
    result[5] = this.dir[2];
    return result;
  }

  fromArray(data: Float32Array) {
    this.pos[0] = data[0];
    this.pos[1] = data[1];
    this.pos[2] = data[2];
    this.dir[0] = data[3];
    this.dir[1] = data[4];
    this.dir[2] = data[5];
  }

  getPoint(t: number) {
    return vec3.scaleAndAdd(vec3.create(), this.pos, this.dir, t);
  }

  get intersectPos(): Float64Array {
    return vec3.scaleAndAdd(vec3.create(), this.pos, this.dir, this.distance);
  }

  transform(matrix) {
    vec3.transformMat4(this.pos, this.pos, matrix);
    vec3.transformVectorMat4(this.dir, this.dir, matrix);
  }

  // temp variables for triangle intersection
  private _vec1 = vec3.create();
  private _vec2 = vec3.create();
  private _perpVec = vec3.create();
  private _tVec = vec3.create();
  private _qVec = vec3.create();
  private _triNormal = vec3.create();

  intersectTriangle(p1, p2, p3) {
    vec3.sub(this._vec1, p2, p1);
    vec3.sub(this._vec2, p3, p1);
    vec3.cross(this._perpVec, this.dir, this._vec2);

    if (!this.backfaces) {
      vec3.cross(this._triNormal, this._vec1, this._vec2);
      if (vec3.dot(this._triNormal, this.dir) > 0) {
        return;
      }
    }

    let det = vec3.dot(this._vec1, this._perpVec);
    if (Math.abs(det) > glMatrix.EPSILON) {
      let invDet = 1.0 / det;
      vec3.sub(this._tVec, this.pos, p1);
      let u = vec3.dot(this._tVec, this._perpVec) * invDet;
      if (u >= 0 && u <= 1) {
        vec3.cross(this._qVec, this._tVec, this._vec1);
        let v = vec3.dot(this.dir, this._qVec) * invDet;
        if (v >= 0 && u + v <= 1) {
          let t = vec3.dot(this._vec2, this._qVec) * invDet;
          if (t > 0 && t < this.distance) {
            this.distance = t;
            this.intersected = true;
            return true;
          }
        }
      }
    }
  }

  intersectPlane(plane) {
    let proj = vec3.dot(plane, this.dir);
    if (Math.abs(proj) > glMatrix.EPSILON) {
      let distance = -(vec3.dot(plane, this.pos) + plane[3]) / proj;
      if (distance < this.distance) {
        this.distance = distance;
        this.intersected = true;
        return true;
      }
    }
  }

  calcPlaneIntersectionDistance(plane) {
    let proj = vec3.dot(plane, this.dir);
    if (Math.abs(proj) > glMatrix.EPSILON) {
      let distance = -(vec3.dot(plane, this.pos) + plane[3]) / proj;
      if (distance < this.distance) {
        return distance;
      }
    }
  }

  intersectBox(box: Box) {
    let tmin, tmax, tymin, tymax, tzmin, tzmax;

    let invdirx = 1 / this.dir[0],
      invdiry = 1 / this.dir[1],
      invdirz = 1 / this.dir[2];

    let origin = this.pos;
    let boxSize = box.size;

    if (invdirx >= 0) {
      tmin = (boxSize[0] - origin[0]) * invdirx;
      tmax = (boxSize[3] - origin[0]) * invdirx;
    } else {
      tmin = (boxSize[3] - origin[0]) * invdirx;
      tmax = (boxSize[0] - origin[0]) * invdirx;
    }

    if (invdiry >= 0) {
      tymin = (boxSize[1] - origin[1]) * invdiry;
      tymax = (boxSize[4] - origin[1]) * invdiry;
    } else {
      tymin = (boxSize[4] - origin[1]) * invdiry;
      tymax = (boxSize[1] - origin[1]) * invdiry;
    }

    if (tmin > tymax || tymin > tmax) return false;

    // These lines also handle the case where tmin or tmax is NaN
    // (result of 0 * Infinity). x !== x returns true if x is NaN

    if (tymin > tmin || tmin !== tmin) tmin = tymin;
    if (tymax < tmax || tmax !== tmax) tmax = tymax;

    if (invdirz >= 0) {
      tzmin = (boxSize[2] - origin[2]) * invdirz;
      tzmax = (boxSize[5] - origin[2]) * invdirz;
    } else {
      tzmin = (boxSize[5] - origin[2]) * invdirz;
      tzmax = (boxSize[2] - origin[2]) * invdirz;
    }

    if (tmin > tzmax || tzmin > tmax) return false;

    if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
    if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

    //return point closest to the ray (positive side)

    if (tmax < 0) return false;
    if (tmin > this.distance) return false;

    this.distance = tmin >= 0 ? tmin : tmax;
    this.intersected = true;
    return true;
  }

  // fast check to determine possibility for ray to intersect with objects inside the box
  isIntersectBox(box: Box) {
    let tmin, tmax, tymin, tymax, tzmin, tzmax;

    let invdirx = 1 / this.dir[0],
      invdiry = 1 / this.dir[1],
      invdirz = 1 / this.dir[2];

    let origin = this.pos;
    let boxSize = box.size;

    if (invdirx >= 0) {
      tmin = (boxSize[0] - origin[0]) * invdirx;
      tmax = (boxSize[3] - origin[0]) * invdirx;
    } else {
      tmin = (boxSize[3] - origin[0]) * invdirx;
      tmax = (boxSize[0] - origin[0]) * invdirx;
    }

    if (invdiry >= 0) {
      tymin = (boxSize[1] - origin[1]) * invdiry;
      tymax = (boxSize[4] - origin[1]) * invdiry;
    } else {
      tymin = (boxSize[4] - origin[1]) * invdiry;
      tymax = (boxSize[1] - origin[1]) * invdiry;
    }

    if (tmin > tymax || tymin > tmax) return null;

    // These lines also handle the case where tmin or tmax is NaN
    // (result of 0 * Infinity). x !== x returns true if x is NaN

    if (tymin > tmin || tmin !== tmin) tmin = tymin;
    if (tymax < tmax || tmax !== tmax) tmax = tymax;

    if (invdirz >= 0) {
      tzmin = (boxSize[2] - origin[2]) * invdirz;
      tzmax = (boxSize[5] - origin[2]) * invdirz;
    } else {
      tzmin = (boxSize[5] - origin[2]) * invdirz;
      tzmax = (boxSize[2] - origin[2]) * invdirz;
    }

    if (tmin > tzmax || tzmin > tmax) return null;

    if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
    if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

    //return point closest to the ray (positive side)

    if (tmax < 0) return null;
    if (tmin > this.distance) return null;
    return true;
  }
}
