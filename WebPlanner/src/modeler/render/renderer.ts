import { vec3, mat4, plane } from '../geometry';
import * as twgl from './twgl';
import { Entity, EntityRay, NavigationMode } from '../designer';
import {
  RenderScene,
  RenderMode,
  MeshBundle,
  TextureCache
} from './render-scene';
import { MatrixInterpolator } from '../interpolator';
import * as geom from '../geometry/geometry';
import { BMFont, parseBMFontAscii } from './sdf/parse-bmfont-ascii';
import { CatalogService, CatalogMaterial } from 'app/shared';
import { Observable } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { DeferredRender } from './deferred-render';
import { ForwardRender } from "./forward-render";
import { BehaviorSubject } from 'rxjs';
import { IWebGLVectorPipeline } from './vector-renderer';
import { finalize } from 'rxjs/operators';
import { WebDesigner } from 'modeler/webdesigner';
import { SceneShadowMaps } from './shadow-maps';
import { RenderPipeline } from './pipeline';
import { NavigatorCube } from './navigator';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DesignerErrorType } from 'modeler/builder-designer';
import { materialPointer } from 'modeler/material-utils';

export { RenderMode, materialPointer };

export interface RenderOptions {
  size?: number;
  width?: number;
  height?: number;
  mode?: RenderMode;
  camera?: Float64Array;
  perspective?: boolean | undefined;
  selection?: boolean;
  drawings?: boolean; // default = true
  invalidate?: boolean;
  taa?: boolean;
  fit?: boolean;
  background?: boolean;
  fontSize?: number;
  effects?: boolean;
}

export class Renderer {
  ds: WebDesigner;
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;

  forwardRender: ForwardRender;
  deferredRender: DeferredRender;
  textures: TextureCache;
  shadows: SceneShadowMaps;
  navigator: NavigatorCube;

  uniforms: any;
  materialChange = new EventEmitter<void>();
  texturesLoaded = new BehaviorSubject<boolean>(false);
  lightDisplayColor = [1.0, 1.0, 1.0];
  private _devicePixelRatio = 1;

  scene: RenderScene;
  vectorModel: geom.Contour;
  vectorModelMatrix;
  _background?: string; // color, two colors or skybox name
  private _mode: RenderMode = RenderMode.ShadedWithEdges;
  invalidating: boolean;
  private frameNumber = 0;
  private lockLevel = 0;
  private lightLockLevel = 0;
  private _cameraInterpolator = new MatrixInterpolator();
  private _cameraAnimStartTime;
  private _cameraOldScale = 0;
  private _cameraAnimUpdateDest = true;
  private _modelChanged = true;
  private _maxAnimationTime = 300;
  private _camAnimationTime = 0;
  private _requestAnimationFrameId?: number;
  private animationTimeoutId?: number;

  private _bmFont: BMFont;
  private _sdfFontTexture: WebGLTexture;
  private _skyboxTexture?: WebGLTexture;
  private _dynamicVisibility = true;
  private _xRayMode = false;
  private _effectsEnabled = false;
  private _taaEnabled = true;
  private _debugPrint = false;
  private shaderPrecision = 'mediump';


  private adaptiveEnabled = false;
  private dynamicRendering = false;
  private adaptiveTimerId: number;
  private lastStartRenderTime: number;
  private lastFinishRenderTime: number;
  private lastMesuredSceneRevision = 0;

