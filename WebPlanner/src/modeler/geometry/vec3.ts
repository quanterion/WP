/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

import { glMatrix } from './common';

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
export namespace vec3 {
  /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */
  export function create() {
    let out = new glMatrix.ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }

  export const origin = new Float64Array([0.0, 0.0, 0.0]);
  export const axisx = new Float64Array([1.0, 0.0, 0.0]);
  export const axis_x = new Float64Array([-1.0, 0.0, 0.0]);
  export const axisy = new Float64Array([0.0, 1.0, 0.0]);
  export const axis_y = new Float64Array([0.0, -1.0, 0.0]);
  export const axisz = new Float64Array([0.0, 0.0, 1.0]);
  export const axis_z = new Float64Array([0.0, 0.0, -1.0]);

  /**
     * Creates a new vec3 initialized with values from an existing vector
     *
     * @param {vec3} a vector to clone
     * @returns {vec3} a new 3D vector
     */
  export let clone = function(a) {
    let out = new glMatrix.ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  };

  export function fromValues(x: number, y: number, z: number) {
    let out = new glMatrix.ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }

  export function fromAxis(axis: number, negate: boolean = false) {
    let out = new glMatrix.ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    if (axis > 2) {
      axis = axis % 3;
      negate = true;
    }
    if (negate) {
      out[axis] = -1;
    } else {
      out[axis] = 1;
    }
    return out;
  }

  export function empty(vec): boolean {
    return (
      vec[0] < glMatrix.EPSILON &&
      vec[0] > -glMatrix.EPSILON &&
      vec[1] < glMatrix.EPSILON &&
      vec[1] > -glMatrix.EPSILON &&
      vec[2] < glMatrix.EPSILON &&
      vec[2] > -glMatrix.EPSILON
    );
  }

