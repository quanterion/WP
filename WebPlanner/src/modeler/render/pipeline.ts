import { MeshBatch, RenderScene, TextureCache, RenderMode, RenderLight, LightType } from "./render-scene";
import { Designer } from "modeler/designer";
import { IProgramInfo, setUniforms } from "./twgl";
import { BMFont } from "./sdf/parse-bmfont-ascii";
import { vec3 } from "modeler/geometry";
import { SceneShadowMaps } from "./shadow-maps";

export type RenderFunction = (
    projectionMatrix: Float32Array,
    cameraMatrix: Float32Array,
    modelViewMatrix: Float32Array,
    exclude?: MeshBatch) => void;

  export class RenderPipeline {
    constructor (
      public gl: WebGLRenderingContext,
      public scene: RenderScene,
      public ds: Designer,
      public textures: TextureCache) {
    }

    uniforms: any;
    viewport = { width: 1, height: 1 };
    selectionOutlineColor = [1.0, 0.6, 0.0, 1];
    lightDisplayColor: number[] = [1.0, 1.0, 1.0, 0.0];
    zLimits: { near: number; far: number };
    program: IProgramInfo;

    font: BMFont;
    calcPixelSize: (pos) => number;

    // camera transforms
    viewPos = vec3.create();
    viewDir = vec3.create();
    rightDir = vec3.create();
    cameraMatrix: Float32Array;
    modelViewMatrix: Float32Array;
    projectionMatrix: Float32Array;
    invProjectionMatrix: Float32Array;
    transformMatrix: Float32Array;
    upDir = vec3.create();
    perspective = false;
    selection = true; // draw selected entities with special effect
    mode: RenderMode;
    xray = true;
    overDrawLights = false;
    background?: string; // fill background
    backgroundTexture?: WebGLTexture;
    // auto hide walls
    dynamicVisibility = true;
    // adaptive frame to improve perfomance of dynamically changing scene
    adaptive = false;
    lights: RenderLight[];
    shadows: SceneShadowMaps;
    shadowCount = 0;

    beforeRender(updateLights: boolean) {
      this.lights = [];
      this.shadowCount = 0;
      for (let light of this.scene.lights) {
        if (updateLights) {
          light.update();
        }
        if (light.shadows) {
          this.lights.unshift(light);
          this.shadowCount++;
        } else {
          this.lights.push(light);
        }
      }
      let rootData = this.ds.root.data;
      if (rootData) {
        if (rootData.headLight) {
          this.scene.headLight.enabled = rootData.headLight.enabled;
          this.scene.headLight.power = rootData.headLight.power;
        }
        if (rootData.sunLight) {
          this.scene.sunLight.luminance = rootData.sunLight.luminance || 40;
          this.scene.sunLight.azimuth = rootData.sunLight.azimuth || 140;
          this.scene.sunLight.elevation = rootData.sunLight.elevation || 90;
        }
      }
      if (this.scene.headLight.enabled) {
        this.lights.push(this.scene.headLight);
      }
    }

    setProgram(program: IProgramInfo) {
      this.program = program;
      this.gl.useProgram(program.program);
      setUniforms(this.program, this.uniforms);
      if (this.program.uniformSetters.u_lightParams) {
        this.setLightingParams(program);
      }
    }

    setLightingParams(program: IProgramInfo, modelViewMatrix?: Float32Array) {
      if (this.lights.length <= 0) return;
      let coords = new Float32Array(this.lights.length * 3);
      let params = new Float32Array(this.lights.length * 4);

      let index = 0;
      let pindex = 0;

      for (let light of this.lights) {
        let pos: Float64Array;
        if (light.type === LightType.Head) {
          pos = vec3.fromValues(1e8, 1e8, 1e8);
          if (modelViewMatrix) {
            vec3.transformMat4(pos, pos, this.cameraMatrix);
            vec3.transformMat4(pos, pos, modelViewMatrix);
          }
        } else {
          pos = vec3.fcopy(light.position);
          vec3.transformMat4(pos, pos, modelViewMatrix || this.modelViewMatrix);
        }

        coords[index++] = pos[0];
        coords[index++] = pos[1];
        coords[index++] = pos[2];

        params[pindex++] = light.power * 0.01; // power
        if (light.type === LightType.Head) {
          params[pindex - 1] -= 0.1 * this.scene.lights.length;
        }
        if (light.distance > 0.1) {
          params[pindex++] = 1 / Math.pow(light.distance, 2); // attenuation
        } else {
          params[pindex++] = 0;
        }
        params[pindex++] = light.specular; // specular
        params[pindex++] = light.shininess; // shininess
      }
      program.uniformSetters.u_lightPos(coords);
      program.uniformSetters.u_lightParams(params);
    }
  }