  constructor(
    ds: WebDesigner,
    canvas: HTMLCanvasElement,
    private _catalogService: CatalogService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.ds = ds;
    this.canvas = canvas;
    canvas.addEventListener(
      "webglcontextlost", (event) => this.handleContextLost(event), false);
    this._devicePixelRatio = window.devicePixelRatio || 1;
    twgl.setAttributePrefix('a_');
    let gl = twgl.getWebGLContext(canvas, {
      alpha: true,
      depth: true,
      antialias: true
    });
    if (!gl) {
      throw new Error('WebGL initialization failed');
    }
    // gl = <WebGLRenderingContext>WebGLDebugUtils.makeDebugContext(gl, undefined, undefined, undefined);
    this.gl = gl;
    gl.enable(gl.CULL_FACE);
    let highp = this.gl.getShaderPrecisionFormat(
      gl.FRAGMENT_SHADER,
      gl.HIGH_FLOAT
    );
    if (highp.precision > 0) {
      this.shaderPrecision = 'highp';
    }
    this.scene = new RenderScene(gl, this.shaderPrecision);
    this.forwardRender = new ForwardRender(gl, this.shaderPrecision);
    let extensions = gl.getSupportedExtensions();
    if (extensions.find(e => e === "EXT_color_buffer_float")
        && extensions.find(e => e === "OES_texture_float_linear") && this.webgl2Enabled) {
      gl.getExtension("EXT_color_buffer_float");
      gl.getExtension("OES_texture_float_linear");
      this.shadows = new SceneShadowMaps(gl, this.shaderPrecision);
    }
    this.textures = new TextureCache(gl);
    this.textures.loading$.subscribe(loading => {
      this.ds.invalidate();
      this.ds.modelChanged();
      let loaded = !loading;
      if (loaded !== this.texturesLoaded.value) {
        this.texturesLoaded.next(loaded);
      }
    });

    this.uniforms = {};

    let options = new twgl.TextureOptions('./assets/sdf/cambria.png');
    options.min = gl.LINEAR_MIPMAP_LINEAR;
    this._sdfFontTexture = twgl.createTexture(gl, options, () =>
      ds.invalidate()
    );

    let xmlDoc = new XMLHttpRequest();
    xmlDoc.onload = (ev: Event) => {
      if (xmlDoc.responseText) {
        this._bmFont = parseBMFontAscii(xmlDoc.responseText);
        this.invalidate();
      }
    };
    xmlDoc.open('GET', './assets/sdf/cambria.fnt', true);
    xmlDoc.send();
    let debug = gl.getExtension('WEBGL_debug_renderer_info');
    let vendor = debug && debug.UNMASKED_RENDERER_WEBGL && gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
    if (typeof vendor !== 'string') {
      vendor = '';
    }
    let atiOrNvidia = vendor.match(/AMD|NVIDIA/);
    let topIntel = vendor.match(/Intel.* U?HD Graphics 630/);
    this.effectsEnabled = (atiOrNvidia || topIntel) && this.webgl2Enabled;
    this.background = '#sunsky';
  }

  destroy() {
    if (this._requestAnimationFrameId) {
      window.cancelAnimationFrame(this._requestAnimationFrameId);
    }
    if (this.animationTimeoutId) {
      window.clearTimeout(this.animationTimeoutId);
      this.animationTimeoutId = undefined;
    }
    if (this.adaptiveTimerId) {
      window.clearTimeout(this.adaptiveTimerId);
      this.adaptiveTimerId = undefined;
    }
    if (this.shadows) {
      this.shadows.destroy();
    }
    if (this.ds.root) {
      this.ds.root.removeFromRender();
    }
    if (this.forwardRender) {
      this.forwardRender.destroy();
      this.forwardRender = undefined;
    }
    if (this.deferredRender) {
      this.deferredRender.destroy();
      this.deferredRender = undefined;
    }
    if (this.navigator) {
      this.navigator.destroy();
    }
    this.scene.destroy();
    this.textures.destroy();
    this.gl.deleteTexture(this._sdfFontTexture);
    if (this._skyboxTexture) {
      this.gl.deleteTexture(this._skyboxTexture);
    }
    this.ds = undefined;
    this.gl = undefined;
    this.canvas = undefined;
  }

  handleContextLost(event: Event) {
    event.preventDefault();
    if (this.gl) {
      this.gl = undefined;
    }
    if (this.ds) {
      this.ds.serverError.next({ type: DesignerErrorType.WebGLLost, info: 'WebGL context lost' });
    }
  }

