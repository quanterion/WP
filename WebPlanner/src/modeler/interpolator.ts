import { glMatrix } from './geometry/common';
import { mat4 } from './geometry/mat4';
import { vec3 } from './geometry/vec3';
import { quat } from './geometry/quat';
import { geom3 } from './geometry/geometry3d';

export class MatrixInterpolator {
  private _sourcePos = vec3.create();
  private _destinationPos = vec3.create();
  private _sourceQuat = quat.create();
  private _destinationQuat = quat.create();
  private _currentPos = vec3.create();
  private _currentQuat = quat.create();

  private _rotCenter = vec3.create();
  private _rotAxis = vec3.create();
  private _rotAngle = 0;

  constructor(sourceMatrix?, destinationMatrix?) {
    if (sourceMatrix) {
      this.setSource(sourceMatrix);
    }
    if (destinationMatrix) {
      this.setDestination(destinationMatrix);
    }
  }

  setSource(matrix) {
    mat4.getTranslation(this._sourcePos, matrix);
    quat.fromMat4(this._sourceQuat, matrix);
  }

  setDestination(matrix) {
    mat4.getTranslation(this._destinationPos, matrix);
    quat.fromMat4(this._destinationQuat, matrix);
    this.calcRotationCenter();
  }

  calcRotationCenter() {
    let rotDiff = quat.create();
    quat.invert(rotDiff, this._sourceQuat);
    quat.multiply(rotDiff, this._destinationQuat, rotDiff);
    this._rotAngle = 0.0;
    let axisAngle = quat.create();
    let d = vec3.dist(this._sourcePos, this._destinationPos);
    if (quat.toAxisAngle(rotDiff, axisAngle) && d > glMatrix.EPSILON) {
      let angle = axisAngle[3];
      if (angle < 0) {
        vec3.negate(axisAngle, axisAngle);
        angle = -angle;
      }
      if (Math.abs(angle) > 0.01) {
        let r = d * 0.5 / Math.sin(axisAngle[3] * 0.5);
        let center = vec3.fmiddle(this._sourcePos, this._destinationPos);
        let moveDir = vec3.fsub(this._destinationPos, this._sourcePos);
        vec3.normalize(moveDir, moveDir);
        let centerDir = vec3.cross(vec3.create(), axisAngle, moveDir);
        vec3.normalize(centerDir, centerDir);
        let s = Math.sqrt(r * r - d * d / 4);
        vec3.scaleAndAdd(this._rotCenter, center, centerDir, s);
        vec3.copy(this._rotAxis, axisAngle);
        this._rotAngle = angle;
      }
    }
  }

  interpolate(outMatrix, t, test = false) {
    if (test || t < 1 - glMatrix.EPSILON) {
      quat.slerp(this._currentQuat, this._sourceQuat, this._destinationQuat, t);
      if (Math.abs(this._rotAngle) > glMatrix.EPSILON) {
        let dir1 = vec3.fsub(this._sourcePos, this._rotCenter);
        let mt = mat4.fromRotation(
          mat4.create(),
          this._rotAngle * t,
          this._rotAxis
        );
        let dir2 = vec3.transformVectorMat4(vec3.create(), dir1, mt);

        let diff = vec3.fsub(dir2, dir1);
        vec3.add(this._currentPos, this._sourcePos, diff);
      } else {
        vec3.lerp(this._currentPos, this._sourcePos, this._destinationPos, t);
      }
    } else {
      vec3.copy(this._currentPos, this._destinationPos);
      quat.copy(this._currentQuat, this._destinationQuat);
    }
    mat4.fromRotationTranslation(
      outMatrix,
      this._currentQuat,
      this._currentPos
    );
    return outMatrix;
  }

  estimateDuration(diagonal: number) {
    if (diagonal < 1.0) diagonal = 1.0;
    let moveDuration =
      3.0 * vec3.dist(this._sourcePos, this._destinationPos) / diagonal;

    let rotDiff = quat.create();
    quat.invert(rotDiff, this._sourceQuat);
    quat.multiply(rotDiff, this._destinationQuat, rotDiff);
    let diffAngle = Math.acos(geom3.clamp(rotDiff[3], -1.0, 1.0)) * 2.0;
    let rotateDuration = 2.0 * Math.abs(diffAngle / Math.PI);

    let duration = Math.max(moveDuration, rotateDuration);
    if (duration > 1.0) duration = 1.0;
    return duration;
  }
}

export class AnimationFrame {
  move = vec3.create();
  axisPos = vec3.create();
  axisDir = vec3.create();
  angle = 0;
  length = 1;

  interpolate(t: number) {
    let mat = mat4.createIdentity();
    mat4.translate(mat, mat, this.axisPos);
    mat4.rotate(mat, mat, this.angle * t, this.axisDir);
    mat4.translate(mat, mat, [
      -this.axisPos[0],
      -this.axisPos[1],
      -this.axisPos[2]
    ]);
    mat4.translate(mat, mat, vec3.fscale(this.move, t));
    return mat;
  }
}

export class Animation {
  entity: string;
  frames = new Array<AnimationFrame>();

  get length() {
    let l = 0;
    for (let frame of this.frames) {
      l += frame.length;
    }
    return l;
  }

  interpolate(t: number) {
    let position = t;
    let curPos = 0;
    let mat = mat4.createIdentity();
    for (let frame of this.frames) {
      let frameParam = (position - curPos) / frame.length;
      if (frameParam > 1.0) {
        frameParam = 1.0;
      }
      let frameMatrix = frame.interpolate(frameParam);
      mat4.multiply(mat, mat, frameMatrix);
      curPos += frame.length;
      if (curPos > position - glMatrix.EPSILON) {
        break;
      }
    }
    return mat;
  }
}

export class CompoundAnimation {
  items = Array<Animation>();
  time?: number;
}