  /**
     * Copy the values from one vec3 to another
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the source vector
     * @returns {vec3} out
     */
  export function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }

  export function fcopy(a) {
    return fromValues(a[0], a[1], a[2]);
  }

  /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */
  export let set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  };

  /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
  export function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }

  export function fadd(a, b) {
    return add(vec3.create(), a, b);
  }

  export function fabs(vec) {
    return fromValues(Math.abs(vec[0]), Math.abs(vec[1]), Math.abs(vec[2]));
  }

  export function abs(vec) {
    vec[0] = Math.abs(vec[0]);
    vec[1] = Math.abs(vec[1]);
    vec[2] = Math.abs(vec[2]);
  }

  /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
  export let subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  };

  /**
     * Alias for {@link vec3.subtract}
     * @function
     */
  export let sub = subtract;

  export function fsub(a, b) {
    return sub(vec3.create(), a, b);
  }

  /**
     * Multiplies two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
  export let multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
  };

  /**
     * Alias for {@link vec3.multiply}
     * @function
     */
  export let mul = multiply;

  /**
     * Divides two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
  export let divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
  };

  /**
     * Alias for {@link vec3.divide}
     * @function
     */
  export let div = divide;

  /**
     * Returns the minimum of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
  export let min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
  };

  /**
     * Returns the maximum of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
  export let max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
  };

  export function fmiddle(a, b) {
    let x = (a[0] + b[0]) * 0.5;
    let y = (a[1] + b[1]) * 0.5;
    let z = (a[2] + b[2]) * 0.5;
    return fromValues(x, y, z);
  }

  export function maxCoord(vec): number {
    let ax = Math.abs(vec[0]);
    let ay = Math.abs(vec[1]);
    let az = Math.abs(vec[2]);
    if (ax > ay && ax > az) return 0;
    else if (ay > az) return 1;
    else return 2;
  }

  export function equals(a, b) {
    return (
      glMatrix.equalsd(a[0], b[0]) &&
      glMatrix.equalsd(a[1], b[1]) &&
      glMatrix.equalsd(a[2], b[2])
    );
  }

  /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */
  export function scale(out, vec, b: number) {
    out[0] = vec[0] * b;
    out[1] = vec[1] * b;
    out[2] = vec[2] * b;
    return out;
  }

  export function fscale(vec, b: number) {
    let out = create();
    out[0] = vec[0] * b;
    out[1] = vec[1] * b;
    out[2] = vec[2] * b;
    return out;
  }

  /**
     * Adds two vec3's after scaling the second operand by a scalar value
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {Number} scale the amount to scale b by before adding
     * @returns {vec3} out
     */
  export let scaleAndAdd = function(out: Float64Array, a: Float64Array, b: Float64Array, scale: number) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    out[2] = a[2] + b[2] * scale;
    return out;
  };

  /**
     * Calculates the euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} distance between a and b
     */
  export let distance = function(a, b) {
    let x = b[0] - a[0],
      y = b[1] - a[1],
      z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
  };

  /**
     * Alias for {@link vec3.distance}
     * @function
     */
  export let dist = distance;

  /**
     * Calculates the squared euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} squared distance between a and b
     */
  export let squaredDistance = function(a, b) {
    let x = b[0] - a[0],
      y = b[1] - a[1],
      z = b[2] - a[2];
    return x * x + y * y + z * z;
  };

  /**
     * Alias for {@link vec3.squaredDistance}
     * @function
     */
  export let sqrDist = squaredDistance;

  /**
     * Calculates the length of a vec3
     *
     * @param {vec3} a vector to calculate length of
     * @returns {Number} length of a
     */
  export let length = function(a) {
    let x = a[0],
      y = a[1],
      z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
  };

  /**
     * Alias for {@link vec3.length}
     * @function
     */
  export let len = length;

  /**
     * Calculates the squared length of a vec3
     *
     * @param {vec3} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
  export let squaredLength = function(a) {
    let x = a[0],
      y = a[1],
      z = a[2];
    return x * x + y * y + z * z;
  };

  /**
     * Alias for {@link vec3.squaredLength}
     * @function
     */
  export let sqrLen = squaredLength;

  /**
     * Negates the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to negate
     * @returns {vec3} out
     */
  export let negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
  };

  export function fnegate(vec) {
    return fromValues(-vec[0], -vec[1], -vec[2]);
  }

  /**
     * Returns the inverse of the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to invert
     * @returns {vec3} out
     */
  export let inverse = function(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
  };

  /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to normalize
     * @returns {vec3} out
     */
  export let normalize = function(out, a) {
    let x = a[0],
      y = a[1],
      z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) {
      //TODO: evaluate use of glm_invsqrt here?
      len = 1 / Math.sqrt(len);
      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
      return out;
    }
  };

  export function fnormalize(a) {
    let result = vec3.create();
    normalize(result, a);
    return result;
  }

  /**
     * Calculates the dot product of two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} dot product of a and b
     */
  export let dot = function(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  };

  /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
  export let cross = function(out, a, b) {
    let ax = a[0],
      ay = a[1],
      az = a[2],
      bx = b[0],
      by = b[1],
      bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  };

  export function fcross(a, b) {
    return cross(vec3.create(), a, b);
  }

  /**
     * Performs a linear interpolation between two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec3} out
     */
  export let lerp = function(out, a, b, t) {
    let ax = a[0],
      ay = a[1],
      az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
  };

  /**
     * Performs a hermite interpolation with two control points
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {vec3} c the third operand
     * @param {vec3} d the fourth operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec3} out
     */
  export let hermite = function(out, a, b, c, d, t) {
    let factorTimes2 = t * t,
      factor1 = factorTimes2 * (2 * t - 3) + 1,
      factor2 = factorTimes2 * (t - 2) + t,
      factor3 = factorTimes2 * (t - 1),
      factor4 = factorTimes2 * (3 - 2 * t);

    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

    return out;
  };

  /**
     * Performs a bezier interpolation with two control points
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {vec3} c the third operand
     * @param {vec3} d the fourth operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec3} out
     */
  export let bezier = function(out, a, b, c, d, t) {
    let inverseFactor = 1 - t,
      inverseFactorTimesTwo = inverseFactor * inverseFactor,
      factorTimes2 = t * t,
      factor1 = inverseFactorTimesTwo * inverseFactor,
      factor2 = 3 * t * inverseFactorTimesTwo,
      factor3 = 3 * factorTimes2 * inverseFactor,
      factor4 = factorTimes2 * t;

    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

    return out;
  };

  /**
     * Generates a random vector with the given scale
     *
     * @param {vec3} out the receiving vector
     * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
     * @returns {vec3} out
     */
  export let random = function(out, scale) {
    scale = scale || 1.0;

    let r = glMatrix.RANDOM() * 2.0 * Math.PI;
    let z = glMatrix.RANDOM() * 2.0 - 1.0;
    let zScale = Math.sqrt(1.0 - z * z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
  };

  /**
     * Transforms the point with a mat4.
     * 4th vector component is implicitly '1'
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec3} out
     */
  export function transformMat4(out, a, m) {
    let x = a[0],
      y = a[1],
      z = a[2],
      w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }

  export function transformPerspective(out, a, m) {
    let x = a[0],
      y = a[1],
      z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out[2] > -1 && out[2] < 1;
  }

  export function ftransformCoordsMat4(x: number, y: number, z: number, m: Float64Array) {
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    let out = vec3.create();
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }

  /**
    * Transforms the vector with a mat4.
    * 4th vector component is implicitly '1'
    *
    * @param {vec3} out the receiving vector
    * @param {vec3} a the vector to transform
    * @param {mat4} m matrix to transform with
    * @returns {vec3} out
    */
  export let transformVectorMat4 = function(out, a, m) {
    let x = a[0],
      y = a[1],
      z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z;
    out[1] = m[1] * x + m[5] * y + m[9] * z;
    out[2] = m[2] * x + m[6] * y + m[10] * z;
    return out;
  };

  /**
     * Transforms the vec3 with a mat3.
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat4} m the 3x3 matrix to transform with
     * @returns {vec3} out
     */
  export let transformMat3 = function(out, a, m) {
    let x = a[0],
      y = a[1],
      z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
  };

  /**
     * Transforms the vec3 with a quat
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {quat} q quaternion to transform with
     * @returns {vec3} out
     */
  export let transformQuat = function(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    let x = a[0],
      y = a[1],
      z = a[2],
      qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      // calculate quat * vec
      ix = qw * x + qy * z - qz * y,
      iy = qw * y + qz * x - qx * z,
      iz = qw * z + qx * y - qy * x,
      iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
  };

  /**
     * Rotate a 3D vector around the x-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
  export let rotateX = function(out, a, b, c) {
    let p = [],
      r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[0];
    r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
    r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
  };

  /**
     * Rotate a 3D vector around the y-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
  export let rotateY = function(out, a, b, c) {
    let p = [],
      r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
    r[1] = p[1];
    r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
  };

  /**
     * Rotate a 3D vector around the z-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
  export let rotateZ = function(out, a, b, c) {
    let p = [],
      r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
    r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
    r[2] = p[2];

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
  };

  /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
  export let forEach = (function() {
    let vec = create();

    return function(a, stride, offset, count, fn, arg) {
      let i, l;
      if (!stride) {
        stride = 3;
      }

      if (!offset) {
        offset = 0;
      }

      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }

      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }

      return a;
    };
  })();

  /**
     * Get the angle between two 3D vectors
     * @param {vec3} a The first operand
     * @param {vec3} b The second operand
     * @returns {Number} The angle in radians
     */
  export let angle = function(a, b) {
    let tempA = fromValues(a[0], a[1], a[2]);
    let tempB = fromValues(b[0], b[1], b[2]);

    normalize(tempA, tempA);
    normalize(tempB, tempB);

    let cosine = dot(tempA, tempB);

    if (cosine > 1.0) {
      return 0;
    } else {
      return Math.acos(cosine);
    }
  };

  /**
     * Returns a string representation of a vector
     *
     * @param {vec3} vec vector to represent as a string
     * @returns {String} string representation of the vector
     */
  export let str = function(a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
  };
}