  invalidate() {
    if (!this.invalidating && this.lockLevel === 0) {
      this.invalidating = true;
      this._requestAnimationFrameId = requestAnimationFrame(() => {
        this._requestAnimationFrameId = undefined;
        this.render({});
      });
    }
  }

  lock() {
    this.lockLevel++;
  }

  unlock() {
    this.lockLevel--;
  }

  lockLights() {
    this.lightLockLevel++;
  }

  unlockLights() {
    this.lightLockLevel--;
  }

  debugPrint() {
    this._debugPrint = true;
    this.invalidate();
  }

  takePicture(options: RenderOptions) {
    return new Observable<string>(subscriber => {
      this.invalidating = true;
      this._requestAnimationFrameId = requestAnimationFrame(() => {
        this._requestAnimationFrameId = undefined;
        let oldCameraData = this.ds.camera.toJson();
        if (options.camera) {
          this.ds.camera.matrix = options.camera;
          if (options.perspective !== undefined) {
            this.ds.camera.mode = options.perspective
              ? NavigationMode.Orbit
              : NavigationMode.Ortho;
          }
        }
        if (!options.width) {
          options.width = options.size || this.gl.canvas.width;
        }
        if (!options.height) {
          options.height = options.size || options.width / this.ds.camera.computeAspect();
        }
        if (!options.background) {
          options.background = false;
        }
        if (options.fit) {
          this.ds.camera.zoomToFit(options.width / options.height, undefined, undefined, false);
        }
        this.render(options);
        this.gl.finish();
        subscriber.next(this.canvas.toDataURL());
        subscriber.complete();
        this.ds.camera.fromJson(oldCameraData);
        if (options.invalidate) {
          this.render({});
        }
      });
    });
  }

  public modelChanged() {
    if (!this._modelChanged) {
      this._modelChanged = true;
      this.invalidate();
    }
  }

  get pixelRatio() {
    return this._devicePixelRatio;
  }

  get mode() {
    return this._mode;
  }

  get isShadedMode() {
    return this.isModeShaded(this.mode);
  }

  isModeShaded(mode: RenderMode) {
    return (mode === RenderMode.Shaded
      || mode === RenderMode.ShadedWithEdges);
  }

  set mode(value: RenderMode) {
    this._mode = value;
    this.invalidate();
  }

  get webgl2Enabled() {
    return !!this.gl['drawBuffers'];
  }

  get effectsEnabled() {
    return this._effectsEnabled;
  }

  set effectsEnabled(value: boolean) {
    this._effectsEnabled = value && this.webgl2Enabled;
    this.ds.invalidate();
  }

  get xRayMode() {
    return this._xRayMode;
  }

  set xRayMode(value: boolean) {
    this._xRayMode = value;
    this.ds.invalidate();
  }

  overDrawLights = false;

  get dynamicVisibility() {
    return this._dynamicVisibility;
  }

  get background() {
    return this._background;
  }

  set background(value) {
    if (this._skyboxTexture) {
      this.gl.deleteTexture(this._skyboxTexture);
      this._skyboxTexture = undefined;
    }
    this._background = value;
    if (typeof value === 'string' && !value.startsWith('#')) {
      let skyBoxOptions = new twgl.TextureOptions([
        `textures/skyboxes/${value}/Left.jpg`,
        `textures/skyboxes/${value}/Right.jpg`,
        `textures/skyboxes/${value}/Up.jpg`,
        `textures/skyboxes/${value}/Down.jpg`,
        `textures/skyboxes/${value}/Front.jpg`,
        `textures/skyboxes/${value}/Back.jpg`
      ]);
      skyBoxOptions.target = this.gl.TEXTURE_CUBE_MAP;
      skyBoxOptions.min = this.gl.LINEAR_MIPMAP_LINEAR;
      this._skyboxTexture = twgl.createTexture(this.gl, skyBoxOptions, () =>
        this.ds.invalidate()
      );
    }
    this.ds.invalidate();
  }

