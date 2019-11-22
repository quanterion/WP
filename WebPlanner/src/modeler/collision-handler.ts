import { mat4 } from './geometry/mat4';
import { vec3 } from './geometry/vec3';
import { plane } from './geometry/plane';
import { Ray } from './geometry/ray';
import { Box } from './geometry/box';
import { geom3 } from './geometry/geometry3d';
import { eps } from './geometry';
import { Entity } from './designer';

export class OBB {
  constructor(public e?: Entity) { }
  box = new Box();
  globalBox = new Box();
  GCenter = vec3.create();
  GMin = vec3.create();
  GMax = vec3.create();
  GRad = 0;
  LocGMin = vec3.create();
  LocGMax = vec3.create();
  globalMatrix = mat4.createIdentity();
  invGlobalMatrix = mat4.createIdentity();
  visible = true;

  init(box: Box, matrix) {
    this.box.set(box.size);
    this.globalMatrix = matrix;
    mat4.invert(this.invGlobalMatrix, matrix);
    this.globalBox.clear();
    this.globalBox.addOBB(box, matrix);
    this.GMin = this.globalBox.min;
    this.GMax = this.globalBox.max;
    this.GCenter = this.globalBox.center;
    this.GRad = this.globalBox.diagonal * 0.5;
    this.LocGMin = box.min;
    this.LocGMax = box.max;
    return this;
  }

  move(dir) {
    vec3.add(this.GMin, this.GMin, dir);
    vec3.add(this.GMax, this.GMax, dir);
    vec3.add(this.GCenter, this.GCenter, dir);

    let mt = this.globalMatrix;
    mt[12] = mt[12] + dir[0];
    mt[13] = mt[13] + dir[1];
    mt[14] = mt[14] + dir[2];

    mat4.invert(this.invGlobalMatrix, mt);
  }
}

export class IntersectInfo {
  dir = vec3.create();
  invDir = vec3.create();
  distance = 0;

  intersectionFound = false;
  intersectNormal = vec3.create();
  intersectPos = vec3.create();

  box1?: OBB; // dynamic
  box2?: OBB; // static

  init(dir, distance) {
    vec3.copy(this.dir, dir);
    vec3.negate(this.invDir, this.dir);
    this.distance = distance;
    this.intersectionFound = false;
    return this;
  }

  setIntersection(box1: OBB, box2: OBB) {
    this.box1 = box1;
    this.box2 = box2;
    this.intersectionFound = true;
  }

  assign(source: IntersectInfo) {
    this.intersectionFound = source.intersectionFound;
    this.box1 = source.box1;
    this.box2 = source.box2;
    vec3.copy(this.dir, source.dir);
    vec3.copy(this.invDir, source.invDir);
    vec3.copy(this.intersectNormal, source.intersectNormal);
    vec3.copy(this.intersectPos, source.intersectPos);
    this.distance = source.distance;
  }
}

export class OBBIntersector {
  private borderLineCase = 0;
  private info: IntersectInfo;
  private Mesh1: OBB;
  private Mesh2: OBB;
  static readonly cEps2 = 1e-2;
  readonly cEps = 1e-8;

