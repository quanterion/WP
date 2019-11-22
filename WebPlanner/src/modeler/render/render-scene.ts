import { vec3, mat4, plane, glMatrix } from '../geometry';
import * as twgl from './twgl';
import { Mesh, Entity, EntityRay } from '../designer';
import { VectorRenderer, IWebGLVectorPipeline } from './vector-renderer';
import * as geom from '../geometry/geometry';
import { Animation } from '../interpolator';
import { MaterialUnit, MaterialType } from 'app/shared';
import { EventEmitter } from '@angular/core';
import { RenderPipeline } from './pipeline';
import { MaterialMapper, materialPointer } from 'modeler/material-utils';

export enum RenderMode {
  Shaded = 1, // start from 1 to disable undefined shaded mode
  ShadedWithEdges,
  HiddenEdgesRemoved,
  HiddenEdgesVisible
}

class RenderLink {
  matrix = mat4.createIdentity32();
  entity: Entity;
  ranges: Array<any>; // array of ElementRange for drawings selection
  selected: boolean;
  removed: boolean;
  transformed: boolean;
  hidden: boolean;
  animation: RenderAnimation;

  constructor(entity?: Entity) {
    this.entity = entity;
  }

  remove() {
    if (this.entity && this.transformed) {
      if (this.entity.children) {
        for (let child of this.entity.children) {
          if (child.renderLink) {
            child.renderLink.transform();
          }
        }
      }
    }
    this.entity = undefined;
    this.removed = true;
  }

  transform() {
    this.transformed = true;
  }
}

class LineMesh {
  // number of values in vertex buffers
  private _coordsCount = 0;

  constructor(public lines: number[][], public link: RenderLink) {
    for (let polygon of lines) {
      this._coordsCount += (polygon.length - 3) * 2;
    }
  }

  get coordsCount() {
    return this._coordsCount;
  }
}

class LineBatch {
  private _items: Array<LineMesh> = [];
  private _buffer: WebGLBuffer;
  private _updateBuffers = true;
  private _coordsCount = -1;

  get coordsCount() {
    let size = this._coordsCount;
    if (size < 0) {
      size = 0;
      for (let item of this._items) {
        size += item.coordsCount;
      }
    }
    return size;
  }

  cleanup() {
    let items = this._items;
    for (let k = items.length - 1; k >= 0; k--) {
      let link = items[k].link;
      if (link.removed) {
        items.splice(k, 1);
        this._updateBuffers = true;
        this._coordsCount = -1;
      } else if (link.transformed) {
        this._updateBuffers = true;
      }
    }
  }

  add(item: LineMesh) {
    this._items.push(item);
    this._updateBuffers = true;
  }

  canAdd(item: LineMesh): boolean {
    return this.coordsCount + item.coordsCount < 32768;
  }

  updateBuffers(gl: WebGLRenderingContext) {
    if (!this._updateBuffers && this._buffer) {
      return;
    }

    this.remove(gl);
    this._updateBuffers = false;
    let wireBuffer = new Float32Array(this.coordsCount);
    let offset = 0;
    for (let geometry of this._items) {
      if (geometry.link.hidden) continue;
      let m = geometry.link.matrix;
      let px = 0,
        py = 0,
        pz = 0;
      let setPos = (x, y, z) => {
        px = m[0] * x + m[4] * y + m[8] * z + m[12];
        py = m[1] * x + m[5] * y + m[9] * z + m[13];
        pz = m[2] * x + m[6] * y + m[10] * z + m[14];
      };
      let addPos = () => {
        wireBuffer[offset++] = px;
        wireBuffer[offset++] = py;
        wireBuffer[offset++] = pz;
      };

      for (let k = 0; k < geometry.lines.length; k++) {
        let edge = geometry.lines[k];
        if (edge.length >= 6) {
          // first point
          setPos(edge[0], edge[1], edge[2]);
          addPos();

          let lastIndex = edge.length - 3;
          for (let index = 3; index < lastIndex; index += 3) {
            setPos(edge[index + 0], edge[index + 1], edge[index + 2]);
            addPos();
            addPos();
          }
          // last point
          setPos(edge[lastIndex + 0], edge[lastIndex + 1], edge[lastIndex + 2]);
          addPos();
        }
      }
    }
    this._buffer = twgl.createBufferFromTypedArray(gl, wireBuffer);
  }

  draw(pipeline: RenderPipeline) {
    let gl = pipeline.gl;
    this.updateBuffers(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, this.coordsCount / 3);
  }

  remove(gl: WebGLRenderingContext) {
    if (this._buffer) {
      gl.deleteBuffer(this._buffer);
      this._buffer = undefined;
    }
  }
}

class TriMesh {
  constructor(public mesh: Mesh, public link: RenderLink) {}
}

/** List of meshes merged into single buffer */
export class MeshBatch {

  constructor(public selected: boolean) {}

  meshes: Array<TriMesh> = [];
  private _buffersInfo: twgl.BufferInfo;
  private _hiddenBuffersInfo: twgl.BufferInfo;
  private _hasHidden = false;
  private _updateBuffers = true;
  private _attribSize = 0;

  get attribSize() {
    let size = this._attribSize;
    if (size < 0) {
      size = 0;
      for (let item of this.meshes) {
        size += item.mesh.position.length;
      }
    }
    return size;
  }

  clear() {
    this.meshes = [];
    this._updateBuffers = true;
  }

