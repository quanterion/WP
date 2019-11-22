import { glMatrix } from './common';
import { mat4 } from './mat4';
import { vec3 } from './vec3';

export namespace geom3 {
  // returns array [t1, t2] or undefined
  export function lineLineIntersect(P1, Dir1, P2, Dir2): number[] | any {
    let N = [0, 0, 0];
    let L1P1 = [0, 0],
      L1D = [0, 0];
    let L2P1 = [0, 0],
      L2D = [0, 0];
    let cEps = 1e-8;
    let cEps2 = 1e-4;

    let P2DDirDirIntersect = (checkAxis: number) => {
      let t1 =
        (L2D[0] * L1P1[1] -
          L2D[1] * L1P1[0] -
          L2D[0] * L2P1[1] +
          L2D[1] * L2P1[0]) /
        (L1D[0] * L2D[1] - L1D[1] * L2D[0]);
      let t2 =
        (L1D[0] * L1P1[1] -
          L1D[1] * L1P1[0] -
          L1D[0] * L2P1[1] +
          L1D[1] * L2P1[0]) /
        (L1D[0] * L2D[1] - L1D[1] * L2D[0]);

      if (
        glMatrix.equalsd(
          P1[checkAxis] + Dir1[checkAxis] * t1,
          P2[checkAxis] + Dir2[checkAxis] * t2
        )
      )
        return [t1, t2];
    };
    vec3.cross(N, Dir1, Dir2);
    vec3.abs(N);
    if (N[2] > cEps2 && N[2] > N[0] && N[2] > N[1]) {
      L1P1[0] = P1[0];
      L1P1[1] = P1[1];
      L1D[0] = Dir1[0];
      L1D[1] = Dir1[1];
      L2P1[0] = P2[0];
      L2P1[1] = P2[1];
      L2D[0] = Dir2[0];
      L2D[1] = Dir2[1];
      return P2DDirDirIntersect(2);
    } else if (N[1] > cEps2 && N[1] > N[0]) {
      L1P1[0] = P1[0];
      L1P1[1] = P1[2];
      L1D[0] = Dir1[0];
      L1D[1] = Dir1[2];
      L2P1[0] = P2[0];
      L2P1[1] = P2[2];
      L2D[0] = Dir2[0];
      L2D[1] = Dir2[2];
      return P2DDirDirIntersect(1);
    } else if (N[0] > cEps2) {
      L1P1[0] = P1[2];
      L1P1[1] = P1[1];
      L1D[0] = Dir1[2];
      L1D[1] = Dir1[1];
      L2P1[0] = P2[2];
      L2P1[1] = P2[1];
      L2D[0] = Dir2[2];
      L2D[1] = Dir2[1];
      return P2DDirDirIntersect(0);
    }
  }

  export function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
  }
}