  public rayAABBIntersect(rayPos: Float64Array, rayDir: Float64Array, Mesh: OBB, info?: IntersectInfo) {
    let cEps2 = OBBIntersector.cEps2;
    let GMin = Mesh.LocGMin;
    let GMax = Mesh.LocGMax;
    let pos = vec3.create();
    info = info || this.info;

    let axisTest = (a0, a1, a2) => {
      if (rayDir[a0] > cEps2) {
        if (rayPos[a0] < GMin[a0] + cEps2) {
          let Dist = (GMin[a0] - rayPos[a0]) / rayDir[a0];
          if (Dist < info.distance) {
            pos = vec3.scaleAndAdd(pos, rayPos, rayDir, Dist);
            if (
              pos[a1] > GMin[a1] - cEps2 &&
              pos[a1] < GMax[a1] + cEps2 &&
              pos[a2] > GMin[a2] - cEps2 &&
              pos[a2] < GMax[a2] + cEps2
            ) {
              if (
                pos[a1] > GMin[a1] + cEps2 &&
                pos[a1] < GMax[a1] - cEps2 &&
                pos[a2] > GMin[a2] + cEps2 &&
                pos[a2] < GMax[a2] - cEps2
              ) {
                info.setIntersection(this.Mesh1, this.Mesh2);
                info.distance = Dist;
                let normal = info.intersectNormal;
                normal[a0] = -1.0;
                normal[a1] = 0.0;
                normal[a2] = 0.0;
                vec3.transformVectorMat4(normal, normal, Mesh.globalMatrix);
                vec3.transformMat4(info.intersectPos, pos, Mesh.globalMatrix);
                return true;
              } else {
                ++this.borderLineCase;
              }
            }
          }
        }
      } else if (rayDir[a0] < -cEps2) {
        if (rayPos[a0] > GMax[a0] - cEps2) {
          let Dist = (GMax[a0] - rayPos[a0]) / rayDir[a0];
          if (Dist < info.distance) {
            pos = vec3.scaleAndAdd(pos, rayPos, rayDir, Dist);
            if (
              pos[a1] > GMin[a1] - cEps2 &&
              pos[a1] < GMax[a1] + cEps2 &&
              pos[a2] > GMin[a2] - cEps2 &&
              pos[a2] < GMax[a2] + cEps2
            ) {
              if (
                pos[a1] > GMin[a1] + cEps2 &&
                pos[a1] < GMax[a1] - cEps2 &&
                pos[a2] > GMin[a2] + cEps2 &&
                pos[a2] < GMax[a2] - cEps2
              ) {
                info.setIntersection(this.Mesh1, this.Mesh2);
                info.distance = Dist;
                let normal = info.intersectNormal;
                normal[a0] = 1.0;
                normal[a1] = 0.0;
                normal[a2] = 0.0;
                vec3.transformVectorMat4(normal, normal, Mesh.globalMatrix);
                vec3.transformMat4(info.intersectPos, pos, Mesh.globalMatrix);
                return true;
              } else {
                ++this.borderLineCase;
              }
            }
          }
        }
      }
    };

    let ok = false;
    if (axisTest(0, 1, 2)) {
      ok = true;
    }
    if (axisTest(1, 0, 2)) {
      ok = true;
    }
    if (axisTest(2, 0, 1)) {
      ok = true;
    }
    return ok;
  }

