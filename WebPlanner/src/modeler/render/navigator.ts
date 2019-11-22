import { MeshBatch, TextureCache } from "./render-scene";
import { Mesh, Designer } from "modeler/designer";
import { Box, mat4, vec3, Ray, eps } from "modeler/geometry";
import * as twgl from './twgl';
import * as Shaders from './shaders';
import { RenderPipeline } from "./pipeline";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";

const axisPosValue = 1.2;
const axisLength = 2.5;
const axisThickness = 0.03;
const axisNameIndent = 0.3;
const letterBoxExtent = 0.4;
const letterBoxThickness = 0.04;
const startVertexIndex = 6;
const startEdgeIndex = 14;

export class NavigatorCube {
  private cube: MeshBatch;
  private selected: MeshBatch;
  private csAxes: {
    x: MeshBatch,
    y: MeshBatch,
    z: MeshBatch
  };
  private xNameElems: MeshBatch;
  private yNameElems: MeshBatch;
  private zNameElems: MeshBatch;
  private program: twgl.IProgramInfo;
  private transform = mat4.createIdentity32();
  private camera = mat4.createIdentity32();
  private cubeTexture: WebGLTexture;
  // 0 .. 5 - cube faces [-x, +x, -y, +y, -z, +z]
  // 6 .. 13 - cube vertices [-x-y-z, -x-y+z, ...]
  private selectedIndex = -1;
  private viewport = {width: 1, height: 1};
  private cubeBox = new Box();
  private ray = new Ray();

  private vecXLabel = vec3.create();
  private vecYLabel = vec3.create();
  private vecZLabel = vec3.create();
  private labelOffsetVector = vec3.create();
  private labelOffsetMatrix = mat4.createIdentity32();
  private handset = false;
  private cubeClicked = false;

