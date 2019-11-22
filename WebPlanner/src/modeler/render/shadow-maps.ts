import { IProgramInfo, createProgramInfoWithVariables } from "./twgl";
import { mat4, vec3 } from "modeler/geometry";
import { MeshBatch, FillOptions } from "./render-scene";
import * as Shaders from './deferred-shaders';
import { RenderFunction, RenderPipeline } from "./pipeline";

export class ShadowMap {
  public SIZE = 512;
  public map: WebGLTexture;
  private frameBuffer: WebGLFramebuffer;
  private depthBuffer: WebGLRenderbuffer;
  revision = -1;
  used = true;

  constructor(private gl: WebGLRenderingContext) {
    this.depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl['DEPTH_COMPONENT32F'] || gl.DEPTH_COMPONENT16, this.SIZE, this.SIZE);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    this.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.map = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.map);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    let format = gl['R32F'] || gl.RGBA;
    for (let i = 0; i < 6; i++) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, format,
        this.SIZE, this.SIZE, 0, gl['RED'], gl.FLOAT, null);
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }

  destroy() {
    this.gl.deleteFramebuffer(this.frameBuffer);
    this.gl.deleteRenderbuffer(this.depthBuffer);
    this.gl.deleteTexture(this.map);
  }

  renderMap(render: RenderFunction, pos: Float32Array, nearz: number, farz: number) {
    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.viewport(0, 0, this.SIZE, this.SIZE);
    let projectionMatrix = mat4.perspective(mat4.createIdentity32(), Math.PI / 2, 1.0, nearz, farz) as Float32Array;

    let cameraMatrix = mat4.createIdentity32();
    let modelViewMatrix = mat4.createIdentity32();

    let renderSide = (side) => {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, side, this.map, 0);
      render(projectionMatrix, cameraMatrix, modelViewMatrix);
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

    // cubemap sides
    orient([0, 0, -1], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
    orient([0, 0, 1], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);
    orient([-1, 0, 0], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_POSITIVE_X);
    orient([1, 0, 0], [0, -1, 0]);
    renderSide(gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
    // front & back
    orient([0, -1, 0], [0, 0, 1]);
    renderSide(gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
    orient([0, 1, 0], [0, 0, -1]);
    renderSide(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

export class SceneShadowMaps {
  constructor(private gl: WebGLRenderingContext, private shaderPrecision: string) {}

  private maps: { [index: string]: ShadowMap } = {};
  public maxShadowLights = 10;
  public shadowMinZ = 10;
  public shadowMaxZ = 10000;

  private shadowMapProgram: IProgramInfo;
  private blurShadowCube1: IProgramInfo;
  private blurShadowCube2: IProgramInfo;
  private shadowBlurBuffer: WebGLTexture;
  private shadowBlurFBO: WebGLFramebuffer;

  destroy() {
    for (let itemName in this.maps) {
      let item = this.maps[itemName];
      if (item) {
        item.destroy();
      }
    }
    if (this.shadowBlurBuffer) {
      this.gl.deleteTexture(this.shadowBlurBuffer);
    }
    if (this.shadowBlurFBO) {
      this.gl.deleteFramebuffer(this.shadowBlurFBO);
    }
    if (this.shadowMapProgram) {
      this.gl.deleteProgram(this.shadowMapProgram.program);
    }
    if (this.blurShadowCube1) {
      this.gl.deleteProgram(this.blurShadowCube1.program);
    }
    if (this.blurShadowCube2) {
      this.gl.deleteProgram(this.blurShadowCube2.program);
    }
  }

  computeShadowMaps(pipeline: RenderPipeline): WebGLTexture[] {
    let maps = [];
    for (let light of pipeline.lights) {
      if (light.shadows) {
        let shadowMap = this.maps[light.uid];
        if (!shadowMap) {
          shadowMap = new ShadowMap(this.gl);
          this.maps[light.uid] = shadowMap;
        }
        shadowMap.used = true;
        let canUpdate = !pipeline.adaptive || shadowMap.revision === -1;
        if (canUpdate && shadowMap.revision !== pipeline.scene.revision) {
          shadowMap.renderMap(
            (p, _, m, e) => this.drawShadowMap(pipeline, p, m, e),
            light.position, this.shadowMinZ, this.shadowMaxZ);
          this.blurShadowMap(pipeline, shadowMap.map, shadowMap.SIZE);
          shadowMap.revision = pipeline.scene.revision;
        }
        maps.push(shadowMap.map);
        if (maps.length >= this.maxShadowLights) {
          break;
        }
      }
    }
    return maps;
  }

  cleanup() {
    for (let name in this.maps) {
      let sm = this.maps[name];
      if (sm && !sm.used) {
        sm.destroy();
        this.maps[name] = undefined;
      }
    }
  }

  private getShadowMapProgram() {
    if (!this.shadowMapProgram) {
      this.shadowMapProgram = createProgramInfoWithVariables(this.gl, Shaders.shadowMap, this.shaderPrecision);
    }
    return this.shadowMapProgram;
  }

  private drawShadowMap(pipeline: RenderPipeline,
    projectionMatrix: Float32Array,
    modelViewMatrix: Float32Array,
    exclude?: MeshBatch
    ) {
    let gl = this.gl;
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    let program = this.getShadowMapProgram();
    gl.useProgram(program.program);
    pipeline.program = program;
    program.uniformSetters.u_depthValues([-this.shadowMinZ, 1 / (this.shadowMaxZ - this.shadowMinZ)]);
    program.uniformSetters.u_projectionMatrix(projectionMatrix);
    program.uniformSetters.u_modelViewMatrix(modelViewMatrix);
    let fillOptions = new FillOptions();
    fillOptions.withMaterials = false;
    fillOptions.drawTransparent = false;
    fillOptions.drawReflected = true;
    fillOptions.drawHidden = true;
    fillOptions.exclude = exclude;
    pipeline.scene.renderFill(pipeline, fillOptions);
    gl.disable(gl.DEPTH_TEST);
  }

  private blurShadowMap(
    pipeline: RenderPipeline,
    cubemap: WebGLTexture,
    size: number,
  ) {
    let gl = this.gl;
    if (!this.blurShadowCube1 || !this.blurShadowCube2) {
      this.blurShadowCube1 = createProgramInfoWithVariables(this.gl, Shaders.blurShadowCube1, this.shaderPrecision);
      this.blurShadowCube2 = createProgramInfoWithVariables(this.gl, Shaders.blurShadowCube2, this.shaderPrecision);
      this.shadowBlurBuffer = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.shadowBlurBuffer);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl['R32F'], size, size, 0, gl['RED'], gl.FLOAT, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
      this.shadowBlurFBO = gl.createFramebuffer();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowBlurFBO);
    let drawBuffers = gl['drawBuffers'];
    if (drawBuffers) {
      drawBuffers.call(gl, [gl.COLOR_ATTACHMENT0]);
    }
    gl.viewport(0, 0, size, size);
    gl.disable(gl.DEPTH_TEST);

    let cameraMatrix = mat4.createIdentity32();
    let axisx = vec3.create();
    let orient = (axisz, axisy) => {
      let m = cameraMatrix;
      vec3.cross(axisx, axisz, axisy);
      // x
      m[0] = axisx[0];
      m[1] = axisx[1];
      m[2] = axisx[2];
      // y
      m[4] = axisy[0];
      m[5] = axisy[1];
      m[6] = axisy[2];
      // z
      m[8] = axisz[0];
      m[9] = axisz[1];
      m[10] = axisz[2];
    }

    for (let i = 0; i < 6; i++) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.shadowBlurBuffer,
        0
      );

      pipeline.setProgram(this.blurShadowCube1);
      this.blurShadowCube1.uniformSetters.u_size(size);
      this.blurShadowCube1.uniformSetters.u_image(cubemap);
      switch (i) {
        case 0: orient([1, 0, 0], [0, -1, 0]); break;
        case 1: orient([-1, 0, 0], [0, -1, 0]); break;
        case 2: orient([0, 1, 0], [0, 0, 1]); break;
        case 3: orient([0, -1, 0], [0, 0, -1]); break;
        case 4: orient([0, 0, 1], [0, -1, 0]); break;
        case 5: orient([0, 0, -1], [0, -1, 0]); break;
      }
      this.blurShadowCube1.uniformSetters.u_rotation(cameraMatrix);
      pipeline.scene.drawScreenQuad();
      this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);

      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        cubemap,
        0
      );
      pipeline.setProgram(this.blurShadowCube2);
      this.blurShadowCube2.uniformSetters.u_image(this.shadowBlurBuffer);
      this.blurShadowCube2.uniformSetters.u_size(size);
      pipeline.scene.drawScreenQuad();
      this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