  private lineAABBIntersect(MoveP1, MoveP2, Dir, AABBMin, AABBMax) {
    let cEps2 = OBBIntersector.cEps2;
    let cEps = this.cEps;
    let Info = this.info;
    let LineGMin = vec3.create();
    let LineGMax = vec3.create();

    if (MoveP1[0] < MoveP2[0]) {
      LineGMin[0] = MoveP1[0];
      LineGMax[0] = MoveP2[0];
    } else {
      LineGMax[0] = MoveP1[0];
      LineGMin[0] = MoveP2[0];
    }
    if (MoveP1[1] < MoveP2[1]) {
      LineGMin[1] = MoveP1[1];
      LineGMax[1] = MoveP2[1];
    } else {
      LineGMax[1] = MoveP1[1];
      LineGMin[1] = MoveP2[1];
    }
    if (MoveP1[2] < MoveP2[2]) {
      LineGMin[2] = MoveP1[2];
      LineGMax[2] = MoveP2[2];
    } else {
      LineGMax[2] = MoveP1[2];
      LineGMin[2] = MoveP2[2];
    }

    if (Dir[0] > 0) LineGMax[0] = LineGMax[0] + Dir[0] * Info.distance;
    else LineGMin[0] = LineGMin[0] + Dir[0] * Info.distance;
    if (LineGMax[0] < AABBMin[0]) return;
    if (LineGMin[0] > AABBMax[0]) return;

    if (Dir[1] > 0) {
      LineGMax[1] = LineGMax[1] + Dir[1] * Info.distance;
    } else {
      LineGMin[1] = LineGMin[1] + Dir[1] * Info.distance;
    }
    if (LineGMax[1] < AABBMin[1]) return;
    if (LineGMin[1] > AABBMax[1]) return;

    if (Dir[2] > 0) {
      LineGMax[2] = LineGMax[2] + Dir[2] * Info.distance;
    } else {
      LineGMin[2] = LineGMin[2] + Dir[2] * Info.distance;
    }
    if (LineGMax[2] < AABBMin[2]) return;
    if (LineGMin[2] > AABBMax[2]) return;

    let Plane = plane.createP3(
      MoveP1,
      MoveP2,
      vec3.add(vec3.create(), MoveP1, Dir)
    );
    let MoveLineDir = vec3.sub(vec3.create(), MoveP2, MoveP1);
    let MoveLineLength = vec3.length(MoveLineDir);
    vec3.scale(MoveLineDir, MoveLineDir, 1 / MoveLineLength);

    let LineLineInt = (Dir, P1, P2, LineDir) => {
      let t1 = plane.evalLocation(Plane, P1);
      let t2 = plane.evalLocation(Plane, P2);
      if ((t1 > cEps2 && t2 < -cEps2) || (t1 < -cEps2 && t2 > cEps2)) {
        let LinePos = plane.rayIntersect(P1, LineDir, Plane);
        if (LinePos) {
          let IntPos = vec3.scaleAndAdd(vec3.create(), P1, LineDir, LinePos);
          let negDir = vec3.negate(vec3.create(), Dir);
          let t = geom3.lineLineIntersect(MoveP1, MoveLineDir, IntPos, negDir);
          if (
            t &&
            t[0] > cEps2 &&
            t[0] < MoveLineLength - cEps2 &&
            t[1] > -cEps2 &&
            t[1] < Info.distance - cEps2
          ) {
            /// Eps2 or eps?!!!
            vec3.cross(Info.intersectNormal, MoveLineDir, LineDir);
            vec3.transformVectorMat4(
              Info.intersectNormal,
              Info.intersectNormal,
              this.Mesh2.globalMatrix
            );
            vec3.normalize(Info.intersectNormal, Info.intersectNormal);
            vec3.scaleAndAdd(Info.intersectPos, MoveP1, MoveLineDir, t[0]);
            vec3.transformMat4(
              Info.intersectPos,
              Info.intersectPos,
              this.Mesh2.globalMatrix
            );
            Info.distance = t[1];
            Info.setIntersection(this.Mesh1, this.Mesh2);
          }
        }
      }
    };

    // need to check only parts moving inside
    // to avoid fixing objects after sliding
    if (Dir[0] > cEps) {
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMin[2]),
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMin[2]),
        vec3.axisy
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMin[2]),
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMax[2]),
        vec3.axisz
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMax[2]),
        vec3.axis_y
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMin[2]),
        vec3.axis_z
      );
    } else if (Dir[0] < -cEps) {
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMin[2]),
        vec3.axisy
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMax[2]),
        vec3.axisz
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMax[2]),
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMax[2]),
        vec3.axis_y
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMax[2]),
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMin[2]),
        vec3.axis_z
      );
    }

    if (Dir[1] > cEps) {
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMin[2]),
        vec3.axisx
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMax[2]),
        vec3.axisz
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMax[2]),
        vec3.axis_x
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMin[2]),
        vec3.axis_z
      );
    } else if (Dir[1] < -cEps) {
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMin[2]),
        vec3.axisx
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMax[2]),
        vec3.axisz
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMax[2]),
        vec3.axis_x
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMin[2]),
        vec3.axis_z
      );
    }

    if (Dir[2] > cEps) {
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMin[2]),
        vec3.axisx
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMin[2]),
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMin[2]),
        vec3.axisy
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMin[2]),
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMin[2]),
        vec3.axis_x
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMin[2]),
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMin[2]),
        vec3.axis_y
      );
    } else if (Dir[2] < -cEps) {
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMax[2]),
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMax[2]),
        vec3.axisx
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMin[1], AABBMax[2]),
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMax[2]),
        vec3.axisy
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMax[0], AABBMax[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMax[2]),
        vec3.axis_x
      );
      LineLineInt(
        Dir,
        vec3.fromValues(AABBMin[0], AABBMax[1], AABBMax[2]),
        vec3.fromValues(AABBMin[0], AABBMin[1], AABBMax[2]),
        vec3.axis_y
      );
    }
  }

  public intersect(Mesh1: OBB, Mesh2: OBB, Info: IntersectInfo) {
    let cEps2 = OBBIntersector.cEps2;

    // check spheres
    this.Mesh1 = Mesh1;
    this.Mesh2 = Mesh2;
    this.info = Info;

    if (
      vec3.distance(Mesh1.GCenter, Mesh2.GCenter) >
      Mesh1.GRad + Mesh2.GRad + Info.distance
    )
      return;

    // check global AABB
    let CurDir = vec3.fcopy(Info.dir);
    let Distance = Info.distance;
    let CurGMin = vec3.fcopy(Mesh1.GMin);
    let CurGMax = vec3.fcopy(Mesh1.GMax);
    if (CurDir[0] > 0) {
      CurGMax[0] = CurGMax[0] + CurDir[0] * Distance;
    } else {
      CurGMin[0] = CurGMin[0] + CurDir[0] * Distance;
    }
    if (CurGMax[0] < Mesh2.GMin[0] + cEps2) return;
    if (CurGMin[0] > Mesh2.GMax[0] - cEps2) return;

    if (CurDir[1] > 0) CurGMax[1] = CurGMax[1] + CurDir[1] * Distance;
    else CurGMin[1] = CurGMin[1] + CurDir[1] * Distance;
    if (CurGMax[1] < Mesh2.GMin[1] + cEps2) return;
    if (CurGMin[1] > Mesh2.GMax[1] - cEps2) return;

    if (CurDir[2] > 0) CurGMax[2] = CurGMax[2] + CurDir[2] * Distance;
    else CurGMin[2] = CurGMin[2] + CurDir[2] * Distance;
    if (CurGMax[2] < Mesh2.GMin[2] + cEps2) return;
    if (CurGMin[2] > Mesh2.GMax[2] - cEps2) return;

    let Mt = mat4.create();
    Mt = mat4.multiply(Mt, Mesh2.invGlobalMatrix, Mesh1.globalMatrix);
    CurGMin = Mesh1.LocGMin;
    CurGMax = Mesh1.LocGMax;
    vec3.transformVectorMat4(CurDir, Info.dir, Mesh2.invGlobalMatrix);

    let V1 = vec3.ftransformCoordsMat4(CurGMin[0], CurGMin[1], CurGMin[2], Mt);
    let V5 = vec3.ftransformCoordsMat4(CurGMax[0], CurGMin[1], CurGMin[2], Mt);
    let V7 = vec3.ftransformCoordsMat4(CurGMax[0], CurGMax[1], CurGMin[2], Mt);
    let V8 = vec3.ftransformCoordsMat4(CurGMax[0], CurGMax[1], CurGMax[2], Mt);

    let DirX = vec3.sub(vec3.create(), V5, V1);
    let DirY = vec3.sub(vec3.create(), V7, V5);

    let V3 = vec3.fadd(V1, DirY);
    let V4 = vec3.fsub(V8, DirX);
    let V2 = vec3.fsub(V4, DirY);
    let V6 = vec3.fsub(V8, DirY);

    this.borderLineCase = 0;
    // test bounding verices against second OBB
    this.rayAABBIntersect(V1, CurDir, Mesh2);
    this.rayAABBIntersect(V2, CurDir, Mesh2);
    this.rayAABBIntersect(V3, CurDir, Mesh2);
    this.rayAABBIntersect(V4, CurDir, Mesh2);
    this.rayAABBIntersect(V5, CurDir, Mesh2);
    this.rayAABBIntersect(V6, CurDir, Mesh2);
    this.rayAABBIntersect(V7, CurDir, Mesh2);
    this.rayAABBIntersect(V8, CurDir, Mesh2);

    let middleVector = vec3.create();

    let MiddleVector = (a, b) => {
      middleVector[0] = (a[0] + b[0]) * 0.5;
      middleVector[1] = (a[1] + b[1]) * 0.5;
      middleVector[2] = (a[2] + b[2]) * 0.5;
      return middleVector;
    };

    if (this.borderLineCase > 0) {
      // middle of plane
      this.rayAABBIntersect(MiddleVector(V1, V4), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V5, V8), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V1, V7), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V2, V8), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V3, V8), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V1, V6), CurDir, Mesh2);

      // middle of edge
      this.rayAABBIntersect(MiddleVector(V1, V2), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V2, V4), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V4, V3), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V3, V1), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V5, V6), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V6, V8), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V8, V7), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V7, V5), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V1, V5), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V2, V6), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V3, V7), CurDir, Mesh2);
      this.rayAABBIntersect(MiddleVector(V4, V8), CurDir, Mesh2);
    }

    CurGMin = Mesh2.LocGMin;
    CurGMax = Mesh2.LocGMax;

    // test each line against AABB wireframe
    this.lineAABBIntersect(V1, V2, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V2, V4, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V4, V3, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V3, V1, CurDir, CurGMin, CurGMax);

    this.lineAABBIntersect(V5, V6, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V6, V8, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V8, V7, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V7, V1, CurDir, CurGMin, CurGMax);

    this.lineAABBIntersect(V1, V5, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V2, V6, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V3, V7, CurDir, CurGMin, CurGMax);
    this.lineAABBIntersect(V4, V8, CurDir, CurGMin, CurGMax);

    Mt = mat4.multiply(Mt, Mesh1.invGlobalMatrix, Mesh2.globalMatrix);
    vec3.transformVectorMat4(CurDir, Info.invDir, Mesh1.invGlobalMatrix);

    V1 = vec3.ftransformCoordsMat4(CurGMin[0], CurGMin[1], CurGMin[2], Mt);
    V5 = vec3.ftransformCoordsMat4(CurGMax[0], CurGMin[1], CurGMin[2], Mt);
    V7 = vec3.ftransformCoordsMat4(CurGMax[0], CurGMax[1], CurGMin[2], Mt);
    V8 = vec3.ftransformCoordsMat4(CurGMax[0], CurGMax[1], CurGMax[2], Mt);

    DirX = vec3.sub(vec3.create(), V5, V1);
    DirY = vec3.sub(vec3.create(), V7, V5);

    V3 = vec3.fadd(V1, DirY);
    V4 = vec3.fsub(V8, DirX);
    V2 = vec3.fsub(V4, DirY);
    V6 = vec3.fsub(V8, DirY);

    this.borderLineCase = 0;

    // test second OBB bounding vertices against first OBB
    this.rayAABBIntersect(V1, CurDir, Mesh1);
    this.rayAABBIntersect(V2, CurDir, Mesh1);
    this.rayAABBIntersect(V3, CurDir, Mesh1);
    this.rayAABBIntersect(V4, CurDir, Mesh1);
    this.rayAABBIntersect(V5, CurDir, Mesh1);
    this.rayAABBIntersect(V6, CurDir, Mesh1);
    this.rayAABBIntersect(V7, CurDir, Mesh1);
    this.rayAABBIntersect(V8, CurDir, Mesh1);

    if (this.borderLineCase > 0) {
      // middle of plane
      this.rayAABBIntersect(MiddleVector(V1, V4), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V5, V8), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V1, V7), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V2, V8), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V3, V8), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V1, V6), CurDir, Mesh1);

      // middle of edge
      this.rayAABBIntersect(MiddleVector(V1, V2), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V2, V4), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V4, V3), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V3, V1), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V5, V6), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V6, V8), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V8, V7), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V7, V5), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V1, V5), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V2, V6), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V3, V7), CurDir, Mesh1);
      this.rayAABBIntersect(MiddleVector(V4, V8), CurDir, Mesh1);
    }
  }

  private box1 = new Box();
  private box2 = new Box();
  private transformMatrix = mat4.create();

  public isIntersect(Mesh1: OBB, Mesh2: OBB, Mesh2Matrix): boolean {
    const cEps2 = OBBIntersector.cEps2;
    let box1 = this.box1;
    let box2 = this.box2;

    box1.assign(Mesh1.globalBox);
    box1.enlarge(-cEps2);

    box2.clear();
    box2.addOBB(Mesh2.globalBox, Mesh2Matrix);

    if (!box1.isIntersect(box2)) {
      return false;
    }

    let transform = this.transformMatrix;

    box1.assign(Mesh1.box);
    box1.enlarge(-cEps2);

    mat4.multiply(transform, Mesh2Matrix, Mesh2.globalMatrix);
    mat4.multiply(transform, Mesh1.invGlobalMatrix, transform);
    box2.clear();
    box2.addOBB(Mesh2.box, transform);

    if (!box1.isIntersect(box2)) {
      return false;
    }

    box1.assign(Mesh2.box);
    box1.enlarge(-cEps2);

    mat4.invert(transform, transform);
    box2.clear();
    box2.addOBB(Mesh1.box, transform);

    if (!box1.isIntersect(box2)) {
      return false;
    }

    return true;
  }
}