  set dynamicVisibility(value: boolean) {
    this._dynamicVisibility = value;
    this.ds.invalidate();
  }

  animateCamera() {
    let curTime = Date.now();
    this._cameraInterpolator.setSource(this.actualCameraMatrix);
    let scale = this.ds.camera.scale;
    if (this._cameraAnimStartTime) {
      let t = this.cameraAnimationParam;
      scale = this._cameraOldScale + (scale - this._cameraOldScale) * t;
    }
    this._cameraOldScale = scale;

    this._cameraAnimStartTime = curTime;
    this._cameraAnimUpdateDest = true;
    this.invalidate();
  }

  animateEntity(e: Entity, newPos?: number) {
    this.scene.animateEntity(e, newPos);
    this.invalidate();
  }

  updateAnimation(e: Entity) {
    this.scene.updateAnimation(e);
  }

  get cameraAnimationParam() {
    if (this._cameraAnimStartTime) {
      let curTime = Date.now();
      if (this._cameraAnimUpdateDest) {
        let dest = mat4.normalizeOrthoMatrix(
          mat4.createIdentity(),
          this.ds.camera.matrix
        );
        this._cameraInterpolator.setDestination(dest);
        let duration = this._cameraInterpolator.estimateDuration(
          this.ds.box.diagonal
        );
        this._camAnimationTime = duration * this._maxAnimationTime;
        this._cameraAnimUpdateDest = false;
      }
      let t = (curTime - this._cameraAnimStartTime) / this._camAnimationTime;
      if (t > 1) {
        t = 1;
        this._cameraAnimStartTime = undefined;
      }
      if (t > 0) {
        // cubic easing out
        t--;
        t = t * t * t + 1;
      }
      return t;
    }
    return 1;
  }

  get actualCameraMatrix() {
    if (this._cameraAnimStartTime) {
      let t = this.cameraAnimationParam;
      let mt = mat4.createIdentity();
      this._cameraInterpolator.interpolate(mt, t);
      this.ds.camera.matrix = mt;
    }
    return this.ds.camera.matrix;
  }

  private actualProjectionMatrix(zLimits, cameraAnim: boolean) {
    let camera = this.ds.camera;
    let scale = camera.scale;
    if (this._cameraAnimStartTime && cameraAnim) {
      let t = this.cameraAnimationParam;
      scale = this._cameraOldScale + (scale - this._cameraOldScale) * t;
    }
    return this.ds.camera.projectionMatrix(zLimits, scale);
  }

  calcTransformMatrix() {
    let projection = this.ds.camera.projectionMatrix(this.calcZPlanes());
    let view = this.ds.camera.invMatrix;
    return mat4.mul(projection, projection, view);
  }

  private calcZPlanes() {
    let limits = { near: 0, far: 1000 };
    let camera = this.ds.camera;
    let planes = [];
    let modelBox = this.ds.root.box;
    let center = modelBox.center;
    let viewDir = camera.NtoGlobal(vec3.axis_z);
    planes.push(plane.createPN(center, viewDir));
    planes.push(plane.createPN(center, vec3.fnegate(viewDir)));
    plane.enlargeFrustum(planes, modelBox);
    plane.enlargeFrustum(planes, this.ds.temp.box);
    // include animated objects
    this.scene.enlargeFrustum(planes);
    plane.transformArray(planes, camera.invMatrix);
    limits.near = -planes[0][3];
    limits.far = planes[1][3];
    limits.near -= 0.01;
    limits.far += 0.01;
    return limits;
  }

  public intersectAnimatedObjects(ray: EntityRay) {
    ray.animated = true;
    return this.scene.intersectAnimatedObjects(ray);
  }

  private _materialsLoading = false;