  constructor(
    private ds: Designer,
    private gl: WebGLRenderingContext,
    textures: TextureCache,
    shaderPrecision: string,
    breakpointObserver: BreakpointObserver
  ) {
    this.program = twgl.createProgramInfoWithVariables(
      gl, Shaders.navigatorCube, shaderPrecision, undefined, true
    );
    breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.handset = result.matches;
    });
    this.cube = new MeshBatch(false);
    this.cubeTexture = textures.load('./assets/img/cube.png').texture;
    this.selected = new MeshBatch(false);
    this.csAxes = {
      x: new MeshBatch(false),
      y: new MeshBatch(false),
      z: new MeshBatch(false)
    };
    let csOriginPos = -axisPosValue - axisThickness;
    let csAxesBoxMin = vec3.fromValues(csOriginPos, csOriginPos, csOriginPos);
    let csAxesBoxMax = vec3.create();
    let xAxisBoxMax = vec3.create();
    let yAxisBoxMax = vec3.create();
    let zAxisBoxMax = vec3.create();
    csAxesBoxMax[0] = -axisPosValue + axisLength;
    csAxesBoxMax[1] = -axisPosValue + axisThickness / 2;
    csAxesBoxMax[2] = -axisPosValue + axisThickness / 2;

    vec3.copy(xAxisBoxMax, csAxesBoxMax);
    yAxisBoxMax[0] = csAxesBoxMax[2];
    yAxisBoxMax[1] = csAxesBoxMax[0];
    yAxisBoxMax[2] = csAxesBoxMax[1];
    zAxisBoxMax[0] = csAxesBoxMax[1];
    zAxisBoxMax[1] = csAxesBoxMax[2];
    zAxisBoxMax[2] = csAxesBoxMax[0];

    this.vecXLabel = vec3.fromValues(xAxisBoxMax[0] + axisNameIndent, -axisPosValue, -axisPosValue);
    this.vecYLabel = vec3.fromValues(-axisPosValue, yAxisBoxMax[1] + axisNameIndent, -axisPosValue);
    this.vecZLabel = vec3.fromValues(-axisPosValue, -axisPosValue, zAxisBoxMax[2] + axisNameIndent);

    this.cubeBox.set([-1, -1, -1, 1, 1, 1]);
    this.cube.addMesh(this.createMesh(this.cubeBox));
    this.setMeshToElem(this.cube, this.cubeBox);

    this.csAxes.x.addMesh(this.createMesh(Box.fromMinMax(csAxesBoxMin, xAxisBoxMax)));
    this.csAxes.y.addMesh(this.createMesh(Box.fromMinMax(csAxesBoxMin, yAxisBoxMax)));
    this.csAxes.z.addMesh(this.createMesh(Box.fromMinMax(csAxesBoxMin, zAxisBoxMax)));

    let incline = 1; // radians
    let rStickRotateMatr = mat4.fromZRotation(mat4.createIdentity32(), incline);
    let lStickRotateMatr = mat4.fromZRotation(mat4.createIdentity32(), -incline);
    let bmax = vec3.fromValues(0.5 * letterBoxExtent, 0.5 * letterBoxThickness, 0.5 * letterBoxThickness);
    let bmin = vec3.fnegate(bmax);
    let stdStickBox = Box.fromMinMax(bmin, bmax);
    let letterHalfWidth = bmax[0] * Math.cos(incline);
    let letterHalfHeight = bmax[0] * Math.sin(incline);

    this.xNameElems = new MeshBatch(false);
    this.xNameElems.addMesh(this.createMesh(stdStickBox), rStickRotateMatr);
    this.xNameElems.addMesh(this.createMesh(stdStickBox), lStickRotateMatr);

    let vYStickBox = Box.from([bmin[1], -0.5 * letterHalfHeight, bmin[2], bmax[1], 0.5 * letterHalfHeight, bmax[2]]);
    let inclinedYSticksBox = Box.from([0.5 * bmin[0], bmin[1], bmin[2], 0.5 * bmax[0], bmax[1], bmax[2]]);
    let lStickYMatr = mat4.ffromTranslation(-0.5 * letterHalfWidth, letterHalfHeight, 0);
    let rStickYMatr = mat4.ffromTranslation(0.5 * letterHalfWidth, letterHalfHeight, 0);
    lStickYMatr = mat4.multiply(lStickYMatr, lStickYMatr, lStickRotateMatr);
    rStickYMatr = mat4.multiply(rStickYMatr, rStickYMatr, rStickRotateMatr);

    this.yNameElems = new MeshBatch(false);
    this.yNameElems.addMesh(this.createMesh(vYStickBox));
    this.yNameElems.addMesh(this.createMesh(inclinedYSticksBox), lStickYMatr);
    this.yNameElems.addMesh(this.createMesh(inclinedYSticksBox), rStickYMatr);

    let hZStickBox = Box.from([-letterHalfWidth, bmin[1], bmin[2], letterHalfWidth, bmax[1], bmax[2]]);
    let topZStickMatr = mat4.ffromTranslation(0, letterHalfHeight, 0);
    let bottomZStickMatr = mat4.ffromTranslation(0, -letterHalfHeight, 0);

    this.zNameElems = new MeshBatch(false);
    this.zNameElems.addMesh(this.createMesh(stdStickBox), rStickRotateMatr);
    this.zNameElems.addMesh(this.createMesh(hZStickBox), topZStickMatr);
    this.zNameElems.addMesh(this.createMesh(hZStickBox), bottomZStickMatr);
  }

  createMesh(box: Box) {
    let mesh = new Mesh();
    mesh.createBox(box);
    return mesh;
  }

  setMeshToElem(elem: MeshBatch, box: Box, matrix?: Float64Array) {
    let mesh = new Mesh();
    mesh.createBox(box);
    elem.addMesh(mesh, matrix);
  }

  drawBatch(batch: MeshBatch, color: number[], pipeline: RenderPipeline) {
    this.program.uniformSetters.u_color(color);
    batch.draw(pipeline, false);
  }

  destroy() {
    this.cube.remove(this.gl);
    this.selected.remove(this.gl);
    this.csAxes.x.remove(this.gl);
    this.csAxes.y.remove(this.gl);
    this.csAxes.z.remove(this.gl);
    this.xNameElems.remove(this.gl);
    this.yNameElems.remove(this.gl);
    this.zNameElems.remove(this.gl);
    this.gl.deleteProgram(this.program.program);
  }

  drawAxisLabels(pipeline: RenderPipeline) {
    this.program.uniformSetters.u_useTexture(0);
    // x label
    vec3.transformVectorMat4(this.labelOffsetVector, this.vecXLabel, this.camera);
    mat4.fromTranslation(this.labelOffsetMatrix, this.labelOffsetVector);
    this.program.uniformSetters.u_meshMatrix(this.labelOffsetMatrix);
    this.drawBatch(this.xNameElems, [1, 0, 0, 1], pipeline);
    // y label
    vec3.transformVectorMat4(this.labelOffsetVector, this.vecYLabel, this.camera);
    mat4.fromTranslation(this.labelOffsetMatrix, this.labelOffsetVector);
    this.program.uniformSetters.u_meshMatrix(this.labelOffsetMatrix);
    this.drawBatch(this.yNameElems, [0, 1, 0, 1], pipeline);
    // z label
    vec3.transformVectorMat4(this.labelOffsetVector, this.vecZLabel, this.camera);
    mat4.fromTranslation(this.labelOffsetMatrix, this.labelOffsetVector);
    this.program.uniformSetters.u_meshMatrix(this.labelOffsetMatrix);
    this.drawBatch(this.zNameElems, [0, 0, 1, 1], pipeline);
  }

  draw(pipeline: RenderPipeline) {
    this.viewport = pipeline.viewport;
    let enlargeCube = this.handset && this.cubeClicked;
    let largeRectSize = Math.min(this.viewport.width, this.viewport.height) / 2;
    let rectSize = enlargeCube ? largeRectSize : 80;
    let border = axisLength + axisNameIndent;
    let leftBorder = -border * pipeline.viewport.width / rectSize;
    let bottomBorder = -border * pipeline.viewport.height / rectSize;
    let rightTopPos = (axisLength + axisNameIndent) - 0.2;
    mat4.ortho(this.transform, leftBorder, rightTopPos - 0.2, bottomBorder, rightTopPos, border, -border);
    mat4.copy(this.camera, pipeline.modelViewMatrix);
    this.camera[12] = this.camera[13] = this.camera[14] = 0;
    let gl = pipeline.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    pipeline.setProgram(this.program);
    this.program.uniformSetters.u_useTexture(0);
    this.program.uniformSetters.u_texture(this.cubeTexture);
    this.program.uniformSetters.u_transformMatrix(this.transform);
    this.program.uniformSetters.u_meshMatrix(this.camera);
    this.drawBatch(this.csAxes.x, [1, 0, 0, 0.95], pipeline);
    this.drawBatch(this.csAxes.y, [0, 1, 0, 0.95], pipeline);
    this.drawBatch(this.csAxes.z, [0, 0, 1, 0.95], pipeline);
    this.drawAxisLabels(pipeline);
    this.program.uniformSetters.u_meshMatrix(this.camera);
    this.program.uniformSetters.u_useTexture(1);
    this.drawBatch(this.cube, [1, 1, 1, 0.2], pipeline);
    if (this.selectedIndex >= 0) {
      this.program.uniformSetters.u_useTexture(0);
      let selectedTransparency = this.selectedIndex > 5 ? 0.66 : 0.5;
      this.drawBatch(this.selected, [0, 1, 1, selectedTransparency], pipeline);
    }
    gl.disable(gl.BLEND);
  }

  handle(x: number, y: number, orient: boolean) {
    this.ray.pos = vec3.fromValues(
      2.0 * x / this.viewport.width - 1.0,
      -2.0 * y / this.viewport.height + 1.0,
      10);
    this.ray.dir = vec3.fromAxis(2 + 3);
    let resMatrix = mat4.multiply(mat4.create(), this.transform, this.camera);
    this.ray.transform(mat4.finvert(resMatrix));
    this.ray.distance = 100;
    this.ray.intersected = false;
    if (this.ray.intersectBox(this.cubeBox)) {
      let selected = this.findView(this.ray.intersectPos);
      if (orient) {
        if (this.handset) {
          this.cubeClicked = !this.cubeClicked;
          if (this.cubeClicked) {
            this.ds.invalidate();
            return true;
          }
        }
        this.orient(selected);
        setTimeout(() => {
          this.setSelectedIndex(-1);
        }, 500);
      } else if (selected !== this.selectedIndex) {
        this.setSelectedIndex(selected);
      }
      return true;
    }
    if (this.selectedIndex >= 0) {
      this.setSelectedIndex(-1);
    }
    return false;
  }

  private findView(pos: Float64Array) {
    let result = 0;
    let split = 0.6;
    let abs = vec3.fabs(pos);

    const getPointIndex = (pos) => {
      let index = 0;
      if (pos[2] > 0) {
        index += 1;
      }
      if (pos[1] > 0) {
        index += 2;
      }
      if (pos[0] > 0) {
        index += 4;
      }
      return index;
    }
    if (abs[0] > split && abs[1] > split && abs[2] > split) {
      return result + getPointIndex(pos) + startVertexIndex;
    }

    for (let axis = 0; axis < 3; ++axis) {
      let axis1 = (axis + 1) % 3;
      let axis2 = (axis + 2) % 3;
      if (abs[axis1] > split && abs[axis2] > split) {
        pos[axis] = -1;
        let index1 = getPointIndex(pos);
        pos[axis] = 1;
        let index2 = getPointIndex(pos);
        return index2 * 10 + index1 + startEdgeIndex;
      }
    }
    result = vec3.maxCoord(abs);
    if (pos[result] > 0) {
      return result * 2 + 1;
    }
    return result * 2;
  }



  private setSelectedIndex(index: number) {
    this.selectedIndex = index;
    this.ds.invalidate();
    if (index < 0) {
      return;
    }
    let box = new Box();
    let delta = 0.01;
    const vertexDelta = 0.4;
    const edgeDelta = 0.2;
    const setBoxSIze = ( size: number[], vertexIndex: number, offset: number) => {
      if (vertexIndex < 4) {
        size[3] = -1 + offset;
      } else {
        size[0] = 1 - offset;
      }
      if (vertexIndex % 4 < 2) {
        size[4] = -1 + offset;
      } else {
        size[1] = 1 - offset;
      }
      if (vertexIndex % 2 === 0) {
        size[5] = -1 + offset;
      } else {
        size[2] = 1 - offset;
      }
      return size;
    }
    let size = [
      -1 - delta, -1 - delta, -1 - delta,
      1 + delta, 1 + delta, 1 + delta
    ];
    this.selected.clear();
    if (index < startVertexIndex) {
      let axis = Math.floor(index / 2);
      if (index % 2 === 0) {
        size[axis + 3] = -1;
      } else {
        size[axis] = 1;
      }
    } else if (index < startEdgeIndex) {
      index = index - 6;
      size = setBoxSIze(size, index, vertexDelta);
    } else {
      index = index - startEdgeIndex;
      let vertexIndex1 = index % 10;
      let vertexIndex2 = (index - vertexIndex1) / 10;
      let diffIndex = Math.abs(vertexIndex2 - vertexIndex1);
      size = setBoxSIze(size, vertexIndex2, edgeDelta);
      let extentAxis = Math.ceil((4 - diffIndex) / 2);
      size[extentAxis] = -1 - delta;
      size[extentAxis + 3] = 1 + delta;
    }
    box.set(size);
    this.selected.addMesh(this.createMesh(box));
  }

  private orient(index: number) {
    let axisz = vec3.fromValues(1, 1, 1);
    let axisy = vec3.fcopy(vec3.axisy);
    const setZAxisDir = (axisz: Float64Array, vertex: number) => {
      if (vertex < 4) {
        axisz[0] = -1;
      }if (vertex % 4 < 2) {
        axisz[1] = -1;
      }
      if (vertex % 2 === 0) {
        axisz[2] = -1;
      }
      return axisz;
    }
    if (index < startVertexIndex) {
      let axis = Math.floor(index / 2);
      axisz = vec3.fromAxis(axis, index % 2 === 0);
      vec3.cross(axisy, axisz, vec3.axisy);
      vec3.cross(axisy, axisy, axisz);
      if (vec3.empty(axisy)) {
        vec3.copy(axisy, index === 2 ? vec3.axisz : vec3.axis_z);
      }
    } else if (index < startEdgeIndex) {
      let vertex = index - startVertexIndex;
      axisz = setZAxisDir(axisz, vertex);
      vec3.cross(axisy, axisz, vec3.axisy);
      vec3.cross(axisy, axisy, axisz);
    } else {
      index = index - startEdgeIndex;
      let vertex1 = index % 10;
      let vertex2 = (index - vertex1) / 10;
      axisz = setZAxisDir(axisz, vertex2);
      let diffIndex = Math.abs(vertex2 - vertex1);
      let extentAxis = Math.ceil((4 - diffIndex) / 2);
      axisz[extentAxis] = 0;
      vec3.cross(axisy, axisz, vec3.axisy);
      vec3.cross(axisy, axisy, axisz);
    }
    vec3.normalize(axisy, axisy);
    vec3.normalize(axisz, axisz);

    let oldAxisz = this.ds.camera.NtoGlobal(vec3.axisz);
    let oldAxisy = this.ds.camera.NtoGlobal(vec3.axisy);
    if (vec3.equals(oldAxisz, axisz) && vec3.equals(oldAxisy, axisy) && index < 6) {
      vec3.negate(axisz, axisz);
      if (Math.abs(vec3.dot(axisz, vec3.axisy)) > 1 - eps) {
        vec3.negate(axisy, axisy);
      }
    }

    let center = this.ds.camera.findRotationCenter();
    this.ds.animateCamera();
    this.ds.camera.orient(axisz, axisy);
    let distance = vec3.distance(center, this.ds.camera.translation);
    vec3.scaleAndAdd(center, center, axisz, distance);
    this.ds.camera.translation = center;
  }
}