export class CollisionHandler {
  private staticObjects = new Array<OBB>();
  private dynamicObjects = new Array<OBB>();
  private intersector = new OBBIntersector();

  public moveDynamic(dir) {
    for (let k = 0; k < this.dynamicObjects.length; k++)
      this.dynamicObjects[k].move(dir);
  }

  public clear() {
    this.staticObjects = [];
    this.dynamicObjects = [];
  }

  logStatus() {
    console.log(
      `Collision handler: dynamics = ${this.dynamicObjects
        .length}, statics = ${this.staticObjects.length}`
    );
  }

  addObject(e: Entity, box: Box, matrix, staticObj: boolean, visible: boolean) {
    let obb = new OBB(e);
    obb.init(box, matrix);
    obb.visible = visible;
    staticObj ? this.staticObjects.push(obb) : this.dynamicObjects.push(obb);
  }

  rayIntersectStatic(ray: Ray) {
    let intInfo = new IntersectInfo();
    intInfo.distance = ray.distance;
    let localPos = vec3.create();
    let localDir = vec3.create();
    for (let obb of this.staticObjects) {
      if (obb.visible) {
        vec3.transformMat4(localPos, ray.pos, obb.invGlobalMatrix);
        vec3.transformVectorMat4(localDir, ray.dir, obb.invGlobalMatrix);
        if (this.intersector.rayAABBIntersect(localPos, localDir, obb, intInfo)) {
          intInfo.box1 = obb;
          intInfo.box2 = obb;
        }
      }
    }
    ray.intersected = intInfo.intersectionFound;
    ray.distance = intInfo.distance;
    return intInfo;
  }

