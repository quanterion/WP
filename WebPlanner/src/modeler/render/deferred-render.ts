import * as twgl from './twgl';
import { vec3, mat4 } from '../geometry';
import { ShaderProgram, sunsky } from './shaders';
import * as Shaders from './deferred-shaders';
import {
  RenderMode,
  MeshBatch,
  FillOptions,
} from "./render-scene";
import { NumberMakr } from './number-makr';
import { WebGL2RenderingContext } from './twgl';
import { RenderFunction, RenderPipeline } from './pipeline';

class EnvironmentMap {
  private SIZE = 512;
  environmentTexture: WebGLTexture;
  private frameBuffer: WebGLFramebuffer;
  private depthBuffer: WebGLRenderbuffer;
  revision = -1;
  pos: Float64Array;
  used = true;

  constructor (private gl: WebGL2RenderingContext) {
    this.depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, this.SIZE, this.SIZE);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    this.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.environmentTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.environmentTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for (let i = 0; i < 6; i++) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA,
        this.SIZE, this.SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }

  destroy() {
    this.gl.deleteFramebuffer(this.frameBuffer);
    this.gl.deleteRenderbuffer(this.depthBuffer);
    this.gl.deleteTexture(this.environmentTexture);
  }

  renderEnvironment(render: RenderFunction, pos: Float64Array, exclude: MeshBatch) {
    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.viewport(0, 0, this.SIZE, this.SIZE);
    let projectionMatrix = mat4.perspective(mat4.createIdentity32(), Math.PI / 2, 1.0, 50.0, 15000) as Float32Array;

    let cameraMatrix = mat4.createIdentity32();
    let modelViewMatrix = mat4.createIdentity32();

    let renderSide = (side) => {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, side, this.environmentTexture, 0);
      gl.clearColor(0, 0, 0, 0);
      render(projectionMatrix, cameraMatrix, modelViewMatrix, exclude);
    }

    let axisx = vec3.create();
    let orient = (axisz, axisy) => {
      let m = cameraMatrix;
      vec3.cross(axisx, axisy, axisz);
      // x
      m[0] = axisx[0];
      m[1] = axisx[1];
      m[2] = axisx[2];
      m[3] = 0;
      // y
      m[4] = axisy[0];
      m[5] = axisy[1];
      m[6] = axisy[2];
      m[7] = 0;
      // z
      m[8] = axisz[0];
      m[9] = axisz[1];
      m[10] = axisz[2];
      m[11] = 0;
      // shift
      m[12] = pos[0];
      m[13] = pos[1];
      m[14] = pos[2];
      m[15] = 1;
      mat4.invert(modelViewMatrix, m);
    }

    orient([-1, 0, 0], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_POSITIVE_X);
    orient([1, 0, 0], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
    orient([0, -1, 0], [0, 0, 1]);
    renderSide(gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
    orient([0, 1, 0], [0, 0, -1]);
    renderSide(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);
    orient([0, 0, -1], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
    orient([0, 0, 1], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.environmentTexture);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }
}

export class DeferredRender {
  private depthBuffer: WebGLTexture;
  private normalBuffer: WebGLTexture;
  private colorBuffer: WebGLTexture;
  private lightBuffer: WebGLTexture;
  private rotationNoizeTexture: WebGLTexture;
  private materialParamsArray = new Uint8Array(256 * 4);
  private materialParamsTexture: WebGLTexture;
  private FBO: WebGLFramebuffer;

  private ssaoBuffer: WebGLTexture;
  private ssaoFBO: WebGLFramebuffer;

  private blurBuffer: WebGLTexture;
  private blurFBO: WebGLFramebuffer;

  // FXAA postprocess
  private fxaaProgram: twgl.IProgramInfo;
  private combineBuffer: WebGLTexture;
  private combineFBO: WebGLFramebuffer;

  // TAA
  get taaSupported() {
    return !!this.taaFBO;
  }
  private taaProgram?: twgl.IProgramInfo;
  private taaBuffer?: WebGLTexture;
  private taaFBO?: WebGLFramebuffer;
  private taaStep = 0;
  private taaWeight = 0;
  private taaSamples = [ [0, 0],
    [ - 4, - 7 ], [ - 7, - 5 ], [ - 3, - 5 ], [ - 5, - 4 ],
    [ - 1, - 4 ], [ - 2, - 2 ], [ - 6, - 1 ], [ - 4, 0 ],
    [ - 7, 1 ], [ - 1, 2 ], [ - 6, 3 ], [ - 3, 3 ],
    [ - 7, 6 ], [ - 3, 6 ], [ - 5, 7 ], [ - 1, 7 ],
    [ 5, - 7 ], [ 1, - 6 ], [ 6, - 5 ], [ 4, - 4 ],
    [ 2, - 3 ], [ 7, - 2 ], [ 1, - 1 ], [ 4, - 1 ],
    [ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
    [ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]];

  private geometryProgram: twgl.IProgramInfo;
  private bumpGeometryProgram: twgl.IProgramInfo;
  private geometryWithReflectionProgram: twgl.IProgramInfo;
  private zfillProgram: twgl.IProgramInfo;
  private lightGeometryProgram: twgl.IProgramInfo;
  private selectionGeometryProgram: twgl.IProgramInfo;
  private ssaoProgram: twgl.IProgramInfo;
  private combineProgram: twgl.IProgramInfo;
  private combineProgramLights = -1;
  private combineProgramShadows = -1;
  private forwardProgram: twgl.IProgramInfo;
  private forwardLightsCount = -1;
  private sunskyProgram: twgl.IProgramInfo;
  private skyboxProgram: twgl.IProgramInfo;
  private blurAlpha5Program: twgl.IProgramInfo;
  private blurProgram9: twgl.IProgramInfo;
  private imageProgram: twgl.IProgramInfo;
  private lightsCount = 0;
  private shadowsCount = 0;

  private width = 0;
  private height = 0;
  private effectWidth = 0;
  private effectHeight = 0;
  private maxReflectionObjects = 10;

  private environmentMaps: { [index: string]: EnvironmentMap } = {};

  ROTATION_NOISE_SIDE_LENGTH = 4;
  ROTATION_NOISE_SIZE = 4 * 4;
  SSAO_RADIUS = 50.0;
  KERNEL_SIZE = 16;

  private createRenderBuffer(depth?: boolean): WebGLTexture {
    let gl = this.gl;
    let result = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, result);
    if (depth) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.DEPTH_COMPONENT32F,
        2,
        2,
        0,
        gl.DEPTH_COMPONENT,
        gl.FLOAT,
        null
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return result;
  }

  loadProgram(
    program: ShaderProgram,
    variables?: { [name: string]: any},
    webgl1?: boolean
  ) {
    return twgl.createProgramInfoWithVariables(this.gl, program, this.shaderPrecision, variables, webgl1);
  }

  constructor(public gl: WebGL2RenderingContext, private shaderPrecision: string) {
    gl.activeTexture(gl.TEXTURE0);
    this.colorBuffer = this.createRenderBuffer();
    this.lightBuffer = this.createRenderBuffer();
    this.blurBuffer = this.createRenderBuffer();
    this.normalBuffer = this.createRenderBuffer();
    this.depthBuffer = this.createRenderBuffer(true);
    this.geometryProgram = this.loadProgram(Shaders.geometry);
    this.zfillProgram = this.loadProgram(Shaders.zfill);
    this.lightGeometryProgram = this.loadProgram(Shaders.lightGeometry);
    this.selectionGeometryProgram = this.loadProgram(Shaders.selectionGeometry);
    this.skyboxProgram = this.loadProgram(Shaders.skybox);
    this.sunskyProgram = this.loadProgram(sunsky, undefined, true);
    this.blurAlpha5Program = this.loadProgram(Shaders.blurAlpha5);
    this.blurProgram9 = this.loadProgram(Shaders.blur9);
    this.imageProgram = this.loadProgram(Shaders.image);

    this.FBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.depthBuffer,
      0
    );
    gl.activeTexture(gl.TEXTURE0);

    this.ssaoBuffer = this.createRenderBuffer();
    this.ssaoFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ssaoFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.ssaoBuffer,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.blurBuffer = this.createRenderBuffer();
    this.blurFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.blurBuffer,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.fxaaProgram = this.loadProgram(Shaders.fxaa);
    this.combineBuffer = this.createRenderBuffer();
    this.combineFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.combineFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.combineBuffer,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (gl.getExtension('EXT_color_buffer_float')) {
      this.taaBuffer = this.createRenderBuffer();
      this.taaFBO = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.taaFBO);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.taaBuffer,
        0
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    this.materialParamsTexture = this.gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.materialParamsTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  destroy() {
    this.gl.deleteTexture(this.colorBuffer);
    this.gl.deleteTexture(this.lightBuffer);
    this.gl.deleteTexture(this.normalBuffer);
    this.gl.deleteTexture(this.depthBuffer);
    this.gl.deleteTexture(this.ssaoBuffer);
    this.gl.deleteTexture(this.blurBuffer);
    this.gl.deleteTexture(this.rotationNoizeTexture);
    this.gl.deleteTexture(this.materialParamsTexture);
    this.gl.deleteFramebuffer(this.FBO);
    this.gl.deleteFramebuffer(this.ssaoFBO);
    this.gl.deleteFramebuffer(this.blurFBO);
    this.gl.deleteFramebuffer(this.combineFBO);
    if (this.taaFBO) {
      this.gl.deleteFramebuffer(this.taaFBO);
    }

    if (this.combineProgram) {
      this.gl.deleteProgram(this.combineProgram.program);
    }
    if (this.forwardProgram) {
      this.gl.deleteProgram(this.forwardProgram.program);
    }
    this.gl.deleteProgram(this.geometryProgram.program);
    if (this.bumpGeometryProgram) {
      this.gl.deleteProgram(this.bumpGeometryProgram.program);
    }
    this.gl.deleteProgram(this.lightGeometryProgram.program);
    this.gl.deleteProgram(this.selectionGeometryProgram.program);
    this.gl.deleteProgram(this.blurAlpha5Program.program);
    this.gl.deleteProgram(this.blurProgram9.program);
    this.gl.deleteProgram(this.zfillProgram.program);
    this.gl.deleteProgram(this.imageProgram.program);
    this.gl.deleteProgram(this.skyboxProgram.program);
    this.gl.deleteProgram(this.sunskyProgram.program);
    if (this.fxaaProgram) {
      this.gl.deleteProgram(this.fxaaProgram.program);
    }
    if (this.taaProgram) {
      this.gl.deleteProgram(this.taaProgram.program);
    }
    this.clearMap(this.environmentMaps);
    this.environmentMaps = undefined;
    this.gl = undefined;
  }

  private clearMap(map: { [e: string]: { destroy(); }}) {
    for (let itemName in map) {
      let item = map[itemName];
      if (item) {
        item.destroy();
      }
    }
  }

  private createSsaoProgram() {
    this.ssaoProgram = this.loadProgram(Shaders.ssao, {
      KERNEL_SIZE: this.KERNEL_SIZE
    });
    this.gl.useProgram(this.ssaoProgram.program);
    this.ssaoProgram.uniformSetters.u_radius(this.SSAO_RADIUS);

    let random = new NumberMakr();
    let gkernel = new Float32Array(this.KERNEL_SIZE * 3);
    for (let i = 0; i < this.KERNEL_SIZE; ++i) {
      let x = random.randomWithin(-1, 1);
      let y = random.randomWithin(-1, 1);
      let z = random.randomWithin(0, 1);
      let scale = i / this.KERNEL_SIZE;
      scale = scale * scale;
      if (scale < 0.1) scale = 0.1;
      if (scale > 1.0) scale = 1.0;
      let l = scale / Math.sqrt(x * x + y * y + z * z);
      gkernel[i * 3 + 0] = x * l;
      gkernel[i * 3 + 1] = y * l;
      gkernel[i * 3 + 2] = z * l;
    }
    this.ssaoProgram.uniformSetters.u_kernel(gkernel);

    let gnoize = new Float32Array(this.ROTATION_NOISE_SIZE * 3);
    for (let i = 0; i < this.ROTATION_NOISE_SIZE; ++i) {
      let x = random.randomWithin(-1, 1);
      let y = random.randomWithin(-1, 1);
      let l = Math.sqrt(x * x + y * y);
      gnoize[i * 3 + 0] = x / l;
      gnoize[i * 3 + 1] = y / l;
      gnoize[i * 3 + 2] = 0;
    }

    let gl = this.gl;
    this.rotationNoizeTexture = this.gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.rotationNoizeTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB32F,
      this.ROTATION_NOISE_SIDE_LENGTH,
      this.ROTATION_NOISE_SIDE_LENGTH,
      0,
      gl.RGB,
      gl.FLOAT,
      gnoize
    );
    this.ssaoProgram.uniformSetters.u_rotationNoiseScale([
      this.width / this.ROTATION_NOISE_SIDE_LENGTH,
      this.height / this.ROTATION_NOISE_SIDE_LENGTH
    ]);
    this.unbindTextures(1);
  }

  private getCombineProgram() {
    if (this.lightsCount !== this.combineProgramLights || this.shadowsCount !== this.combineProgramShadows) {
      if (this.combineProgram) {
        this.gl.deleteProgram(this.combineProgram.program);
      }
      this.combineProgram = this.loadProgram(Shaders.combine,
        { LIGHT_COUNT: this.lightsCount || undefined,
          SHADOW_COUNT: this.shadowsCount || undefined });
      this.combineProgramLights = this.lightsCount;
      this.combineProgramShadows = this.shadowsCount;
    }
    return this.combineProgram;
  }

  resize(width: number, height: number) {
    if (this.width === width && this.height === height) return;
    let gl = this.gl;
    this.width = width;
    this.height = height;
    this.effectWidth = ~~(width / 2);
    this.effectHeight = ~~(height / 2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.colorBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, this.lightBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, this.blurBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.effectWidth,
      this.effectHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, this.normalBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, this.depthBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT32F,
      width,
      height,
      0,
      gl.DEPTH_COMPONENT,
      gl.FLOAT,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, this.ssaoBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.effectWidth,
      this.effectHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    if (this.ssaoProgram) {
      gl.useProgram(this.ssaoProgram.program);
      this.ssaoProgram.uniformSetters.u_rotationNoiseScale([
        width / this.ROTATION_NOISE_SIDE_LENGTH,
        height / this.ROTATION_NOISE_SIDE_LENGTH
      ]);
    }

    gl.bindTexture(gl.TEXTURE_2D, this.combineBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    if (this.taaBuffer) {
      gl.bindTexture(gl.TEXTURE_2D, this.taaBuffer);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        width,
        height,
        0,
        gl.RGBA,
        gl.HALF_FLOAT,
        null
      );
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  private drawSkybox(pipeline: RenderPipeline, projectionMatrix?: Float32Array, cameraMatrix?: Float32Array) {
    if (pipeline.background === '#sunsky') {
      if (this.sunskyProgram) {
        this.gl.depthMask(false);
        pipeline.setProgram(this.sunskyProgram);
        let sunPos = pipeline.scene.sunLight.computePosition();
        this.sunskyProgram.uniformSetters.u_sunPosition(sunPos);
        this.sunskyProgram.uniformSetters.u_luminance(pipeline.scene.sunLight.shaderLuminance());
        pipeline.scene.drawScreenQuad();
        this.gl.depthMask(true);
        return true;
      }
    } else if (
      this.skyboxProgram &&
      pipeline.backgroundTexture &&
      pipeline.background
    ) {
      this.gl.depthMask(false);
      this.gl.useProgram(this.skyboxProgram.program);
      this.skyboxProgram.uniformSetters.u_projectionMatrix(projectionMatrix || pipeline.uniforms.u_projectionMatrix);
      this.skyboxProgram.uniformSetters.u_cameraMatrix(cameraMatrix || pipeline.uniforms.u_cameraMatrix);
      pipeline.gl.bindTexture(
        pipeline.gl.TEXTURE_CUBE_MAP,
        pipeline.backgroundTexture
      );
      pipeline.scene.drawScreenQuad();
      pipeline.gl.bindTexture(pipeline.gl.TEXTURE_CUBE_MAP, null);
      this.gl.depthMask(true);
      return true;
    }
    return false;
  }

  private unbindTextures(count: number) {
    for (let i = count - 1; i >= 0; --i) {
      this.gl.activeTexture(this.gl.TEXTURE0 + i);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
  }

  private findNearestEnvMap(pos: Float64Array, distance: number) {
    let map: EnvironmentMap;
    for (let r in this.environmentMaps) {
      let curMap = this.environmentMaps[r];
      if (curMap && curMap.pos && vec3.distance(pos, curMap.pos) < distance) {
        distance = vec3.distance(pos, curMap.pos);
        map = curMap;
      }
    }
    return map;
  }

  private drawReflectionObjects(pipeline: RenderPipeline) {
    if (!this.geometryWithReflectionProgram) {
      this.geometryWithReflectionProgram = this.loadProgram(Shaders.geometry, { REFLECTIONS: true });
    }
    let gl = this.gl;
    let reflectedObjects = 0;
    let sceneSize = pipeline.ds.box.maxSize;
    for (let bundleName in pipeline.scene.materials) {
      let bundle = pipeline.scene.materials[bundleName];
      if (bundle.renderMaterial.reflection < 0.01) continue;
      bundle.prepareReflected(pipeline);
      for (let batch of bundle.batches) {
        let entity = batch.anyEntity;
        let cubemapPos = batch.envMapPos;
        if (!entity || !cubemapPos) continue;
        reflectedObjects++;
        let batchName = bundleName + '\n' + entity.uidStr;
        let reflection = this.environmentMaps[batchName];
        if (!reflection) {
          reflection = this.findNearestEnvMap(cubemapPos, sceneSize * 0.02);
        }
        if (!reflection) {
          if (reflectedObjects <= this.maxReflectionObjects) {
            reflection = new EnvironmentMap(this.gl);
            this.environmentMaps[batchName] = reflection;
          } else {
            reflection = this.findNearestEnvMap(cubemapPos, sceneSize * 2.0);
          }
        }
        if (!reflection) continue;

        reflection.used = true;
        let canUpdate = !pipeline.adaptive || reflection.revision === -1;
        if (canUpdate && pipeline.scene.revision !== reflection.revision) {
          reflection.pos = cubemapPos;
          reflection.renderEnvironment(
            (p, c, m, e) => this.drawSceneForward(pipeline, p, c, m, e),
            cubemapPos, batch);
          reflection.revision = pipeline.scene.revision;
          pipeline.gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
          gl.viewport(0, 0, this.width, this.height);
        }

        pipeline.setProgram(this.geometryWithReflectionProgram);
        let uniforms = this.geometryWithReflectionProgram.uniformSetters;
        uniforms.u_reflection(bundle.renderMaterial.reflection);
        uniforms.u_viewPos(new Float32Array(pipeline.viewPos));
        uniforms.u_environmentMap(reflection.environmentTexture);
        bundle.renderMaterial.apply(pipeline);
        let transparent = bundle.renderMaterial.transparency > 0.01;
        if (transparent) {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        batch.draw(pipeline);
        if (transparent) {
          gl.disable(gl.BLEND);
        }
      }
    }
  }

  private getForwardProgram() {
    if (this.lightsCount !== this.forwardLightsCount) {
      if (this.forwardProgram) {
        this.gl.deleteProgram(this.forwardProgram.program);
      }
      this.forwardProgram = this.loadProgram(Shaders.forwardFill,
        { LIGHT_COUNT: this.lightsCount || undefined });
      this.forwardLightsCount = this.lightsCount;
    }
    return this.forwardProgram;
  }

  private drawSceneForward(pipeline: RenderPipeline,
      projectionMatrix: Float32Array,
      cameraMatrix: Float32Array,
      modelViewMatrix: Float32Array,
      exclude: MeshBatch
    ) {
    let gl = this.gl;
    gl.clearColor(1, 1, 1, 1);
    if (this.drawSkybox(pipeline, projectionMatrix, cameraMatrix)) {
      gl.clear(gl.DEPTH_BUFFER_BIT);
    } else {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    let program = this.getForwardProgram();
    gl.useProgram(program.program);
    pipeline.program = program;
    pipeline.setLightingParams(program, modelViewMatrix);
    program.uniformSetters.u_projectionMatrix(projectionMatrix);
    program.uniformSetters.u_modelViewMatrix(modelViewMatrix);
    let fillOptions = new FillOptions();
    fillOptions.drawReflected = true;
    fillOptions.exclude = exclude;
    fillOptions.drawHidden = true;
    pipeline.scene.renderFill(pipeline, fillOptions);
  }

  private geometryPass(pipeline: RenderPipeline) {
    let gl = this.gl;
    gl.clearDepth(1.0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    gl.viewport(0, 0, this.width, this.height);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.colorBuffer,
      0
    );
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    // fill color, normal and depth buffers
    if (!this.drawSkybox(pipeline)) {
      gl.clearBufferfv(gl.COLOR, 0, [1.0, 1.0, 1.0, 1.0]); // color buffer
    }

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT1,
      gl.TEXTURE_2D,
      this.normalBuffer,
      0
    );
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.clearBufferfv(gl.COLOR, 1, [0.0, 0.0, 0.0, 0.0]);

    pipeline.setProgram(this.geometryProgram);
    this.geometryProgram.uniformSetters.u_frontFace(1.0);
    let fillOptions = new FillOptions();
    fillOptions.drawReflected = this.maxReflectionObjects === 0;
    fillOptions.drawBumpMaps = false;
    let fillResult = pipeline.scene.renderFill(pipeline, fillOptions);
    if (this.maxReflectionObjects > 0 && fillResult.reflectedMaterials) {
      this.unbindTextures(3);
      this.drawReflectionObjects(pipeline);
    }
    if (fillResult.bumpMaterials) {
      if (!this.bumpGeometryProgram) {
        this.bumpGeometryProgram = this.loadProgram(Shaders.geometry, { BUMPMAP: true });
      }
      pipeline.setProgram(this.bumpGeometryProgram);
      this.bumpGeometryProgram.uniformSetters.u_frontFace(1.0);
      fillOptions.drawBumpMaps = true;
      pipeline.scene.renderFill(pipeline, fillOptions);
    }

    // draw lights
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.lightBuffer,
      0
    );
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
    gl.depthMask(false);
    pipeline.setProgram(this.lightGeometryProgram);
    this.lightGeometryProgram.uniformSetters.u_lightColor(pipeline.lightDisplayColor);
    this.lightGeometryProgram.uniformSetters.u_alpha(0);
    pipeline.scene.renderLights(pipeline);

    if (pipeline.selection && pipeline.ds.hasSelection) {
      // draw selection setting 1.0 to alpha channel
      gl.disable(gl.DEPTH_TEST);
      pipeline.setProgram(this.selectionGeometryProgram);
      fillOptions.drawReflected = true;
      fillOptions.withMaterials = false;
      fillOptions.selectionOnly = true;
      fillOptions.drawBumpMaps = undefined;
      pipeline.scene.renderFill(pipeline, fillOptions);
      gl.enable(gl.DEPTH_TEST);
    }

    gl.depthMask(true);
  }

  private ssaoPass(pipeline: RenderPipeline) {
    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ssaoFBO);
    gl.viewport(0, 0, this.effectWidth, this.effectHeight);
    gl.disable(gl.DEPTH_TEST);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.ssaoProgram.program);
    // default was 0.00025 .. 0.1
    this.ssaoProgram.uniformSetters.u_depthRange([
      pipeline.zLimits.near * 1e-5,
      pipeline.zLimits.near * 1e-3 * 3
    ]);
    this.ssaoProgram.uniformSetters.u_projectionMatrix(
      pipeline.projectionMatrix
    );
    this.ssaoProgram.uniformSetters.u_inverseProjectionMatrix(
      pipeline.invProjectionMatrix
    );
    this.ssaoProgram.uniformSetters.u_depthTexture(this.depthBuffer);
    this.ssaoProgram.uniformSetters.u_normalTexture(this.normalBuffer);
    this.ssaoProgram.uniformSetters.u_rotationNoiseTexture(
      this.rotationNoizeTexture
    );
    pipeline.scene.drawScreenQuad();
    this.unbindTextures(3);
  }

  private combinePass(pipeline: RenderPipeline, destination: WebGLFramebuffer = null) {
    let shadowMaps: WebGLTexture[];
    let shadows = pipeline.shadows;
    if (shadows) {
      shadowMaps = shadows.computeShadowMaps(pipeline);
    }

    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
    gl.viewport(0, 0, this.width, this.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let combineProgram = this.getCombineProgram();
    pipeline.setProgram(combineProgram);
    let inverseProjectionMatrixSetter = this.combineProgram.uniformSetters.u_inverseProjectionMatrix;
    if (inverseProjectionMatrixSetter) {
      inverseProjectionMatrixSetter(pipeline.invProjectionMatrix);
    }
    let uniforms = combineProgram.uniformSetters;
    uniforms.u_colorTexture(this.colorBuffer);
    uniforms.u_ssaoTexture(this.ssaoBuffer);
    uniforms.u_lightTexture(this.lightBuffer);
    uniforms.u_depthTexture(this.depthBuffer);
    uniforms.u_normalTexture(this.normalBuffer);
    uniforms.u_selectionOutlineColor(pipeline.selectionOutlineColor.slice(0, 3));
    uniforms.u_materialParams(this.materialParamsTexture);
    if (shadows && uniforms.u_shadowMaps) {
      uniforms.u_shadowMaps(shadowMaps);
      uniforms.u_depthValues([-shadows.shadowMinZ, 1 / (shadows.shadowMaxZ - shadows.shadowMinZ)]);
    }
    pipeline.scene.drawScreenQuad();
    this.unbindTextures(7);
  }

  private fillZBuffer(pipeline: RenderPipeline) {
    let gl = this.gl;
    pipeline.setProgram(this.zfillProgram);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 1.0);
    let fillOptions = new FillOptions();
    fillOptions.withMaterials = false;
    pipeline.gl.colorMask(false, false, false, false);
    pipeline.scene.renderFill(pipeline, fillOptions);
    // fill z buffer with light geometry to hide lines under lights
    pipeline.scene.renderLights(pipeline);
    pipeline.gl.colorMask(true, true, true, true);
    gl.disable(gl.POLYGON_OFFSET_FILL);
  }

  private wireframePass(
    pipeline: RenderPipeline,
    wireProgram: twgl.IProgramInfo,
  ) {
    pipeline.setProgram(wireProgram);
    pipeline.scene.renderWireframe(pipeline, [0, 0, 0]);
    pipeline.scene.renderWireframe(pipeline, [0, 0, 0]);
  }

  private drawLigtsAbovePass(pipeline: RenderPipeline) {
    pipeline.setProgram(this.lightGeometryProgram);
    this.lightGeometryProgram.uniformSetters.u_lightColor(pipeline.lightDisplayColor);
    this.lightGeometryProgram.uniformSetters.u_alpha(1);
    pipeline.scene.renderLights(pipeline);
  }

  private blurImage(
    pipeline: RenderPipeline,
    image: WebGLTexture,
    program: twgl.IProgramInfo,
    sourceWidth?: number,
    sourceHeight?: number
  ) {
    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.blurBuffer,
      0
    );
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.viewport(0, 0, this.effectWidth, this.effectHeight);
    gl.disable(gl.DEPTH_TEST);

    pipeline.setProgram(program);
    // can blur from full resolution to half resolution
    program.uniformSetters.u_resolution([
      sourceWidth || this.effectWidth,
      sourceHeight || this.effectHeight
    ]);
    program.uniformSetters.u_image(image);
    program.uniformSetters.u_direction([1, 0]);
    pipeline.scene.drawScreenQuad();
    this.unbindTextures(1);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      image,
      0
    );
    program.uniformSetters.u_image(this.blurBuffer);
    program.uniformSetters.u_resolution([this.effectWidth, this.effectHeight]);
    program.uniformSetters.u_direction([0, 1]);
    pipeline.scene.drawScreenQuad();
    this.unbindTextures(1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private drawImage(pipeline: RenderPipeline, image: WebGLTexture) {
    pipeline.setProgram(this.imageProgram);
    this.imageProgram.uniformSetters.u_image(image);
    this.imageProgram.uniformSetters.u_pos([-0.95, -0.95]);
    this.imageProgram.uniformSetters.u_size([0.6, 0.6]);
    //this.imageProgram.uniformSetters.u_pos([-1, -1]);
    //this.imageProgram.uniformSetters.u_size([2, 2]);
    pipeline.scene.drawScreenQuad();
    this.unbindTextures(1);
  }

  private updateMaterialParams(pipeline: RenderPipeline) {
    let materialIndex = 0;
    let index = 0;
    let changed = false;
    let params = this.materialParamsArray;
    let put = (value: number) => {
      let newVal = value * 255;
      if (changed) {
        params[index++] = newVal;
      } else {
        let old = params[index];
        params[index] = newVal;
        if (old !== params[index]) {
          changed = true;
        }
        ++index;
      }
    }
    for (let bundle in pipeline.scene.materials) {
      let mat = pipeline.scene.materials[bundle].renderMaterial;
      mat.index = materialIndex++;
      let params = mat.loaded ? mat.getMaterialParams() : pipeline.textures.releasedParams;
      put(params[0]);
      put(params[1]);
      put(params[2]);
      put(0);
      if (mat.index > 255) {
        console.error('Rem: too many materials in deferred render');
        break;
      }
    }
    if (changed) {
      let gl = pipeline.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.materialParamsTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, params);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }

  private beforeRender(pipeline: RenderPipeline, taa?: boolean) {
    if (!this.ssaoProgram) {
      this.createSsaoProgram();
    }
    this.lightsCount = pipeline.lights.length;
    if (pipeline.shadows) {
      this.shadowsCount = Math.min(pipeline.shadows.maxShadowLights, pipeline.shadowCount);
      pipeline.shadows.shadowMaxZ = pipeline.ds.root.box.diagonal;
    }
    this.updateMaterialParams(pipeline);
    if (taa) {
      if (this.taaStep >= this.taaSamples.length) {
        this.taaStep = 0;
      }
      let transform = pipeline.uniforms.u_transformMatrix;
      let offset = this.taaSamples[this.taaStep];
      let jitter = mat4.ffromTranslation((offset[0] / 16) * 2 / this.width, (offset[1] / 16) * 2 / this.height, 0);
      mat4.multiply(transform, jitter, transform);
      pipeline.uniforms.u_transformMatrix = mat4.toFloat32(transform);
    } else {
      this.taaStep = 0;
    }
  }

  private afterRender(pipeline: RenderPipeline) {
    for (let effect in this.environmentMaps) {
      let r = this.environmentMaps[effect];
      if (r && !r.used) {
        r.destroy();
        this.environmentMaps[effect] = undefined;
      }
    }
  }

  private fxaaPass(pipeline: RenderPipeline, source: WebGLTexture, destination: WebGLBuffer, factor = 1) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, destination);
    pipeline.setProgram(this.fxaaProgram);
    this.fxaaProgram.uniformSetters.textureSampler(source);
    this.fxaaProgram.uniformSetters.u_factor(factor);
    this.fxaaProgram.uniformSetters.u_texelSize([1 / this.width, 1 / this.height]);
    pipeline.scene.drawScreenQuad();
    this.unbindTextures(1);
  }

  private taaPass(
    pipeline: RenderPipeline,
    lastRender: WebGLTexture
  ) {
    let gl = this.gl;
    if (!this.taaProgram) {
      this.taaProgram = this.loadProgram(Shaders.taa);
    }

    gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.taaFBO);
    if (this.taaStep === 0) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.taaWeight = 0;
    }
    pipeline.setProgram(this.taaProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let offset = this.taaSamples[this.taaStep];
    let offsetx = offset[0] / 16;
    let offsety = offset[1] / 16;
    let sampleOffset = Math.sqrt(offsetx * offsetx + offsety * offsety);
    let sampleWeight = 1 - sampleOffset;
    this.taaWeight += sampleWeight;
    this.taaProgram.uniformSetters.u_factor(sampleWeight);
    this.taaProgram.uniformSetters.u_image(lastRender);
    pipeline.scene.drawScreenQuad();
    gl.disable(gl.BLEND);
    this.unbindTextures(1);

    if (this.taaStep > this.taaSamples.length / 4) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.taaProgram.uniformSetters.u_image(this.taaBuffer);
      this.taaProgram.uniformSetters.u_factor(1 / this.taaWeight);
      pipeline.scene.drawScreenQuad();
      this.unbindTextures(1);
    } else {
      this.fxaaPass(pipeline, this.taaBuffer, null, 1 / this.taaWeight);
    }
    this.taaStep++;
  }

  restartTaa() {
    this.taaStep = 0;
  }

  taaFinished() {
    return this.taaStep >= this.taaSamples.length;
  }

  draw(pipeline: RenderPipeline, wireProgram: twgl.IProgramInfo, taa: boolean) {
    this.beforeRender(pipeline, taa);
    // draw scene to color, normal and depth buffers
    this.geometryPass(pipeline);
    // generate ssao from color, normal and depth to blurBufer
    this.ssaoPass(pipeline);
    this.blurImage(pipeline, this.ssaoBuffer, this.blurAlpha5Program);
    this.blurImage(
      pipeline,
      this.lightBuffer,
      this.blurProgram9,
      this.effectWidth,
      this.effectHeight
    );

    this.combinePass(pipeline, this.combineFBO);
    if (taa) {
      this.taaPass(pipeline, this.combineBuffer);
      mat4.copy(pipeline.uniforms.u_transformMatrix, pipeline.transformMatrix);
    } else {
      this.fxaaPass(pipeline, this.combineBuffer, null);
    }
    let drawLines = pipeline.mode === RenderMode.ShadedWithEdges;
    if (pipeline.overDrawLights || drawLines) {
      this.fillZBuffer(pipeline);
      this.gl.enable(this.gl.DEPTH_TEST);
      if (drawLines) {
        this.wireframePass(pipeline, wireProgram);
      }
      if (pipeline.overDrawLights) {
        this.drawLigtsAbovePass(pipeline);
      }
      this.gl.disable(this.gl.DEPTH_TEST);
    }
    // debug output
    // this.drawImage(pipeline, this.lightBuffer);
    this.afterRender(pipeline);
  }
}
