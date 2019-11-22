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

/**
 * @class Common utilities
 * @name glMatrix
 */
export namespace glMatrix {
  // Configuration Constants
  export let EPSILON = 0.000001;
  export let EPSILONF = 0.001;
  export let ARRAY_TYPE = Float64Array;
  export let RANDOM = Math.random;
  export let ENABLE_SIMD = false;

  /**
     * Sets the type of array used when creating new vectors and matrices
     *
     * @param {Type} type Array type, such as Float32Array or Array
     */
  export let setMatrixArrayType = function(type) {
    glMatrix.ARRAY_TYPE = type;
  };

  export const degree = Math.PI / 180;

  /**
    * Convert Degree To Radian
    *
    * @param {Number} Angle in Degrees
    */
  export function toRadian(a) {
    return a * degree;
  }

  export function equals(a: number, b: number, epsilon: number) {
    return Math.abs(a - b) < epsilon;
  }

  export function equalsf(a: number, b: number) {
    return Math.abs(a - b) < EPSILONF;
  }

  export function equalsd(a: number, b: number) {
    return Math.abs(a - b) < EPSILON;
  }
}