  get materials() {
    let list: CatalogMaterial[] = [];
    for (let bundleId in this.scene.materials) {
      list.push(this.scene.materials[bundleId].renderMaterial);
    }
    return list;
  }

  loadMaterials() {
    if (!this._materialsLoading) {
      let requestList: string[] = [];
      let bundleList: MeshBundle[] = [];
      for (let bundleId in this.scene.materials) {
        let bundle = this.scene.materials[bundleId];
        if (!bundle.renderMaterial.loaded) {
          if (bundle.materialPointer.startsWith('-1\n')) {
            bundle.renderMaterial.loaded = true;
            bundle.renderMaterial.texture = bundle.materialPointer.substr(3);
          } else {
            bundleList.push(bundle);
            requestList.push(bundle.materialPointer);
          }
        }
      }
      if (requestList.length > 0) {
        this._materialsLoading = true;
        this._catalogService
          .findMaterials(requestList)
          .pipe(finalize(() =>  this._materialsLoading = false))
          .subscribe(data => this.updateMaterials(data, bundleList));
      }
    }
  }

  private updateMaterials(materials: CatalogMaterial[], bundles: MeshBundle[]) {
    for (let material of materials) {
      let pointer = materialPointer(material.catalogId, material.name);
      let bundle = this.scene.materials[pointer];
      if (bundle) {
        let dest = bundle.renderMaterial;
        dest.id = material.id;
        dest.type = material.type;
        dest.texture = material.texture;
        dest.bumpTexture = material.bumpTexture;
        dest.sizex = material.sizex;
        dest.sizey = material.sizey;
        dest.offsetx = material.offsetx;
        dest.offsety = material.offsety;
        dest.angle = material.angle;
        dest.transparency = material.transparency;
        dest.reflection = material.reflection;
        dest.ambient = material.ambient;
        dest.specular = material.specular;
        dest.shininess = material.shininess;
        dest.sku = material.sku;
        dest.price = material.price;
        dest.unit = material.unit;
      }
    }
    // mark all bundles we tried to find material for as loaded
    for (let bundle of bundles) {
      bundle.renderMaterial.loaded = true;
    }
    this._materialsLoading = false;
    this.materialChange.emit();
    this.invalidate();
  }

  private renderModel(pipeline: RenderPipeline, effects: boolean, taa: boolean) {
    let gl = pipeline.gl;
    let mode = pipeline.mode;
    if (pipeline.xray && mode === RenderMode.HiddenEdgesRemoved) {
      mode = RenderMode.HiddenEdgesVisible;
    }
    if (mode === RenderMode.HiddenEdgesVisible) {
      pipeline.xray = false;
    }

    pipeline.adaptive = this.adaptiveEnabled && this.dynamicRendering;
    if (effects && this.isModeShaded(mode) && pipeline.perspective) {
      if (!this.deferredRender) {
        this.deferredRender = new DeferredRender(
          this.gl as any,
          this.shaderPrecision
        );
      }
      this.deferredRender.resize(gl.canvas.width, gl.canvas.height);
      this.deferredRender.draw(pipeline, this.forwardRender.wireProgram, taa);
    } else {
      this.forwardRender.resize(gl.canvas.width, gl.canvas.height);
      this.forwardRender.draw(pipeline);
    }
  }

  printDebugInfo() {
    let gl = this.gl;
    let depthBufferBits: number = gl.getParameter(gl.DEPTH_BITS);
    console.log(`Depth bits: ${depthBufferBits}`);
  }

  private beforeRender(taa = false) {
    if (this.adaptiveTimerId) {
      window.clearTimeout(this.adaptiveTimerId);
      this.adaptiveTimerId = undefined;
    }
    if (!(this.dynamicRendering && this.adaptiveEnabled)) {
      if (this.lastFinishRenderTime && this.lastStartRenderTime) {
        let lastFrameTime = this.lastFinishRenderTime - this.lastStartRenderTime;
        this.adaptiveEnabled = !taa && lastFrameTime > 50;
      }
    }
    this.lastStartRenderTime = Date.now();
    this.dynamicRendering = this.lastFinishRenderTime &&
      this.lastStartRenderTime - this.lastFinishRenderTime < 100;
  }

