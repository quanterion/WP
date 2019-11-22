import { glMatrix } from './common';
import { mat3 } from './mat3';
import { vec3 } from './vec3';
import { vec4 } from './vec4';

export namespace quat {
  // Creates a new identity quat
  export let create = function() {
    let out = new glMatrix.ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
  };

  // Normalize a quat
  export let normalize = vec4.normalize;

  // Sets a quaternion to represent the shortest rotation from one vector to another
  export let rotationTo = (function() {
    let tmpvec3 = vec3.create();
    let xUnitVec3 = vec3.fromValues(1, 0, 0);
    let yUnitVec3 = vec3.fromValues(0, 1, 0);

    return function(out, a, b) {
      let dot = vec3.dot(a, b);
      if (dot < -0.999999) {
        vec3.cross(tmpvec3, xUnitVec3, a);
        if (vec3.length(tmpvec3) < 0.000001) vec3.cross(tmpvec3, yUnitVec3, a);
        vec3.normalize(tmpvec3, tmpvec3);
        setAxisAngle(out, tmpvec3, Math.PI);
        return out;
      } else if (dot > 0.999999) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
      } else {
        vec3.cross(tmpvec3, a, b);
        out[0] = tmpvec3[0];
        out[1] = tmpvec3[1];
        out[2] = tmpvec3[2];
        out[3] = 1 + dot;
        return normalize(out, out);
      }
    };
  })();

  /**
     * Sets the specified quaternion with values corresponding to the given
     * axes. Each axis is a vec3 and is expected to be unit length and
     * perpendicular to all other specified axes.
     */
  export let setAxes = (function() {
    let matr = mat3.create();

    return function(out, view, right, up) {
      matr[0] = right[0];
      matr[3] = right[1];
      matr[6] = right[2];

      matr[1] = up[0];
      matr[4] = up[1];
      matr[7] = up[2];

      matr[2] = -view[0];
      matr[5] = -view[1];
      matr[8] = -view[2];

      return normalize(out, fromMat3(out, matr));
    };
  })();

    export let clone = vec4.clone;

  export let fromValues = vec4.fromValues;

  export let copy = vec4.copy;

  export let set = vec4.set;

  export let identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
  };

  export function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    let s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
  }

  export let add = vec4.add;

  export let multiply = function(out, a, b) {
    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3],
      bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  };

  export let mul = multiply;

  export let scale = vec4.scale;

  export let rotateX = function(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3],
      bx = Math.sin(rad),
      bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
  };

  export let rotateY = function(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3],
      by = Math.sin(rad),
      bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
  };

  export let rotateZ = function(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3],
      bz = Math.sin(rad),
      bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
  };

  export let calculateW = function(out, a) {
    let x = a[0],
      y = a[1],
      z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
  };

  export let dot = vec4.dot;

  export let lerp = vec4.lerp;

  export let slerp = function(out, a, b, t) {
    if (t === 0) {
      return copy(out, a);
    }
    if (t === 1) {
      return copy(out, b);
    }

    let x = a[0];
    let y = a[1];
    let z = a[2];
    let w = a[3];
    let bx = b[0];
    let by = b[1];
    let bz = b[2];
    let bw = b[3];

    let cosHalfTheta = x * bx + y * by + z * bz + w * bw;
    if (cosHalfTheta < 0) {
      cosHalfTheta = -cosHalfTheta;
      vec4.negate(out, b);
    } else {
      vec4.copy(out, b);
    }

    if (cosHalfTheta >= 1.0) {
      vec4.copy(out, a);
    }

    let sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
    if (sqrSinHalfTheta <= Number.EPSILON) {
      let s = 1 - t;
      out[3] = s * w + t * out[3];
      out[0] = s * x + t * out[0];
      out[1] = s * y + t * out[1];
      out[2] = s * z + t * out[2];
      return normalize(out, out);
    }

    let sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    let halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    let ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    let ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    out[3] = ( w * ratioA + out[3] * ratioB );
    out[0] = ( x * ratioA + out[0] * ratioB );
    out[1] = ( y * ratioA + out[1] * ratioB );
    out[2] = ( z * ratioA + out[2] * ratioB );
    return out;
  };

  export let sqlerp = (function() {
    let temp1 = create();
    let temp2 = create();

    return function(out, a, b, c, d, t) {
      slerp(temp1, a, d, t);
      slerp(temp2, b, c, t);
      slerp(out, temp1, temp2, 2 * t * (1 - t));

      return out;
    };
  })();

  export let invert = function(out, a) {
    let a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3,
      invDot = dot ? 1.0 / dot : 0;

    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
    out[0] = -a0 * invDot;
    out[1] = -a1 * invDot;
    out[2] = -a2 * invDot;
    out[3] = a3 * invDot;
    return out;
  };

  export let conjugate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
  };

  export let length = vec4.length;

  export let squaredLength = vec4.squaredLength;

  export let sqrLen = squaredLength;

  export function fromMat3(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    let fTrace = m[0] + m[4] + m[8];
    let fRoot;

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0); // 2w
      out[3] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot; // 1/(4w)
      out[0] = (m[5] - m[7]) * fRoot;
      out[1] = (m[6] - m[2]) * fRoot;
      out[2] = (m[1] - m[3]) * fRoot;
    } else {
      // |w| <= 1/2
      let i = 0;
      if (m[4] > m[0]) i = 1;
      if (m[8] > m[i * 3 + i]) i = 2;
      let j = (i + 1) % 3;
      let k = (i + 2) % 3;

      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
      out[i] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
      out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
      out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
  }

  export let fromMat4 = function(out, m) {
    let m11 = m[0],
      m12 = m[4],
      m13 = m[8],
      m21 = m[1],
      m22 = m[5],
      m23 = m[9],
      m31 = m[2],
      m32 = m[6],
      m33 = m[10],
      trace = m11 + m22 + m33,
      s;

    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1.0);

      out[3] = 0.25 / s;
      out[0] = (m32 - m23) * s;
      out[1] = (m13 - m31) * s;
      out[2] = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

      out[3] = (m32 - m23) / s;
      out[0] = 0.25 * s;
      out[1] = (m12 + m21) / s;
      out[2] = (m13 + m31) / s;
    } else if (m22 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

      out[3] = (m13 - m31) / s;
      out[0] = (m12 + m21) / s;
      out[1] = 0.25 * s;
      out[2] = (m23 + m32) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

      out[3] = (m21 - m12) / s;
      out[0] = (m13 + m31) / s;
      out[1] = (m23 + m32) / s;
      out[2] = 0.25 * s;
    }

    return out;
  };

  // outVector != v
  export function transformVector(outVector, q, v) {
    let s = q[3];
    vec3.scale(outVector, q, 2.0 * vec3.dot(q, v));
    vec3.scaleAndAdd(outVector, outVector, v, s * s - vec3.dot(q, q));
    let ucrossv = vec3.cross(vec3.create(), q, v);
    vec3.scaleAndAdd(outVector, outVector, ucrossv, 2.0 * s);
    return outVector;
  }

  // return aa[0]..[2] - axis and a[3] - angle;
  export function toAxisAngle(q, aa): boolean {
    let vl = vec3.length(q);
    if (vl > glMatrix.EPSILON) {
      let ivl = 1.0 / vl;
      vec3.scale(aa, q, ivl);
      if (q[3] < 0) {
        aa[3] = 2.0 * Math.atan2(-vl, -q[3]);
      } else {
        aa[3] = 2.0 * Math.atan2(vl, q[3]);
      }
      return true;
    } else {
      aa[0] = 0.0;
      aa[1] = 1.0;
      aa[2] = 0.0;
      aa[3] = 0.0;
      return false;
    }
  }

  export let str = function(a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
  };
}
