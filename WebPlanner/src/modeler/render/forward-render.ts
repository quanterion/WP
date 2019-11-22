import * as twgl from './twgl';
import * as Shaders from './shaders';
import { RenderMode, FillOptions } from './render-scene';
import { RenderPipeline } from './pipeline';

export class ForwardRender {
  colorFillProgram: twgl.IProgramInfo;
  wireProgram: twgl.IProgramInfo;
  floodfill: twgl.IProgramInfo;
  lineProgram: twgl.IProgramInfo;
  textProgram: twgl.IProgramInfo;
  skyboxProgram: twgl.IProgramInfo;
  sunskyProgram: twgl.IProgramInfo;
  combineProgram: twgl.IProgramInfo;
  //blur
  private blurBuffer: WebGLTexture;
  private blurFBO: WebGLFramebuffer;
  private blurProgram9: twgl.IProgramInfo;
  private width = 0;
  private height = 0;

  private lightAndSelectionBuffer: WebGLTexture;
  private depthBuffer: WebGLRenderbuffer;
  private lightAndSelectionFBO: WebGLFramebuffer;

  constructor(
    private gl: WebGLRenderingContext,
    private shaderPrecision: string
  ) {
    this.colorFillProgram = this.createProgramInfo(Shaders.colorFill);
    this.wireProgram = this.createProgramInfo(Shaders.wireframe);
    this.floodfill = this.createProgramInfo(Shaders.floodfill);
    this.lineProgram = this.createProgramInfo(Shaders.line);
    this.textProgram = this.createProgramInfo(Shaders.text);
    this.skyboxProgram = this.createProgramInfo(Shaders.skybox);
    this.sunskyProgram = this.createProgramInfo(Shaders.sunsky);
    this.combineProgram = this.createProgramInfo(Shaders.combine);

    this.lightAndSelectionBuffer = this.createRenderBuffer();
    this.depthBuffer = gl.createRenderbuffer();
    this.lightAndSelectionFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightAndSelectionFBO);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.lightAndSelectionBuffer,
        0);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);
    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        this.depthBuffer
      );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.blurBuffer = this.createRenderBuffer();
    this.blurProgram9 = this.createProgramInfo(Shaders.blur9);

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

    gl.bindTexture(gl.TEXTURE_2D, this.blurBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
  }

  resize(width: number, height: number) {
    if (this.width === width && this.height === height) return;
    let gl = this.gl;
    this.width = width;
    this.height = height;

    gl.bindTexture(gl.TEXTURE_2D, this.lightAndSelectionBuffer);
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
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindTexture(gl.TEXTURE_2D, this.blurBuffer);
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
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  destroy() {
    this.gl.deleteProgram(this.colorFillProgram.program);
    this.gl.deleteProgram(this.wireProgram.program);
    this.gl.deleteProgram(this.floodfill.program);
    this.gl.deleteProgram(this.lineProgram.program);
    this.gl.deleteProgram(this.textProgram.program);
    this.gl.deleteProgram(this.skyboxProgram.program);
    this.gl.deleteProgram(this.sunskyProgram.program);
    this.gl.deleteProgram(this.combineProgram.program);
    this.gl.deleteTexture(this.lightAndSelectionBuffer);
    this.gl.deleteRenderbuffer(this.depthBuffer);
    this.gl.deleteTexture(this.blurBuffer);
    this.gl.deleteFramebuffer(this.blurFBO);
    this.gl.deleteProgram(this.blurProgram9.program);
  }

  private createRenderBuffer(depth?: boolean): WebGLTexture {
    let gl = this.gl;
    let result = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, result);
    if (depth) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.DEPTH_COMPONENT16,
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

  private createProgramInfo(program: Shaders.ShaderProgram, variables?: any) {
    return twgl.createProgramInfoWithVariables(this.gl, program, this.shaderPrecision, variables, true);
  }

  private _fillProgram: twgl.IProgramInfo;
  private _lastLightCount = 0;

  private _fillShadowProgram: twgl.IProgramInfo;
  private _fsLightCount = 0;
  private _fsShadowCount = 0;

  private getfillProgram(pipeline: RenderPipeline) {
    let lightsCount = pipeline.lights.length;
    if (this._fillProgram && lightsCount !== this._lastLightCount) {
      this.gl.deleteProgram(this._fillProgram.program);
      this._fillProgram = undefined;
    }
    if (!this._fillProgram) {
      this._fillProgram = this.createProgramInfo(Shaders.fill, {
        LIGHT_COUNT: lightsCount > 0 ? lightsCount : undefined
      });
    }
    return this._fillProgram;
  }

  private getfillShadowProgram(pipeline: RenderPipeline, shadowCount: number) {
    let lightsCount = pipeline.lights.length;
    if (this._fillShadowProgram) {
      if (lightsCount !== this._fsLightCount || shadowCount !== this._fsShadowCount) {
        this.gl.deleteProgram(this._fillShadowProgram.program);
        this._fillShadowProgram = undefined;
      }
    }
    if (!this._fillShadowProgram) {
      this._fillShadowProgram = this.createProgramInfo(Shaders.fill, {
        LIGHT_COUNT: lightsCount > 0 ? lightsCount : undefined,
        SHADOW_COUNT: shadowCount || undefined
      });
      this._fsLightCount = lightsCount;
      this._fsShadowCount = shadowCount;
    }
    return this._fillShadowProgram;
  }

  private drawBackground(pipeline: RenderPipeline) {
    if (pipeline.background === '#sunsky') {
      if (this.sunskyProgram) {
        this.gl.depthMask(false);
        pipeline.setProgram(this.sunskyProgram);
        let sunPos = pipeline.scene.sunLight.computePosition();
        this.sunskyProgram.uniformSetters.u_sunPosition(sunPos);
        this.sunskyProgram.uniformSetters.u_luminance(pipeline.scene.sunLight.shaderLuminance());
        pipeline.scene.drawScreenQuad();
        this.gl.depthMask(true);
      }
    } else if (
      this.skyboxProgram &&
      pipeline.backgroundTexture &&
      pipeline.background
    ) {
      this.gl.depthMask(false);
      pipeline.setProgram(this.skyboxProgram);
      this.gl.bindTexture(
        pipeline.gl.TEXTURE_CUBE_MAP,
        pipeline.backgroundTexture
      );
      pipeline.scene.drawScreenQuad();
      this.gl.depthMask(true);
      this.gl.bindTexture(pipeline.gl.TEXTURE_CUBE_MAP, null);
    } else {
      this.gl.clearColor(1, 1, 1, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
  }

  private blurImage(
    pipeline: RenderPipeline,
    image: WebGLTexture,
    program: twgl.IProgramInfo
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
    // gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    // gl.viewport(0, 0, this.effectWidth, this.effectHeight);
    gl.disable(gl.DEPTH_TEST);

    pipeline.setProgram(program);
    // can blur from full resolution to half resolution
    program.uniformSetters.u_resolution([this.width, this.height]);
    program.uniformSetters.u_image(image);
    program.uniformSetters.u_direction([1, 0]);
    pipeline.scene.drawScreenQuad();
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      image,
      0
    );
    program.uniformSetters.u_image(this.blurBuffer);
    program.uniformSetters.u_resolution([this.width, this.height]);
    program.uniformSetters.u_direction([0, 1]);
    pipeline.scene.drawScreenQuad();
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private drawLightsAndSelection(pipeline: RenderPipeline) {
    let gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightAndSelectionFBO);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    pipeline.setProgram(this.colorFillProgram);
    this.colorFillProgram.uniformSetters.u_color([0, 0, 0, 0]);
    let fillOptions = new FillOptions();
    fillOptions.withMaterials = false;
    pipeline.scene.renderFill(pipeline, fillOptions);
    let lightColor = pipeline.lightDisplayColor.slice(0);
    lightColor[3] = 1.0;
    this.colorFillProgram.uniformSetters.u_color(lightColor);
    pipeline.scene.renderLights(pipeline);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.blurImage(pipeline, this.lightAndSelectionBuffer, this.blurProgram9);

    pipeline.setProgram(this.combineProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    this.combineProgram.uniformSetters.u_lightAndSelection(this.lightAndSelectionBuffer);
    this.combineProgram.uniformSetters.u_colorCompensation(1.0);
    this.combineProgram.uniformSetters.u_alphaCompensation(0.0);
    gl.disable(gl.DEPTH_TEST);
    pipeline.scene.drawScreenQuad();
    gl.disable(gl.BLEND);

    if (pipeline.selection) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightAndSelectionFBO);
      gl.disable(gl.DEPTH_TEST);
      gl.clearDepth(1.0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      pipeline.setProgram(this.colorFillProgram);
      this.colorFillProgram.uniformSetters.u_color(pipeline.selectionOutlineColor);
      fillOptions.withMaterials = false;
      fillOptions.selectionOnly = true;
      pipeline.scene.renderFill(pipeline, fillOptions);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.blurImage(pipeline, this.lightAndSelectionBuffer, this.blurProgram9);
    }

    pipeline.setProgram(this.combineProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.combineProgram.uniformSetters.u_lightAndSelection(this.lightAndSelectionBuffer);
    this.combineProgram.uniformSetters.u_colorCompensation(0.001);
    this.combineProgram.uniformSetters.u_alphaCompensation(1.0);
    gl.disable(gl.DEPTH_TEST);
    pipeline.scene.drawScreenQuad();
    gl.disable(gl.BLEND);
  }

  private drawFill(pipeline: RenderPipeline, options: FillOptions, shadowMaps?: WebGLTexture[]) {
    if (!pipeline.adaptive && pipeline.shadows) {
      let shadows = pipeline.shadows;
      let fillProgram = this.getfillShadowProgram(pipeline, shadowMaps.length);
      pipeline.setProgram(fillProgram);
      if (shadowMaps && fillProgram.uniformSetters.u_shadowMaps) {
        fillProgram.uniformSetters.u_shadowMaps(shadowMaps);
        fillProgram.uniformSetters.u_depthValues([-shadows.shadowMinZ, 1 / (shadows.shadowMaxZ - shadows.shadowMinZ)]);
      }
    } else {
      pipeline.setProgram(this.getfillProgram(pipeline));
    }
    pipeline.scene.renderFill(pipeline, options);
  }

  draw(pipeline: RenderPipeline) {
    let shadowMaps: WebGLTexture[];
    let shadows = pipeline.shadows;
    if (shadows && !pipeline.adaptive) {
      pipeline.shadows.shadowMaxZ = pipeline.ds.root.box.diagonal;
      shadowMaps = shadows.computeShadowMaps(pipeline);
    }
    let gl = pipeline.gl;
    gl.viewport(0, 0, this.width, this.height);
    let mode = pipeline.mode;
    if (pipeline.xray && mode === RenderMode.HiddenEdgesRemoved) {
      mode = RenderMode.HiddenEdgesVisible;
    }
    if (mode === RenderMode.HiddenEdgesVisible) {
      pipeline.xray = false;
    }
    let selectedColor = pipeline.selection ? [0, 0, 1] : [0, 0, 0];
    let fillOptions = new FillOptions();

    switch (mode) {
      case RenderMode.ShadedWithEdges:
        this.drawBackground(pipeline);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);
        this.drawFill(pipeline, fillOptions, shadowMaps);
        pipeline.setProgram(this.colorFillProgram);
        pipeline.scene.renderLights(pipeline);
        gl.disable(gl.POLYGON_OFFSET_FILL);
        pipeline.setProgram(this.wireProgram);
        pipeline.scene.renderWireframe(pipeline, [0, 0, 0]);
        this.drawLightsAndSelection(pipeline);
        gl.disable(gl.DEPTH_TEST);
        break;

      case RenderMode.Shaded:
        this.drawBackground(pipeline);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        this.drawFill(pipeline, fillOptions, shadowMaps);
        pipeline.setProgram(this.colorFillProgram);
        this.drawLightsAndSelection(pipeline);
        break;

      case RenderMode.HiddenEdgesRemoved:
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);
        gl.colorMask(false, false, false, false);
        pipeline.setProgram(this.getfillProgram(pipeline));
        pipeline.scene.renderFill(pipeline, fillOptions);

        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.colorMask(true, true, true, true);
        pipeline.setProgram(this.wireProgram);
        pipeline.scene.renderWireframe(pipeline, [0, 0, 0], false);
        if (pipeline.selection) {
          gl.disable(gl.DEPTH_TEST);
        }
        pipeline.scene.renderWireframe(pipeline, selectedColor, true);
        break;

      case RenderMode.HiddenEdgesVisible:
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.DEPTH_TEST);
        pipeline.setProgram(this.wireProgram);
        pipeline.scene.renderWireframe(pipeline, [0.6, 0.6, 0.6], false);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);
        gl.colorMask(false, false, false, false);
        pipeline.setProgram(this.getfillProgram(pipeline));
        pipeline.scene.renderFill(pipeline, fillOptions);

        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.colorMask(true, true, true, true);
        pipeline.setProgram(this.wireProgram);
        pipeline.scene.renderWireframe(pipeline, [0, 0, 0], false);
        if (pipeline.selection) {
          gl.disable(gl.DEPTH_TEST);
        }
        pipeline.scene.renderWireframe(pipeline, selectedColor, true);
        break;
    }
  }
}