  isDynamicInsideBox(box: Box, transform?: Float64Array) {
    if (!transform) {
      for (let obj of this.dynamicObjects) {
        if (!box.boxInside(obj.globalBox)) {
          return false;
        }
      }
      return true;
    }
    let testBox = box.copy();
    testBox.enlarge(eps);
    let objBox = new Box();
    let matrix = mat4.create();
    for (let obj of this.dynamicObjects) {
      mat4.multiply(matrix, transform, obj.globalMatrix);
      objBox.clear();
      objBox.addOBB(obj.box, matrix);
      if (!box.boxInside(objBox)) {
        return false;
      }
    }
    return true;
  }

  // returns distance and intersectionNormal or -1
  intersect(info: IntersectInfo) {
    for (let i = 0; i < this.dynamicObjects.length; i++)
      for (let j = 0; j < this.staticObjects.length; j++) {
        this.intersector.intersect(
          this.dynamicObjects[i],
          this.staticObjects[j],
          info
        );
      }
  }

  isIntersect(matrix: Float64Array, hidden = true): boolean {
    for (let dyn of this.dynamicObjects) {
      for (let stat of this.staticObjects) {
        let check = hidden || stat.visible;
        if (check && this.intersector.isIntersect(stat, dyn, matrix)) {
          return true;
        }
      }
    }
    return false;
  }