  cleanup() {
    let items = this.meshes;
    for (let k = items.length - 1; k >= 0; k--) {
      let link = items[k].link;
      if (link.removed) {
        items.splice(k, 1);
        this._updateBuffers = true;
        this._attribSize = -1;
      } else if (link.transformed) {
        this._updateBuffers = true;
      }
    }
  }

  add(item: TriMesh) {
    this.meshes.push(item);
    this._attribSize += item.mesh.position.length;
    this._updateBuffers = true;
  }

  addMesh(mesh: Mesh, matrix?: Float64Array) {
    let link = new RenderLink();
    if (matrix) {
      mat4.copy(link.matrix, matrix);
    }
    this.add(new TriMesh(mesh, link));
  }

  canAdd(item: TriMesh): boolean {
    let selectionPass = item.link.selected === this.selected;
    let sizePass = this.attribSize + item.mesh.position.length < 32768;
    return selectionPass && sizePass;
  }

  updateBuffers(gl: WebGLRenderingContext, hidden = false) {
    let curBuffer = hidden ? this._hiddenBuffersInfo : this._buffersInfo;
    if (!this._updateBuffers && curBuffer) {
      return;
    }

    if (!hidden) {
      this._hasHidden = false;
      if (this._buffersInfo) {
        this._buffersInfo.remove(gl);
        this._buffersInfo = undefined;
      }
      this._updateBuffers = false;
    }
    if (this._hiddenBuffersInfo) {
      this._hiddenBuffersInfo.remove(gl);
      this._hiddenBuffersInfo = undefined;
    }

    let attribCount = 0;
    let indexCount = 0;

    for (let geometry of this.meshes) {
      if (!hidden && geometry.link.hidden) {
        this._hasHidden = true;
      }
      if (!!geometry.link.hidden !== hidden) continue;
      let mesh = geometry.mesh;
      attribCount += mesh.position.length;
      indexCount += mesh.indices.length;
    }
    attribCount /= 3;

    let position = new Float32Array(attribCount * 3);
    let normal = new Float32Array(attribCount * 3);
    let texcoord = new Float32Array(attribCount * 2);
    let indices = new Uint16Array(indexCount);

    let positionIndex = 0;
    let normalIndex = 0;
    let texcoordIndex = 0;
    let indicesIndex = 0;

    for (let geometry of this.meshes) {
      if (!!geometry.link.hidden !== hidden) continue;
      let mesh = geometry.mesh;
      let m = geometry.link.matrix;
      let attribIndex = positionIndex / 3;

      position.set(mesh.position, positionIndex);
      let newPositionIndex = positionIndex + mesh.position.length;
      for (let k = positionIndex; k < newPositionIndex; k += 3) {
        let x = position[k];
        let y = position[k + 1];
        let z = position[k + 2];
        position[k + 0] = m[0] * x + m[4] * y + m[8] * z + m[12];
        position[k + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
        position[k + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      }
      positionIndex = newPositionIndex;

      normal.set(mesh.normal, normalIndex);
      let newNormalIndex = normalIndex + mesh.normal.length;
      for (let k = normalIndex; k < newNormalIndex; k += 3) {
        let x = normal[k];
        let y = normal[k + 1];
        let z = normal[k + 2];
        normal[k + 0] = m[0] * x + m[4] * y + m[8] * z;
        normal[k + 1] = m[1] * x + m[5] * y + m[9] * z;
        normal[k + 2] = m[2] * x + m[6] * y + m[10] * z;
      }
      normalIndex = newNormalIndex;

      texcoord.set(mesh.texcoord, texcoordIndex);
      texcoordIndex += mesh.texcoord.length;

      indices.set(mesh.indices, indicesIndex);
      for (
        let k = indicesIndex, lastIndex = indicesIndex + mesh.indices.length;
        k < lastIndex;
        k++
      ) {
        indices[k] += attribIndex;
      }
      indicesIndex += mesh.indices.length;
    }

    let batchMesh = { position, normal, texcoord, indices };
    let result = twgl.createBufferInfoFromArrays(gl, batchMesh);
    if (hidden) {
      this._hiddenBuffersInfo = result;
    } else {
      this._buffersInfo = result;
    }
  }

  draw(pipeline: RenderPipeline, hidden = false) {
    let gl = pipeline.gl;
    this.updateBuffers(gl);
    if (this._buffersInfo.numElements > 0) {
      twgl.setBuffersAndAttributes(gl, pipeline.program, this._buffersInfo);
      gl.drawElements(
        gl.TRIANGLES,
        this._buffersInfo.numElements,
        gl.UNSIGNED_SHORT,
        0
      );
    }
    if (hidden && this._hasHidden) {
      this.updateBuffers(gl, hidden);
      if (this._hiddenBuffersInfo.numElements > 0) {
        twgl.setBuffersAndAttributes(gl, pipeline.program, this._hiddenBuffersInfo);
        gl.drawElements(
          gl.TRIANGLES,
          this._hiddenBuffersInfo.numElements,
          gl.UNSIGNED_SHORT,
          0
        );
      }
    }
  }

  remove(gl: WebGLRenderingContext) {
    if (this._buffersInfo) {
      this._buffersInfo.remove(gl);
      this._buffersInfo = undefined;
    }
    if (this._hiddenBuffersInfo) {
      this._hiddenBuffersInfo.remove(gl);
      this._hiddenBuffersInfo = undefined;
    }
  }

  get anyEntity() {
    return this.meshes.length ? this.meshes[0].link.entity : undefined;
  }

  get envMapPos() {
    if (this.meshes.length) {
       let pos = this.meshes[0].link.entity.box.center;
       let m = this.meshes[0].link.matrix;
       vec3.transformMat4(pos, pos, m);
       return pos;
    }
  }
}

class RenderMaterial {
  id: number;
  type: MaterialType;
  name: string;
  catalogId: number;
  private diffuseTextureUrl = '';
  private bumpTextureUrl = '';
  sizex = 100;
  sizey = 100;
  offsetx = 0;
  offsety = 0;
  angle = 0;
  transparency = 0;
  reflection = 0;

  ambient = 0;
  specular = 0.1;
  shininess = 0.1;

  sku: string;
  price = 0;
  unit = MaterialUnit.None;
  index = 0;
  // all fields info loaded from server
  loaded = false;

  private textureInfo: TextureInfo;
  private bumpTextureInfo: TextureInfo;

  private removeDiffuseTexture() {
    if (this.textureInfo) {
      this.textureInfo.releaseRef(this.getMaterialParams(), this.getTextureMatrix());
      this.textureInfo = undefined;
    }
  }

  private removeBumpTexture() {
    if (this.bumpTextureInfo) {
      this.bumpTextureInfo.releaseRef();
      this.bumpTextureInfo = undefined;
    }
  }

  destroy() {
    this.removeBumpTexture();
    this.removeDiffuseTexture();
  }

  get texture() {
    return this.diffuseTextureUrl;
  }

  set texture(value: string) {
    if (this.diffuseTextureUrl !== value) {
      this.diffuseTextureUrl = value;
      this.removeDiffuseTexture();
    }
  }

  get bumpTexture() {
    return this.bumpTextureUrl;
  }

  set bumpTexture(value: string) {
    if (value !== this.bumpTextureUrl) {
      this.bumpTextureUrl = value;
      this.removeBumpTexture();
    }
  }

  getMaterialParams() {
    return [this.ambient, this.specular, this.shininess, 0.0];
  }

  getTextureMatrix() {
    let result =  mat4.fromZRotation(mat4.createIdentity32(), -this.angle * Math.PI / 180.0);
    mat4.scale(result, result, [1.0 / this.sizex, -1.0 / this.sizey, 1.0]);
    mat4.translate(result, result, [this.offsetx, this.offsety, 0.0]);
    return result;
  }

  apply(pipeline: RenderPipeline) {
    let uniforms = pipeline.program.uniformSetters;

    let paramUniform = uniforms['u_materialParams'];
    let params: number[];
    let textureMatrix = this.getTextureMatrix();
    if (uniforms['u_materialIndex']) {
      uniforms['u_materialIndex'](this.index);
    } else if (paramUniform) {
      params = this.getMaterialParams();
    }

    let textureInfo = this.textureInfo;
    let textures = pipeline.textures;
    if (!textureInfo) {
      if (this.texture || this.loaded) {
        textureInfo = textures.load(this.texture);
        this.textureInfo = textureInfo;
      } else {
        textureInfo = textures.releasedTexture;
        params = textures.releasedParams;
        textureMatrix = textures.releasedMatrix;
      }
    }
    if (textureInfo.loading) {
      textureInfo = textures.releasedTexture;
      params = textures.releasedParams;
      textureMatrix = textures.releasedMatrix;
    }
    if (paramUniform) {
      paramUniform(params);
    }
    uniforms['u_texture'](textureInfo.texture);
    let opacity = 1 - (pipeline.xray ? 0.1 : this.transparency);
    uniforms['u_opacity'](opacity);
    uniforms['u_textureMatrix'](textureMatrix);

    if (this.bumpTextureUrl && pipeline.program.uniformSetters.u_bumpMap) {
      if (!this.bumpTextureInfo) {
        this.bumpTextureInfo = pipeline.textures.load(this.bumpTextureUrl, true);
      }
      pipeline.program.uniformSetters.u_bumpMap(this.bumpTextureInfo.texture);
    }
  }
}

/**
 * List of meshes made of single material
 * split into batches to provide optimal buffer size to WebGL
 * and speedup updates of individual meshes
 */
export class MeshBundle {
  renderMaterial = new RenderMaterial();
  batches: Array<MeshBatch> = [];
  private reflected = false;

  constructor(public materialPointer: string) {}

  destroy(gl: WebGLRenderingContext) {
    this.renderMaterial.destroy();
    for (let batch of this.batches) {
      batch.remove(gl);
    }
    this.batches = [];
  }

  get isEmpty() {
    return this.batches.length < 1;
  }

  render(pipeline: RenderPipeline, withMaterials = true, selectionOnly = false, exclude: MeshBatch = undefined, hidden = false) {
    if (this.batches.length > 0) {
      if (withMaterials) {
        this.renderMaterial.apply(pipeline);
      }
      for (let batch of this.batches) {
        if (!selectionOnly || batch.selected) {
          if (batch !== exclude) {
            batch.draw(pipeline, hidden);
          }
        }
      }
    }
  }

  cleanup(gl: WebGLRenderingContext) {
    let batches = this.batches;
    let lastBatch: MeshBatch;
    for (let k = batches.length - 1; k >= 0; k--) {
      let batch = batches[k];
      batch.cleanup();
      if (batch.attribSize <= 0) {
        batches[k].remove(gl);
        batches.splice(k, 1);
      } else if (lastBatch && lastBatch.attribSize > batch.attribSize) {
        batches[batches.length - 1] = batch;
        batches[k] = lastBatch;
        lastBatch = batch;
      }
    }
  }

  add(item: TriMesh) {
    let batch: MeshBatch;
    let batches = this.batches;
    if (batches.length > 0) {
      if (this.reflected) {
        batch = batches.find(b => b.anyEntity === item.link.entity);
      } else {
        batch = batches[batches.length - 1];
      }
      if (batch && !batch.canAdd(item)) {
        batch = undefined;
      }
    }
    if (!batch) {
      batch = new MeshBatch(item.link.selected);
      batches.push(batch);
    }
    batch.add(item);
  }

  prepareReflected(pipeline: RenderPipeline) {
    let reflected = this.renderMaterial.reflection > 0.01;
    if (reflected !== this.reflected) {
      this.reflected = reflected;
      let meshes = []
      for (let batch of this.batches) {
        meshes.push(...batch.meshes);
        batch.remove(pipeline.gl);
      }
      this.batches = [];
      for (let mesh of meshes) {
        this.add(mesh);
      }
    }
  }
}

/**
 * List of polygons frome the scene
 * split into batches to provide optimal buffer size to WebGL
 * and speedup partial updates
 */
class LineBundle {
  private _batches: Array<LineBatch> = [];

  constructor(private _selected: boolean) {}

  destroy(gl: WebGLRenderingContext) {
    for (let batch of this._batches) {
      batch.remove(gl);
    }
    this._batches = [];
  }

  get isEmpty() {
    return this._batches.length < 1;
  }

  render(pipeline: RenderPipeline) {
    for (let batch of this._batches) {
      batch.draw(pipeline);
    }
  }

  cleanup(gl: WebGLRenderingContext) {
    let batches = this._batches;
    let lastBatch: LineBatch;
    for (let k = batches.length - 1; k >= 0; k--) {
      let batch = batches[k];
      batch.cleanup();
      if (batch.coordsCount <= 0) {
        batches[k].remove(gl);
        batches.splice(k, 1);
      } else if (lastBatch && lastBatch.coordsCount > batch.coordsCount) {
        batches[batches.length - 1] = batch;
        batches[k] = lastBatch;
        lastBatch = batch;
      }
    }
  }

  add(item: LineMesh) {
    let batches = this._batches;
    let batch: LineBatch;
    if (batches.length > 0) {
      batch = batches[batches.length - 1];
      if (!batch.canAdd(item)) {
        batch = undefined;
      }
    }
    if (!batch) {
      batch = new LineBatch();
      batches.push(batch);
    }
    batch.add(item);
  }
}

class RenderDrawing {
  link: RenderLink;
  drawing: geom.Element;
}

export enum LightType {
  Point = undefined,
  Spot = 0,
  Head = 1,
  Sun = 2
}

export class RenderLight {
  constructor(public link?: RenderLink) {
    if (link) {
      this.uid = link.entity.uidStr;
    }
  }

  update() {
    let data: any = {};
    if (this.link && this.link.entity) {
      data = this.link.entity.data.light || {};
      let pos = this.link.entity.box.center;
      this.position = new Float32Array(this.link.entity.toGlobal(pos));
    }
    this.power = data.power || this.power;
    this.distance = data.distance || this.distance;
    this.shadows = data.shadows;
  }

  uid: string;
  type = LightType.Point;
  power = 100;
  distance = 1500;
  specular = 0.05;
  shininess = 25.0;
  enabled = true;
  shadows = true;
  position = new Float32Array(3);
  direction = new Float32Array(3);
}

export class SunLight extends RenderLight {
  enabled = true;
  luminance = 40;
  elevation = 90;
  azimuth = 140;

  computePosition() {
    let pos = this.position;
    vec3.set(pos, 0, 0, 1);
    vec3.rotateX(pos, pos, vec3.origin, glMatrix.toRadian(-this.elevation));
    vec3.rotateY(pos, pos, vec3.origin, glMatrix.toRadian(this.azimuth));
    return pos;
  }

  shaderLuminance() {
    return 1.19 - Math.sqrt(this.luminance) / 100;
  }
}

class DynVisibleItem {
  globalPlane = plane.createABCD(1, 0, 0, 0);
  alwaysDynamic = false;
  constructor(public link: RenderLink, public visPlane: Float64Array) {}
}

class RenderAnimation {
  link: RenderLink;
  animation: Animation;
  active = true;
  removed = false;
  startTime: number;
  animationTime = 0;
  srcPos = 0;
  destPos = 1;
  curPos = 0;
  entity: Entity;

  constructor(
    e: Entity,
    animation: Animation,
    source: number,
    destination: number,
    time = 1000
  ) {
    this.entity = e;
    this.animation = animation;
    this.link = <RenderLink>e.renderLink;
    if (this.link.animation) {
      this.link.animation.removed = true;
    }
    this.link.animation = this;
    this.startTime = Date.now();
    this.srcPos = source;
    this.destPos = destination;
    this.animationTime = Math.abs(destination - source) * time;
  }

  matrix(time: number) {
    let pos = (time - this.startTime) / this.animationTime;
    if (pos > 1.0) {
      pos = 1.0;
      this.active = false;
    }
    // quadratic easing out
    pos = -pos * (pos - 2);
    this.curPos = this.srcPos + (this.destPos - this.srcPos) * pos;
    let animMatrix = this.animation.interpolate(this.curPos);
    return animMatrix;
  }
}

export class FillOptions {
  drawOpaque = true;
  drawTransparent = true;
  drawHidden = false;
  withMaterials = true;
  drawBumpMaps: undefined | boolean = undefined;
  selectionOnly = false;
  drawReflected: undefined | boolean = undefined;
  exclude?: MeshBatch = undefined;
}

class TextureInfo {
  constructor (private cache: TextureCache, public path: string, public bump: boolean) {}
  useCount = 1;
  loading = true;
  texture: WebGLTexture;

  addRef() {
    this.useCount++;
  }

  releaseRef(params?: number[], matrix?: Float32Array) {
    this.useCount--;
    this.cache.onRelease(this, params, matrix);
  }
}

export class TextureCache {
  constructor(private gl: WebGLRenderingContext) {
    this.defaultTexture = this.load('');
    this.releasedTexture = this.defaultTexture;
  }

  enableAnisatropy() {
    this.anisotropicFilter = this.gl.getExtension('EXT_texture_filter_anisotropic');
    if (this.anisotropicFilter) {
      let max = this.gl.getParameter(this.anisotropicFilter.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      if (max >= 16) {
        return true;
      } else {
        this.anisotropicFilter = undefined;
      }
    }
  }

  destroy() {
    this.cleanup(true);
    this.loading$.complete();
  }

  loading$ = new EventEmitter<boolean>();
  private anisotropicFilter?: EXT_texture_filter_anisotropic;
  private textures = new Map<string, TextureInfo>();
  private loadCount = 0;
  // texture preloading:
  // use last released texture as temp for newly loaded
  // to avoid flickering when changing model materials
  releasedTexture: TextureInfo;
  releasedParams = [0, 0, 0, 0];
  releasedMatrix = mat4.createIdentity32();
  defaultTexture: TextureInfo;

  private getTextureUrl(value: string, bump: boolean) {
    if (!value) {
      return `./textures/default.jpg`;
    }
    if (value.startsWith('./')) {
      return value;
    }
    if (bump) {
      return `./bumpmaps/${value.substr(0, 2)}/${value}`;
    }
    if (value.length === 7 && value[0] === '#') {
      return value;
    }
    if (value.startsWith('@')) {
      return `./textures/` + value.substr(1);
    }
    return `./textures/${value.substr(0, 2)}/${value}`;
  }

  load(path: string, bump = false): TextureInfo {
    let info = this.textures.get(path);
    if (!info) {
      let textureUrl = this.getTextureUrl(path, bump);
      let options = new twgl.TextureOptions(textureUrl);
      options.min = this.gl.LINEAR_MIPMAP_LINEAR;
      options.mag = this.gl.LINEAR;
      options.anisotropicFilter = this.anisotropicFilter;
      info = new TextureInfo(this, path, bump);
      this.loadCount++;
      info.texture = twgl.createTexture(this.gl, options, (err, tex) => this.onLoad(info, err, tex));
      this.textures.set(path, info);
    }
    info.addRef();
    return info;
  }

  onRelease(info: TextureInfo, params?: number[], matrix?: Float32Array) {
    if (info.path && !info.bump) {
      this.releasedTexture = info;
      if (params) {
        this.releasedParams = params;
      }
      if (matrix) {
        this.releasedMatrix = matrix;
      }
    }
  }

  private onLoad(info: TextureInfo, err: any, texture: WebGLTexture) {
    if (!info.loading) return;
    this.loadCount--;
    if (info !== this.defaultTexture) {
      this.loading$.next(this.loadCount > 0);
    }
    info.texture = texture;
    info.loading = false;
    if (err) {
      console.error('Failed to load texture image', err);
    }
  }

  cleanup(force?: boolean) {
    this.textures.forEach((info, key) => {
      if (force || (info.useCount === 0 && !info.loading)) {
        info.loading = false;
        this.gl.deleteTexture(info.texture);
        this.textures.delete(key);
      }
    })
  }
}

export class RenderScene {
  materials: { [key: string]: MeshBundle } = {};
  // TODO: this currently limits light geometry size to 64K vertices
  private lightGeometry = new MeshBatch(false);
  wireframe = new LineBundle(false);
  selectedWireframe = new LineBundle(true);
  drawings: Array<RenderDrawing> = [];
  lights: Array<RenderLight> = [];
  headLight: RenderLight;
  sunLight: SunLight;
  gl: WebGLRenderingContext;
  private _modelChanged = false;
  private bundleRemoved = false;
  // list of dynamic walls
  private _dynVisibleItems = new Array<DynVisibleItem>();
  private _animations = new Array<RenderAnimation>();
  private _hasActiveAnimations = false;
  private _revision = 0;
  private screenQuad: WebGLBuffer;

  constructor(gl: WebGLRenderingContext, private shaderPrecision: string) {
    this.gl = gl;
    this.headLight = new RenderLight(undefined);
    this.headLight.uid = 'head-light';
    this.headLight.type = LightType.Head;
    this.headLight.distance = 0;
    this.headLight.power = 150;
    this.headLight.shadows = false;

    this.sunLight = new SunLight(undefined);
    this.headLight.uid = 'sun-light';
    this.sunLight.type = LightType.Sun;
    this.sunLight.distance = 0;
    this.sunLight.power = 150;
    let vertices = [
      -1, -1, 0,
      1, -1, 0,
      1, 1, 0,
      -1, -1, 0,
      1, 1, 0,
      -1, 1, 0
    ];
    this.screenQuad = twgl.createBufferFromTypedArray(gl, new Float32Array(vertices), gl.ARRAY_BUFFER);
  }

  get revision() {
    return this._revision;
  }

  destroy() {
    for (let bundle in this.materials) this.materials[bundle].destroy(this.gl);
    this.wireframe.destroy(this.gl);
    this.selectedWireframe.destroy(this.gl);
    this.lightGeometry.remove(this.gl);
    this.gl.deleteBuffer(this.screenQuad);
    this.gl = undefined;
  }

  enlargeFrustum(planes, selectedOnly = false) {
    for (let anim of this._animations) {
      let entity = anim.link.entity;
      if (entity) {
        if (!selectedOnly || entity.isSelected) {
          plane.enlargeFrustum(planes, anim.link.entity.box, anim.link.matrix);
        }
      }
    }
  }

  private addContent(
    entity: Entity,
    mapper: MaterialMapper,
    selected: boolean,
    isLight: boolean
  ): DynVisibleItem {
    let link = new RenderLink(entity);
    link.selected = entity.selected || selected;
    entity.renderLink = link;
    let visItem: DynVisibleItem;
    if (entity.visibleDir) {
      let box = entity.contentBox || entity.sizeBox;
      let visPlane = plane.createPN(box.center, entity.visibleDir);
      visItem = new DynVisibleItem(link, visPlane);
      visItem.alwaysDynamic = entity.visibleDir.length > 3;
      this._dynVisibleItems.push(visItem);
    }
    if (isLight && entity.data.light) {
      this.lights.push(new RenderLight(link));
    }
    if (entity.meshes) {
      let catalog = undefined;
      let curEntity = entity;
      while (!catalog && curEntity) {
        catalog = catalog || curEntity.catalog;
        curEntity = curEntity.parent;
      }
      for (let mesh of entity.meshes) {
        if (isLight) {
          this.lightGeometry.add(new TriMesh(mesh, link));
          continue;
        }
        let material = mapper.map(mesh.material);
        let meshCatalog = mesh.catalog || catalog;
        let pointer = materialPointer(meshCatalog, material, true);
        let bundle = this.materials[pointer];
        if (!bundle) {
          bundle = new MeshBundle(pointer);
          bundle.renderMaterial.name = material;
          bundle.renderMaterial.catalogId = meshCatalog;
          this.materials[pointer] = bundle;
        }
        bundle.add(new TriMesh(mesh, link));
      }
    }
    if (!isLight && entity.edges) {
      let mesh = new LineMesh(entity.edges, link);
      if (selected) {
        this.selectedWireframe.add(mesh);
      } else {
        this.wireframe.add(mesh);
      }
    }
    if (entity.drawing) {
      let drawing = new RenderDrawing();
      drawing.link = link;
      drawing.drawing = entity.drawing;
      this.drawings.push(drawing);
    }
    return visItem;
  }

  animateEntity(e: Entity, newPos?: number) {
    let sourcePos = e.animPos || 0;
    let destPos = newPos;
    if (destPos === undefined) {
      destPos = sourcePos < 0.5 ? 1.0 : 0;
    }
    let time = 1000;
    if (e.anim.time && Math.abs(e.anim.time) > geom.eps) {
      time = e.anim.time * 1000;
    }
    for (let anim of e.anim.items) {
      let animEntity = e.ds.entityMap[anim.entity];
      if (animEntity && animEntity.renderLink) {
        let renderAnimation = new RenderAnimation(
          animEntity,
          anim,
          sourcePos,
          destPos,
          time
        );
        this._animations.push(renderAnimation);
      }
    }
    e.animPos = destPos === 0 ? undefined : destPos;
  }

  updateAnimation(e: Entity) {
    for (let animation of e.anim.items) {
      let animEntity = e.ds.entityMap[animation.entity];
      if (animEntity) {
        let renderAnimation = this._animations.find(a => a.entity === animEntity);
        if (renderAnimation) {
          renderAnimation.animation = animation;
        }
      }
    }
  }

  private syncEntity(
    pipeline: RenderPipeline,
    entity: Entity,
    parentMatrix: Float32Array,
    mapper: MaterialMapper,
    selected: boolean,
    transformed: boolean,
    isLight: boolean
  ) {
    if (!entity.isVisible) return;
    mapper.push(entity);
    let visItem: DynVisibleItem;
    isLight = isLight || !!entity.data.light;
    if (!entity.renderLink) {
      visItem = this.addContent(entity, mapper, entity.selected || selected, isLight);
    }
    let link = <RenderLink>entity.renderLink;
    link.selected = entity.selected || selected;
    transformed = transformed || link.transformed;
    mat4.copy(link.matrix, parentMatrix);
    mat4.mul(link.matrix, link.matrix, entity.matrix);
    if (link.animation) {
      link.animation.active = true;
      mat4.mul(link.matrix, link.matrix, link.animation.matrix(Date.now()));
      transformed = true;
    }
    link.transformed = transformed;
    if (entity.children) {
      for (let k = 0; k < entity.children.length; k++) {
        this.syncEntity(
          pipeline,
          entity.children[k],
          link.matrix,
          mapper,
          link.selected,
          transformed,
          isLight
        );
      }
    }
    mapper.pop(entity);
    if (visItem) {
      this.updateDynVisibleItem(pipeline, visItem);
    }
  }

  private _isAnimationActive() {
    for (let item of this._animations) {
      if (item.active) {
        return true;
      }
    }
    return false;
  }

  private _cleanAnimations() {
    let changed = false;
    let animItems = this._animations;
    for (let k = animItems.length - 1; k >= 0; k--) {
      let item = animItems[k];
      if (item.link.removed) {
        if (item.entity.renderLink) {
          item.link = item.entity.renderLink as RenderLink;
          if (item.link.animation) {
            item.removed = true;
          } else {
            item.active = true;
            item.link.animation = item;
            item.link.transformed = true;
            changed = true;
          }
        } else {
          item.removed = true;
        }
      }
      if (item.removed || (!item.active && item.curPos < 0.001)) {
        let anotherAnimationForEntity = animItems.find(i => i !== item && i.entity === item.entity);
        if (!anotherAnimationForEntity) {
          item.entity.animPos = undefined;
        }
        animItems.splice(k, 1);
      }
    }
    return changed;
  }

  intersectAnimatedObjects(ray: EntityRay) {
    let result = false;
    let invertMatrix = mat4.create();
    for (let anim of this._animations) {
      if (!anim.link.removed) {
        let oldRay = ray.toArray();
        mat4.invert(invertMatrix, anim.link.matrix);
        ray.transform(invertMatrix);
        if (anim.link.entity.localIntersect(ray)) {
          result = true;
        }
        ray.fromArray(oldRay);
      }
    }
    return result;
  }

  private cleanLinkList(list: Array<{ link?: RenderLink }>) {
    for (let k = list.length - 1; k >= 0; k--) {
      if (list[k].link.removed) {
        list.splice(k, 1);
      }
    }
  }

  private cleanup(updateLights: boolean) {
    for (let bundle in this.materials) {
      this.materials[bundle].cleanup(this.gl);
    }
    this.wireframe.cleanup(this.gl);
    this.selectedWireframe.cleanup(this.gl);
    this.lightGeometry.cleanup();

    this.cleanLinkList(this.drawings);
    if (updateLights) {
      this.cleanLinkList(this.lights);
    }
    this.cleanLinkList(this._dynVisibleItems);
  }

  private updateDynVisibleItem(pipeline: RenderPipeline, item: DynVisibleItem) {
    if (!pipeline.dynamicVisibility && !item.alwaysDynamic) {
      if (item.link.hidden) {
        item.link.hidden = false;
        item.link.transform();
        this._modelChanged = true;
      }
    }
    plane.transform(item.globalPlane, item.visPlane, item.link.matrix);
    let hidden = false;
    if (pipeline.dynamicVisibility || item.alwaysDynamic) {
      hidden = pipeline.perspective
        ? plane.evalLocation(item.globalPlane, pipeline.viewPos) < 0
        : vec3.dot(pipeline.viewDir, item.globalPlane) > 0.01;
    }
    if (hidden !== item.link.hidden) {
      item.link.hidden = hidden;
      item.link.transform();
      this._modelChanged = true;
    }
  }

  private updateDynVisibleItems(pipeline: RenderPipeline) {
    for (let item of this._dynVisibleItems) {
      this.updateDynVisibleItem(pipeline, item);
    }
  }

  beforeRender(pipeline: RenderPipeline, modelChanged: boolean, updateLights: boolean) {
    this._hasActiveAnimations = this._isAnimationActive();
    this._modelChanged = this._modelChanged || modelChanged || this._hasActiveAnimations;
    this.updateDynVisibleItems(pipeline);
    // modelChanged can be modified by previous call
    if (this._modelChanged) {
      let mapper = new MaterialMapper();
      for (let anim of this._animations) {
        anim.active = false;
      }
      ++this._revision;
      this.syncEntity(
        pipeline,
        pipeline.ds.root,
        mat4.createIdentity32(),
        mapper,
        false,
        false,
        false
      );
      this.syncEntity(
        pipeline,
        pipeline.ds.temp,
        mat4.createIdentity32(),
        mapper,
        false,
        false,
        false
      );
      this.cleanup(updateLights);
    }
    // if animation changed rebuild model again
    if (this._cleanAnimations()) {
      let mapper = new MaterialMapper();
      this.syncEntity(
        pipeline,
        pipeline.ds.root,
        mat4.createIdentity32(),
        mapper,
        false,
        false,
        false
      );
      this.syncEntity(
        pipeline,
        pipeline.ds.temp,
        mat4.createIdentity32(),
        mapper,
        false,
        false,
        false
      );
    }
    this.bundleRemoved = false;
    for (let bundleName in this.materials) {
      let bundle = this.materials[bundleName];
      if (bundle.isEmpty) {
        bundle.destroy(this.gl);
        delete this.materials[bundleName];
        this.bundleRemoved = true;
      }
    }
  }

  renderFill(pipeline: RenderPipeline, options: FillOptions) {
    let reflectedMaterials = false;
    let transparentMaterials = false;
    let bumpMaterials = false;
    if (!pipeline.xray) {
      // we should fill z-buffer for opaque objects anyway
      if (!options.drawOpaque) {
        pipeline.gl.colorMask(false, false, false, false);
      }
      for (let bundleName in this.materials) {
        let bundle = this.materials[bundleName];
        let material = bundle.renderMaterial;
        if (material.bumpTexture) {
          bumpMaterials = true;
          if (options.drawBumpMaps === false) {
            continue;
          }
        } else if (options.drawBumpMaps === true) {
          continue;
        }
        if (material.reflection > 0.01) {
          reflectedMaterials = true;
          if (options.drawReflected === false) {
            continue;
          }
        }
        if (material.transparency < 0.01 || options.selectionOnly) {
          bundle.render(pipeline, options.withMaterials, options.selectionOnly, options.exclude, options.drawHidden);
          if (material.type === MaterialType.DoubleSided) {
            this.gl.frontFace(this.gl.CW);
            let frontFace = pipeline.program.uniformSetters.u_frontFace;
            if (frontFace) {
              frontFace(-1);
            }
            bundle.render(pipeline, options.withMaterials, options.selectionOnly, options.exclude, options.drawHidden);
            this.gl.frontFace(this.gl.CCW);
            if (frontFace) {
              frontFace(1);
            }
          }
        } else {
          transparentMaterials = true;
        }
      }
      if (!options.drawOpaque) {
        pipeline.gl.colorMask(true, true, true, true);
      }
    }

    if ((transparentMaterials || pipeline.xray) && options.drawTransparent) {
      let gl = pipeline.gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);

      for (let bundleName in this.materials) {
        let bundle = this.materials[bundleName];
        let material = bundle.renderMaterial;
        if (material.bumpTexture) {
          bumpMaterials = true;
          if (options.drawBumpMaps === false) {
            continue;
          }
        } else if (options.drawBumpMaps === true) {
          continue;
        }
        if (material.reflection > 0.01) {
          reflectedMaterials = true;
          if (options.drawReflected === false) {
            continue;
          }
        }
        if (pipeline.xray || bundle.renderMaterial.transparency > 0.01) {
          bundle.render(pipeline, options.withMaterials, false, options.exclude, options.drawHidden);
        }
      }

      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.disableVertexAttribArray(0);
    this.gl.disableVertexAttribArray(1);
    this.gl.disableVertexAttribArray(2);

    return {
      transparentMaterials,
      reflectedMaterials,
      bumpMaterials
    }
  }

  renderLights(pipeline: RenderPipeline) {
    this.lightGeometry.draw(pipeline);
  }

  renderWireframe(pipeline: RenderPipeline, color, selected?: boolean) {
    let program = pipeline.program;
    let colorSetter = program.uniformSetters['u_color'];
    colorSetter(color);

    let gl = pipeline.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enableVertexAttribArray(0);
    if (selected === true) {
      this.selectedWireframe.render(pipeline);
    } else if (selected === false) {
      this.wireframe.render(pipeline);
    } else {
      this.wireframe.render(pipeline);
      this.selectedWireframe.render(pipeline);
    }
    this.gl.disableVertexAttribArray(0);
    gl.disable(gl.BLEND);
  }

  renderDrawings(
    pipeline: RenderPipeline,
    vectorPipeline: IWebGLVectorPipeline,
    fontSize = 18,
  ) {
    let vectorRender = new VectorRenderer(pipeline.font);
    let localRightDir = vec3.create();
    let localUpDir = vec3.create();
    let localViewDir = vec3.create();
    let invMatrix = mat4.create();
    for (let rdrawing of this.drawings) {
      let contCenter = rdrawing.drawing.size.center;
      let contCenter3 = vec3.fromValues(contCenter.x, contCenter.y, 0.0);
      vec3.transformMat4(contCenter3, contCenter3, rdrawing.link.matrix);
      let drawingPlane = plane.createABCD(0, 0, 1, 0);
      plane.transform(drawingPlane, drawingPlane, rdrawing.link.matrix);
      let distance = plane.rayIntersect(
        pipeline.viewPos,
        pipeline.viewDir,
        drawingPlane
      );
      if (distance) {
        vec3.scaleAndAdd(
          contCenter3,
          pipeline.viewPos,
          pipeline.viewDir,
          distance
        );
      }

      let pixelSize = pipeline.calcPixelSize(contCenter3);
      let rightDir = pipeline.rightDir;
      let upDir = pipeline.upDir;
      mat4.invert(invMatrix, rdrawing.link.matrix);
      vec3.transformVectorMat4(localRightDir, rightDir, invMatrix);
      vec3.transformVectorMat4(localUpDir, upDir, invMatrix);
      vec3.transformVectorMat4(localViewDir, pipeline.viewDir, invMatrix);
      vectorRender.setOptions(
        pixelSize * fontSize,
        geom.fromVec3(localRightDir).normalized() || geom.newVector(1, 0),
        geom.fromVec3(localUpDir).normalized() || geom.newVector(0, 1),
        -Math.sign(localViewDir[2])
      );
      if (pipeline.perspective) {
        vectorRender.getFontSize = pos => {
          let pos3 = vec3.fromValues(pos.x, pos.y, 0.0);
          vec3.transformMat4(pos3, pos3, rdrawing.link.matrix);
          return pipeline.calcPixelSize(pos3) * fontSize;
        };
      }
      let ranges = [];
      vectorRender.addElement(rdrawing.drawing, ranges);
      rdrawing.link.ranges = ranges;
      vectorRender.draw(pipeline.gl, vectorPipeline, rdrawing.link.matrix);
      vectorRender.clear();
    }
  }

  private removeTransformFlag(root: Entity) {
    let link = <RenderLink>root.renderLink;
    if (link) {
      link.transformed = false;
    }
    if (root.children) {
      for (let child of root.children) {
        this.removeTransformFlag(child);
      }
    }
  }

  afterRender(root: Entity) {
    if (this._modelChanged) {
      this.removeTransformFlag(root);
    }
    this._modelChanged = false;
    this.lightGeometry.cleanup();
    return {
      bundleRemoved: this.bundleRemoved,
      repeatRender: this._hasActiveAnimations
    };
  }

  modelChanged() {
    this._modelChanged = true;
  }

  drawScreenQuad() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.screenQuad);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.disableVertexAttribArray(0);
  }
}