  private afterRender(repeatRender: boolean, taa = false) {
    if (this.lastMesuredSceneRevision !== this.scene.revision && !this.adaptiveEnabled && this.dynamicRendering) {
      this.lastMesuredSceneRevision = this.scene.revision;
      this.gl.finish();
    }
    if (this.shadows) {
      this.shadows.cleanup();
    }
    this.lastFinishRenderTime = Date.now();
    if (!taa) {
      if (this._cameraAnimStartTime || repeatRender) {
        this.animationTimeoutId = window.setTimeout(() => {
          this.animationTimeoutId = undefined;
          this.invalidate();
        }, 0);
      } else if (this.adaptiveEnabled && this.dynamicRendering) {
        this.adaptiveTimerId = window.setTimeout(() => {
          this.invalidate();
        }, 250);
      } else if (this._taaEnabled) {
        if (this.effectsEnabled && this.isModeShaded(this.mode) && this.ds.camera.perspective) {
          this.taaStep(true);
        }
      }
    }
  }

  private taaStep(start = false) {
    if (this.deferredRender && this.deferredRender.taaSupported) {
      let frameTime = 50;
      if (!start) {
        this.render({ taa: true });
        frameTime = Math.min(this.lastFinishRenderTime - this.lastStartRenderTime + 25, 250);
      }
      if (!this.deferredRender.taaFinished()) {
        this.adaptiveTimerId = window.setTimeout(() => this.taaStep(), start ? 250 : frameTime);
      }
    }
  }