  lastCollision = new IntersectInfo();

  // returns dir
  move(dir, smartSlide = true) {
    let distance = vec3.length(dir);
    let dirLength = distance;
    let normDir = vec3.fnormalize(dir);
    let intInfo = new IntersectInfo();
    this.lastCollision.intersectionFound = false;

    // intersect and slide along dir
    let moveCount = 0;
    let maxMoveCount = 3;
    let result = vec3.create();
    let cEps2 = OBBIntersector.cEps2;
    let normals = [];

    while (moveCount < maxMoveCount) {
      intInfo.init(normDir, distance);
      this.intersect(intInfo);
      let newDistance = intInfo.distance;
      if (!intInfo.intersectionFound) {
        vec3.scaleAndAdd(result, result, normDir, distance);
        this.moveDynamic(vec3.scale(vec3.create(), normDir, distance));
        break;
      } else if (newDistance < -cEps2) break;
      else {
        this.lastCollision.assign(intInfo);
        if (newDistance < cEps2) newDistance = 0;
        vec3.scaleAndAdd(result, result, normDir, newDistance);
        this.moveDynamic(vec3.scale(vec3.create(), normDir, newDistance));
        distance = 0;
        if (vec3.empty(intInfo.intersectNormal)) break;
        if (vec3.length(result) > dirLength) break;

        vec3.sub(normDir, dir, result);

        normals.push(vec3.fcopy(intInfo.intersectNormal));
        let ProjDir = plane.normalProjectOnPlane(
          normDir,
          intInfo.intersectNormal
        );
        if (vec3.empty(ProjDir)) break;
        normDir = ProjDir;
        distance = vec3.length(normDir);
        vec3.normalize(normDir, normDir);

        ++moveCount;
      }
    }

    if (smartSlide && vec3.length(result) + cEps2 < vec3.length(dir) && normals.length >= 2) {
      let moveDir = vec3.cross(vec3.create(), normals[0], normals[1]);
      if (vec3.normalize(moveDir, moveDir)) {
        let needDir = vec3.sub(vec3.create(), dir, result);
        let distance = vec3.dot(moveDir, needDir);
        if (distance < 0) {
          distance = -distance;
          vec3.negate(moveDir, moveDir);
        }
        intInfo.init(moveDir, distance);
        this.intersect(intInfo);
        let newDistance = intInfo.distance;
        if (newDistance > cEps2) {
          vec3.scaleAndAdd(result, result, moveDir, newDistance);
          this.moveDynamic(vec3.scale(vec3.create(), moveDir, newDistance));
        }
      }
    }
    return result;
  }

  moveDistance(dir: Float64Array, distance: number, defaultDistance = -1): number {
    let intInfo = new IntersectInfo();
    intInfo.init(dir, distance);
    this.intersect(intInfo);
    if (intInfo.intersectionFound) {
      return Math.max(intInfo.distance, 0);
    } else {
      return defaultDistance;
    }
  }
}
