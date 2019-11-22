import { glMatrix } from './common';
import { vec3 } from './vec3';
import { Box } from './box';

export namespace plane {
  export function createABCD(a, b, c, d) {
    return new glMatrix.ARRAY_TYPE([a, b, c, d]);
  }

  export function createPN(point, normal) {
    let origin = -vec3.dot(point, normal);
    return new glMatrix.ARRAY_TYPE([normal[0], normal[1], normal[2], origin]);
  }

  export function createP3(p1, p2, p3) {
    let sub1 = vec3.sub(vec3.create(), p2, p1);
    let sub2 = vec3.sub(vec3.create(), p3, p1);
    let normal = vec3.cross(vec3.create, sub1, sub2);
    vec3.normalize(normal, normal);
    return createPN(p1, normal);
  }

  export function equals(plane1: Float64Array, plane2: Float64Array) {
    return (
      glMatrix.equalsd(plane1[0], plane2[0]) &&
      glMatrix.equalsd(plane1[1], plane2[1]) &&
      glMatrix.equalsd(plane1[2], plane2[2]) &&
      glMatrix.equalsd(plane1[3], plane2[3])
    ) || (
      glMatrix.equalsd(plane1[0], -plane2[0]) &&
      glMatrix.equalsd(plane1[1], -plane2[1]) &&
      glMatrix.equalsd(plane1[2], -plane2[2]) &&
      glMatrix.equalsd(plane1[3], -plane2[3])
    );
  }

  export function moveToPoint(plane, point) {
    plane[3] = -vec3.dot(point, plane);
  }

  export function evalLocation(plane, point): number {
    return (
      plane[0] * point[0] + plane[1] * point[1] + plane[2] * point[2] + plane[3]
    );
  }

  export function ptransform(plane, matrix) {
    vec3.transformVectorMat4(plane, plane, matrix);
    plane[3] =
      plane[3] -
      (plane[0] * matrix[12] + plane[1] * matrix[13] + plane[2] * matrix[14]);
  }

  export function transform(out, plane, matrix) {
    let d = plane[3];
    vec3.transformVectorMat4(out, plane, matrix);
    out[3] =
      d - (out[0] * matrix[12] + out[1] * matrix[13] + out[2] * matrix[14]);
  }

  export function transformArray(planes: Array<any>, matrix) {
    for (let k = 0; k < planes.length; k++) ptransform(planes[k], matrix);
  }

  export function includePoint(planes: Array<any>, point) {
    for (let k = 0; k < planes.length; k++)
      if (evalLocation(planes[k], point) < 0) {
        moveToPoint(planes[k], point);
      }
  }

  export function enlargeFrustum(planes: Array<any>, box: Box, matrix?) {
    if (box.empty) {
      return;
    }
    let point = vec3.create();
    for (let k = 0; k < 8; k++) {
      box.getPoint(k, point);
      if (matrix) {
        vec3.transformMat4(point, point, matrix);
      }
      plane.includePoint(planes, point);
    }
  }

  export function planePlaneIntersect(
    plane1,
    plane2,
    normal,
    position
  ): boolean {
    vec3.cross(normal, plane1, plane2);
    if (!vec3.empty(normal)) {
      vec3.normalize(normal, normal);
      let absNormal = vec3.fabs(normal);
      if (absNormal[2] > absNormal[0] && absNormal[2] > absNormal[1]) {
        position[0] =
          -(plane1[3] * plane2[1] - plane2[3] * plane1[1]) /
          (plane1[0] * plane2[1] - plane1[1] * plane2[0]);
        position[1] =
          (plane1[3] * plane2[0] - plane2[3] * plane1[0]) /
          (plane1[0] * plane2[1] - plane1[1] * plane2[0]);
        position[2] = 0;
      } else if (absNormal[0] > absNormal[1]) {
        position[0] = 0;
        position[1] =
          -(plane1[3] * plane2[2] - plane2[3] * plane1[2]) /
          (plane1[1] * plane2[2] - plane1[2] * plane2[1]);
        position[2] =
          (plane1[3] * plane2[1] - plane2[3] * plane1[1]) /
          (plane1[1] * plane2[2] - plane1[2] * plane2[1]);
      } else {
        position[0] =
          -(plane1[3] * plane2[2] - plane2[3] * plane1[2]) /
          (plane1[0] * plane2[2] - plane2[0] * plane1[2]);
        position[1] = 0;
        position[2] =
          (plane1[3] * plane2[0] - plane2[3] * plane1[0]) /
          (plane1[0] * plane2[2] - plane2[0] * plane1[2]);
      }
      return true;
    } else return false;
  }

  export function rayIntersect(pos, dir, plane) {
    let proj = vec3.dot(plane, dir);
    if (Math.abs(proj) > glMatrix.EPSILON) {
      let distance = -(vec3.dot(plane, pos) + plane[3]) / proj;
      return distance;
    }
  }

  export function normalProjectOnPlane(N, PlaneN) {
    let NPlaneN = vec3.dot(N, PlaneN);
    return vec3.scaleAndAdd(vec3.create(), N, PlaneN, -NPlaneN);
  }
}