  render(options: RenderOptions) {
    this.invalidating = false;
    this.frameNumber++;
    let gl = this.gl;
    if (!gl) {
      return;
    }

    let width = options.width || options.size;
    let height = options.height || options.size;
    let customSize = width && height;
    if (customSize) {
      gl.canvas.width = width;
      gl.canvas.height = height;
    } else {
      twgl.resizeCanvasToDisplaySize(gl.canvas as any, this._devicePixelRatio);
      this.beforeRender(options.taa);
    }

    let pipeline = new RenderPipeline(gl, this.scene, this.ds, this.textures);
    pipeline.shadows = this.shadows;
    pipeline.mode = options.mode || this.mode || RenderMode.Shaded;
    pipeline.uniforms = this.uniforms;
    pipeline.font = this._bmFont;
    pipeline.xray = this.xRayMode;
    pipeline.overDrawLights = this.overDrawLights;
    pipeline.selection = !customSize;
    pipeline.dynamicVisibility = this._dynamicVisibility;
    pipeline.viewport.width = gl.canvas.width;
    pipeline.viewport.height = gl.canvas.height;

    gl.viewport(0, 0, pipeline.viewport.width, pipeline.viewport.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!pipeline.ds.root) {
      return;
    }

    let cameraAnim = !customSize;
    let cameraMatrix = cameraAnim ? this.actualCameraMatrix : this.ds.camera.matrix;
    let modelView = mat4.finvert(cameraMatrix);
    vec3.transformVectorMat4(pipeline.viewDir, vec3.axis_z, cameraMatrix);
    vec3.transformVectorMat4(pipeline.rightDir, vec3.axisx, cameraMatrix);
    vec3.transformVectorMat4(pipeline.upDir, vec3.axisy, cameraMatrix);
    vec3.transformMat4(
      pipeline.viewPos,
      vec3.fromValues(0.0, 0.0, 0.0),
      cameraMatrix
    );
    pipeline.perspective = this.ds.camera.perspective;
    pipeline.cameraMatrix = mat4.toFloat32(cameraMatrix);
    pipeline.modelViewMatrix = mat4.toFloat32(modelView);

    // z planes calculated based on existing entities
    this.scene.beforeRender(pipeline, this._modelChanged, this.lightLockLevel === 0);
    pipeline.beforeRender(this.lightLockLevel === 0);

    let zLimits = this.calcZPlanes();
    pipeline.zLimits = zLimits;
    let projection = this.actualProjectionMatrix(zLimits, cameraAnim);
    let transform = mat4.fmultiply(projection, modelView);
    pipeline.projectionMatrix = mat4.toFloat32(projection);
    pipeline.invProjectionMatrix = mat4.toFloat32(mat4.finvert(projection));
    pipeline.transformMatrix = mat4.toFloat32(transform);

    let uniforms = pipeline.uniforms;
    uniforms.u_transformMatrix = mat4.toFloat32(transform);
    uniforms.u_viewDir = new Float32Array(pipeline.viewDir);
    uniforms.u_modelViewMatrix = mat4.toFloat32(modelView);
    uniforms.u_meshMatrix = mat4.createIdentity32();
    pipeline.uniforms.u_projectionMatrix = mat4.toFloat32(
      pipeline.projectionMatrix
    );
    pipeline.uniforms.u_invProjectionMatrix = mat4.toFloat32(
      pipeline.invProjectionMatrix
    );
    pipeline.uniforms.u_cameraMatrix = mat4.toFloat32(pipeline.cameraMatrix);
    uniforms.u_viewport = [0, 0, gl.canvas.width, gl.canvas.height];
    pipeline.lightDisplayColor = this.lightDisplayColor;

    pipeline.calcPixelSize = pos => {
      let pos1 = vec3.transformMat4(vec3.create(), pos, modelView);
      let pos2 = [pos1[0] + 1, pos1[1], pos1[2]];
      vec3.transformMat4(pos1, pos1, projection);
      vec3.transformMat4(pos2, pos2, projection);
      vec3.sub(pos1, pos1, pos2);
      pos1[0] *= this.ds.canvas.width * 0.5;
      pos1[1] *= this.ds.canvas.height * 0.5;
      pos1[2] = 0;
      let pixelSize = 1.0 / vec3.len(pos1);
      return pixelSize;
    };
    pipeline.background = this.background;
    if (options.background === false) {
      pipeline.background = undefined;
    }
    pipeline.backgroundTexture = this._skyboxTexture;

    this.loadMaterials();
    let effects = this._effectsEnabled && options.effects !== false;
    this.renderModel(pipeline, effects, options.taa);
    if (options.taa && customSize && effects && this.isModeShaded(pipeline.mode) && pipeline.perspective) {
      if (this.deferredRender) {
        this.deferredRender.restartTaa();
        while (!this.deferredRender.taaFinished()) {
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          this.renderModel(pipeline, true, true);
        }
      }
    }

    if (this._sdfFontTexture && this._bmFont && options.drawings !== false) {
      let vPipeline = new IWebGLVectorPipeline();
      vPipeline.uniforms = uniforms;
      vPipeline.fillProgram = this.forwardRender.floodfill;
      vPipeline.wireProgram = this.forwardRender.lineProgram;
      vPipeline.textProgram = this.forwardRender.textProgram;
      vPipeline.fontTexture = this._sdfFontTexture;
      this.scene.renderDrawings(pipeline, vPipeline, options.fontSize);
    }

    if (this.ds.options.navigator && options.drawings !== false && !customSize) {
      if (!this.navigator) {
        this.navigator = new NavigatorCube(this.ds, this.gl, this.textures, this.shaderPrecision, this.breakpointObserver);
      }
      this.navigator.draw(pipeline);
    }

    let status = this.scene.afterRender(this.ds.root);
    if (status.bundleRemoved) {
      this.materialChange.emit();
    }
    this._modelChanged = false;

    if (!customSize) {
      if (this.frameNumber % 100 === 0) {
        this.textures.cleanup();
      }
      this.afterRender(status.repeatRender, options.taa);
    }
  }
}
