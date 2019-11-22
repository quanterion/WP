import { glMatrix } from './geometry/common';
import { mat4 } from './geometry/mat4';
import { vec3 } from './geometry/vec3';
import { plane } from './geometry/plane';
import { Ray } from './geometry/ray';
import { Box } from './geometry/box';
import * as geom from './geometry/geometry';
import { Animation, CompoundAnimation, AnimationFrame } from './interpolator';
import { EventEmitter } from '@angular/core';
import * as Long from 'long';
import * as protobuf from 'protobufjs/minimal';
protobuf.util.Long = Long as any;
protobuf.configure();
import { pb } from './pb/scene';
import { MathCalculator } from './math-calculator';
import { Md5 } from './md5';
import { EntityPropertyInfo, ElementInfo } from './model-properties';
import { Observable } from 'rxjs';

export class Mesh {
  name: number;
  material: string;
  catalog?: number;
  position: number[];
  normal: number[];
  texcoord: number[];
  indices: number[];

  createBox(box: Box) {
    this.position = new Array<number>(24 * 3);
    this.normal = new Array<number>(24 * 3);
    this.texcoord = new Array<number>(24 * 2);
    this.indices = new Array<number>(36);

    let index = 0;
    let pos = 0;
    let texPos = 0;
    let nx = 0;
    let ny = 0;
    let nz = 0;

    let setNormal = (x: number, y: number, z: number) => {
      nx = x;
      ny = y;
      nz = z;
    }

    let addPos = (x: number, y: number, z: number, tx: number, ty: number) => {
      this.position[pos + 0] = x;
      this.position[pos + 1] = y;
      this.position[pos + 2] = z;
      this.normal[pos + 0] = nx;
      this.normal[pos + 1] = ny;
      this.normal[pos + 2] = nz;
      pos += 3;
      this.texcoord[texPos + 0] = tx;
      this.texcoord[texPos + 1] = ty;
      texPos += 2;
      return index++;
    }

    let i1 = 0;
    let i2 = 0;
    let i3 = 0;
    let i4 = 0;
    let curIndex = 0;
    let addTri = (a, b, c) => {
      this.indices[curIndex++] = a;
      this.indices[curIndex++] = c;
      this.indices[curIndex++] = b;
    }

    setNormal(0, 0, -1);
    i1 = addPos(box.minx, box.miny, box.minz, 0.75, 0);
    i2 = addPos(box.maxx, box.miny, box.minz, 0.5, 0);
    i3 = addPos(box.maxx, box.maxy, box.minz, 0.5, 0.5);
    i4 = addPos(box.minx, box.maxy, box.minz, 0.75, 0.5);
    addTri(i1, i2, i3);
    addTri(i4, i1, i3);

    setNormal(0, 0, 1);
    i1 = addPos(box.minx, box.miny, box.maxz, 0.5, 0.5);
    i2 = addPos(box.maxx, box.miny, box.maxz, 0.75, 0.5);
    i3 = addPos(box.maxx, box.maxy, box.maxz, 0.75, 1);
    i4 = addPos(box.minx, box.maxy, box.maxz, 0.5, 1);
    addTri(i2, i1, i3);
    addTri(i3, i1, i4);

    setNormal(0, -1, 0);
    i1 = addPos(box.minx, box.miny, box.minz, 0.25, 0);
    i2 = addPos(box.maxx, box.miny, box.minz, 0.5, 0);
    i3 = addPos(box.maxx, box.miny, box.maxz, 0.5, 0.5);
    i4 = addPos(box.minx, box.miny, box.maxz, 0.25, 0.5);
    addTri(i2, i1, i3);
    addTri(i1, i4, i3);

    setNormal(0, 1, 0);
    i1 = addPos(box.minx, box.maxy, box.minz, 0.25, 1);
    i2 = addPos(box.maxx, box.maxy, box.minz, 0.5, 1);
    i3 = addPos(box.maxx, box.maxy, box.maxz, 0.5, 0.5);
    i4 = addPos(box.minx, box.maxy, box.maxz, 0.25, 0.5);
    addTri(i1, i2, i3);
    addTri(i1, i3, i4);

    setNormal(-1, 0, 0);
    i1 = addPos(box.minx, box.miny, box.minz, 0, 0.5);
    i2 = addPos(box.minx, box.maxy, box.minz, 0, 1);
    i3 = addPos(box.minx, box.maxy, box.maxz, 0.25, 1);
    i4 = addPos(box.minx, box.miny, box.maxz, 0.25, 0.5);
    addTri(i1, i2, i3);
    addTri(i4, i1, i3);

    setNormal(1, 0, 0);
    i1 = addPos(box.maxx, box.miny, box.minz, 1, 0.5);
    i2 = addPos(box.maxx, box.maxy, box.minz, 1, 1);
    i3 = addPos(box.maxx, box.maxy, box.maxz, 0.75, 1);
    i4 = addPos(box.maxx, box.miny, box.maxz, 0.75, 0.5);
    addTri(i2, i1, i3);
    addTri(i3, i1, i4);
  }
}

export interface RenderLink {
  matrix;
  entity: Entity;
  ranges: Array<any>; // array of ElementRange for drawings selection
  remove();
  transform();
  hidden: boolean;
}

export enum MountType {
  Default = undefined,
  InsideWall = 1, // windows
  InsideWallAtBottom = 2, // doors
  Floor = 3
}

export type EntityFilter = (Entity) => boolean;
export type EntityOrder = (Entity) => number;

export class EntityRay extends Ray {
  filter: EntityFilter;
  contentFilter: EntityFilter;
  // if assigned then intersects with boxes of true nodes
  boxIntersector: EntityFilter;
  animated = false;
}

export enum ModelUnits {
  mm = 1.0,
  cm = 10.0,
  m = 1000.0,
  in = 25.4,
  pt = 0.254,
  ft = 304.8
}

export enum ModelGetValue {
  Unknown,
  Size,
  Volume,
  Area,
  Storage,
  MaterialLength
};

export interface ModelValueRequest {
  value: ModelGetValue;
  arg: any;
  uid: Entity | string;
  recursive?: boolean;
}

export interface NoteInfo {
  text: string;
  pos?: [number, number, number];
  camera?: string; // result of saveCamera()
  mesh?: number; //id of mesh
  occludable?: boolean;
  color?: string;
  icon?: string;
}

export interface EntityData {
  model?: ElementInfo,
  wall?: {
    material?: string;
    catalog?: number;
    hash?: string;
    id: number;
    roomIntervals: {t1: number, t2: number}[];
    height?: number;
    thickness?: number;
    baseline?: number;
    dir?: number;
  };
  room?: {
    // contains walls segment ids
    id: string;
    contour: any;
    hash: string;
    thickness: number;
    material?: string;
    catalog?: number;
  };
  floor?: any;
  ceiling?: any;
  propInfo?: EntityPropertyInfo;
  mountType?: MountType;
  symmetry?: number;
  light?: {
    power?: number;
    distance?: number;
    shadows?: boolean;
  };
  import?: {
    units: string;
  }
  headLight?: {
    power: number,
    enabled: boolean
  };
  sunLight?: any;
  roof?: {type, length, width, height, thickness, offset, material};
  slope?: {uid, area};
  notes?: NoteInfo[];
  collision?: {
    disabled?: boolean;
    box: number[];
  },
  paint?: boolean;
}

export type UndoMode = 'start' | 'next' | 'finish' | 'clear';

export interface BuilderInsertModel {
  insertModelId: string | number;
  modelName?: string;
  sku?: string;
  matrix?: number[] | Float64Array;
}

interface EntityDataChange extends EntityData {
  merge?: boolean;
}

export interface BuilderApplyInfo {
  remove?: boolean;
  copy?: boolean;
  name?: string;
  type?: string;
  parent?: string | Entity;
  parentIndex?: number;
  layer?: string;
  catalog?: number,
  paint?: { material: string, catalog: number, faces: number[] } | 'remove' | 'remove-recursive';
  symmetry?: any;
  data?: EntityDataChange;
  size?: { [name: string]: number };
  scale?: number;
  matrix?: Float64Array | number[];
  updateRoof?: boolean; // roof update
  elastic?: {
    container?: boolean;
    box?: Float64Array | number[];
    position?: pb.Elastic.Position;
    params?: { name: string, size: number }[];
    min?: Float64Array | number[];
    max?: Float64Array | number[];
    elasticx?: boolean;
    elasticy?: boolean;
    elasticz?: boolean;
  }
  builder?: any;
  mesh?: {
    transform?: Float64Array;
  }
  insert?: BuilderInsertModel;
  replace?: BuilderInsertModel;
  children?: BuilderApplyInfo[];
}

export interface BuilderApplyItem extends BuilderApplyInfo {
  uid?: string | Entity | { name?: string, type?: string };
}

export class Layer {
  constructor (private ds: Designer, public readonly name) { }
  private _visible = true;

  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (this._visible !== value) {
      this._visible = value;
      this.ds.root.forAll(e => {
        if (e.layer === this) {
          e.selected = false;
          e.changed(true);
        }
      });
    }
  }

  used = true;
  opacity = 1;
}

export interface ElasticParam {
  name?: string;
  description?: string;
  size?: number;
  flags?: number;
  variants?: string;
}

export interface ElasticParamView {
  name?: string;
  description?: string;
  size?: number;
  flags?: number;
  control?: 'checkbox';
  variants?: { name: string; value: number }[];
  entitites: Entity[];
}

export interface EntityElasticInfo extends pb.IElastic {
  box: Box;
  params: pb.Elastic.IParam[];
}

export class Entity {
  ds: Designer;
  private _uid: Long;
  name = '';
  type = '';
  private _layer: Layer;
  private _catalog: number;
  private _selected = false;
  private _visible = true;
  revision: number;
  private _parent: Entity; // (optional)
  matrix = mat4.createIdentity();
  // if defined - vector from which entity is visible
  // if length > 3 this dir should be used always regardless of setting
  visibleDir?: Float64Array;
  children: Array<Entity>;
  // mapping from mesh materials to actually displayed materials
  materialMap: { [material: string]: string };
  materialMapRevision: number;

  meshes?: Array<Mesh>;
  edges: Array<number[]>;
  advMaterials?: string;
  drawing: geom.Element;
  anim: CompoundAnimation;
  elastic?: EntityElasticInfo;
  animPos: number;
  // object stored in JsonComponent
  data: EntityData = {};
  dataUidMask: Long = Long.fromInt(0);

  private _box: Box; // size of content and children
  private _boxOk = false;
  contentBox: Box; // size of content (optional)
  renderLink: RenderLink;
  removed = false; // for debug

  constructor(ds: Designer) {
    this.ds = ds;
    this._box = new Box();
  }

  get uid() {
    return this._uid;
  }

  get uidStr() {
    return this._uid.toString();
  }

  set uid(value: Long) {
    if (this.uid) throw new Error('can not change uid');
    this._uid = value;
    this.ds.entityMap[value.toString()] = this;
  }

  get layer() {
    return this._layer;
  }

  debugTree(): any {
    let tree: any = {
      id: this.uidStr,
      name: this.name,
      sub: this.type,
      data: this.data
    };
    if (this.children && this.children.length)
      tree.children = this.children.map((value: Entity) => value.debugTree());
    return tree;
  }

  get hasChildren() {
    return this.children && this.children.length > 0;
  }

  get box() {
    if (!this._boxOk) {
      this.updateBox(this._box);
      this._boxOk = true;
    }
    return this._box;
  }

  get sizeBox() {
    return (this.elastic && this.elastic.box) || this.box;
  }

  get isContainerItem() {
    let p = this.parent;
    return this.elastic && this.elastic.position && p && p.elastic && p.elastic.container;
  }

  boxChanged() {
    if (this._boxOk) {
      this._boxOk = false;
      if (this.parent) {
        this.parent.boxChanged();
      } else {
        this.modelChanged();
      }
    }
  }

  parentBoxChanged() {
    if (this.parent) {
      this.parent.boxChanged();
    } else {
      this.modelChanged();
    }
  }

  private updateBox(box: Box) {
    box.clear();
    if (this.contentBox) {
      box.addBox(this.contentBox);
    }
    if (this.elastic && this.elastic.box) {
      box.addBox(this.elastic.box);
    }
    if (this.children) {
      for (let k = 0; k < this.children.length; k++) {
        let child = this.children[k];
        box.addOBB(child.box, child.matrix);
      }
    }
  }

  computeBox(filter?: (e: Entity) => boolean) {
    let box = new Box();
    box.clear();
    if (this.elastic && this.elastic.box) {
      box.addBox(this.elastic.box);
      return box;
    }
    if (this.contentBox) {
      box.addBox(this.contentBox);
    }
    if (this.children) {
      for (let e of this.children) {
        if (!filter || filter(e)) {
          box.addOBB(e.computeBox(filter), e.matrix);
        }
      }
    }
    return box;
  }

  get visible() {
    return this._visible;
  }

  get isVisible() {
    let hidden = this.layer && !this.layer.visible;
    return this._visible && !hidden;
  }

  set visible(value: boolean) {
    if (this.visible !== value) {
      this._visible = value;
      this.removeFromRender();
      this.changed();
    }
  }

  get selected() {
    return this._selected;
  }

  set selected(value: boolean) {
    if (value !== this._selected) {
      let selection = this.ds.selection.items;
      if (value) {
        selection.push(this);
      } else {
        selection.splice(selection.lastIndexOf(this), 1);
      }
      this._selected = value;
      this.removeFromRender();
      this.changed();
      this.ds.selection.changed(this);
    }
  }

  get isSelected(): boolean {
    let result = this._selected;
    if (!result && this._parent) {
      result = this._parent.isSelected;
    }
    return result;
  }

  get catalog(): number {
    return this._catalog;
  }

  get parent() {
    return this._parent;
  }

  set parent(value: Entity) {
    let oldMatMap = this.getMaterialMapHash();
    if (this.parent) {
      let parentChildren = this.parent.children;
      parentChildren.splice(parentChildren.indexOf(this), 1);
      this.parent.boxChanged();
    }
    this._parent = value;
    if (value) {
      if (!value.children) value.children = new Array<Entity>();
      value.children.push(this);
      this.parent.boxChanged();
      let newMatMap = this.getMaterialMapHash();
      if (oldMatMap !== newMatMap) {
        this.removeFromRender();
      }
    }
    this.modelChanged();
  }

  get parentIndex() {
    if (this.parent) {
      let parentChildren = this.parent.children;
      return parentChildren.indexOf(this);
    }
    return 0;
  }

  getMaterialMapHash() {
    let result = '';
    let p = this.parent;
    while (p) {
      if (p.materialMap) {
        result += Md5.hashObject(p.materialMap);
      }
      p = p.parent;
    }
    return result;
  }

  findChild(predicate: (value: Entity) => boolean, recursive = false) {
    let result: Entity | undefined;
    if (this.children) {
      result =  this.children.find(predicate);
      if (!result && recursive) {
        for (let child of this.children) {
          result = child.findChild(predicate, recursive);
          if (result) {
            return result;
          }
        }
      }
    }
    return result;
  }

  findParent(predicate: (value: Entity) => boolean, top?: boolean, ignoreThis?: boolean) {
    let cur = this as Entity;
    if (ignoreThis && cur) {
      cur = cur.parent;
    }
    let result: Entity;
    while (cur) {
      if (predicate(cur)) {
        result = cur;
        if (!top) {
          break;
        }
      }
      cur = cur.parent;
    }
    return result;
  }

  changed(children = false) {
    if (children) {
      this.removeFromRender();
    } else {
      this.removeRenderLink();
    }
    if (this.ds) {
      this.ds.modelChanged();
    }
  }

  modelChanged() {
    if (this.ds) {
      this.ds.modelChanged();
    }
  }

  removeRenderLink() {
    if (this.renderLink) {
      this.renderLink.remove();
      this.renderLink = null;
    }
  }

  removeFromRender() {
    this.removeRenderLink();
    if (this.children) {
      for (let k = 0; k < this.children.length; k++)
        this.children[k].removeFromRender();
    }
  }

  removeLayer() {
    if (this._layer) {
      this.ds.tryRemoveLayer(this._layer);
      this._layer = undefined;
    }
  }

  delete() {
    this.removeLayer();
    this.selected = false;
    if (this.uid) delete this.ds.entityMap[this.uidStr];
    this.removeRenderLink();
    this.modelChanged();
    this.deleteChildren();
    this.parent = undefined;
    this.removed = true;
  }

  addChild(): Entity {
    let result = new Entity(this.ds);
    result.parent = this;
    return result;
  }

  deleteChildren() {
    if (this.children) {
      for (let k = this.children.length - 1; k >= 0; k--)
        this.children[k].delete();
    }
  }

  forEach(fun: (e: Entity) => any) {
    if (this.children) {
      for (let child of this.children) {
        if (fun(child) !== false) {
          child.forEach(fun);
        }
      }
    }
  }

  forAll(fun: (e: Entity) => any) {
    if (fun(this) !== false) {
      this.forEach(fun);
    }
  }

  matrixChanged() {
    if (this.renderLink) {
      this.renderLink.transform();
    }
    this.parentBoxChanged();
  }

  setIdentityTransform() {
    this.matrix = mat4.createIdentity();
  }

  clearContent() {
    this.contentBox = undefined;
    this.meshes = undefined;
    this.advMaterials = undefined;
    this.boxChanged();
  }

  get translation() {
    return this.matrix.subarray(12, 15);
  }

  set translation(vec) {
    this.matrix[12] = vec[0];
    this.matrix[13] = vec[1];
    this.matrix[14] = vec[2];
    this.matrixChanged();
  }

  translate(vec) {
    let matrix = mat4.fromTranslation(mat4.create(), vec);
    this.matrix = mat4.multiply(this.matrix, matrix, this.matrix);
    this.matrixChanged();
  }

  stranslate(x, y, z: number) {
    this.translate(vec3.fromValues(x, y, z));
  }

  rotate(center, axis, angle): Entity {
    this.stranslate(-center[0], -center[1], -center[2]);
    let rotation = mat4.fromRotation(mat4.create(), angle, axis);
    mat4.multiply(this.matrix, rotation, this.matrix);
    this.stranslate(center[0], center[1], center[2]);
    return this;
  }

  globalRotate(center, axis, angle): Entity {
    return this.rotate(
      this.globalToParent(center),
      this.NglobalToParent(axis),
      angle
    );
  }

  orient(axisz: Float64Array, axisy: Float64Array): Entity {
    let m = this.matrix;
    let axisx = vec3.cross(vec3.create(), axisy, axisz);
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
    this.matrixChanged();
    return this;
  }

  get globalMatrix() {
    let result = this.matrix;
    return this.parent
      ? mat4.fmultiply(this.parent.globalMatrix, result)
      : mat4.fcopy(result);
  }

  get actualGlobalMatrix() {
    let link = this.renderLink;
    return link ? mat4.fcopy(link.matrix) : this.globalMatrix;
  }

  get invGlobalMatrix() {
    let result = this.globalMatrix;
    return mat4.finvert(result);
  }

  get invMatrix() {
    let out = mat4.create();
    return mat4.invert(out, this.matrix) || mat4.identity(out);
  }

  get windowMatrix() {
    let link = this.renderLink;
    let matrix = link ? mat4.fcopy(link.matrix) : this.globalMatrix;
    mat4.multiply(matrix, this.ds.windowTransform, matrix);
    return matrix;
  }

  public toGlobal(pos: Float64Array): Float64Array {
    let result = vec3.create();
    vec3.transformMat4(result, pos, this.matrix);
    return this.parent ? this.parent.toGlobal(result) : result;
  }

  public toLocal(pos: Float64Array): Float64Array {
    let result = this.parent
      ? this.parent.toLocal(pos)
      : vec3.fromValues(pos[0], pos[1], pos[2]);
    return vec3.transformMat4(result, result, this.invMatrix);
  }

  public toParent(pos: Float64Array): Float64Array {
    let result = vec3.create();
    vec3.transformMat4(result, pos, this.matrix);
    return result;
  }

  public globalToParent(pos: Float64Array): Float64Array {
    return this.parent
      ? this.parent.toLocal(pos)
      : vec3.fromValues(pos[0], pos[1], pos[2]);
  }

  public NtoGlobal(vector: Float64Array): Float64Array {
    let result = vec3.create();
    vec3.transformVectorMat4(result, vector, this.matrix);
    return this.parent ? this.parent.NtoGlobal(result) : result;
  }

  public NtoLocal(vector: Float64Array): Float64Array {
    let result = this.parent
      ? this.parent.NtoLocal(vector)
      : vec3.fromValues(vector[0], vector[1], vector[2]);
    return vec3.transformVectorMat4(result, result, this.invMatrix);
  }

  public NtoParent(vector: Float64Array): Float64Array {
    let result = vec3.create();
    vec3.transformVectorMat4(result, vector, this.matrix);
    return result;
  }

  public NfromParent(vector: Float64Array): Float64Array {
    let result = vec3.create();
    vec3.transformVectorMat4(result, vector, this.invMatrix);
    return result;
  }

  public NglobalToParent(vector: Float64Array): Float64Array {
    return this.parent
      ? this.parent.NtoLocal(vector)
      : vec3.fromValues(vector[0], vector[1], vector[2]);
  }

  retransform(oldParent: Entity, newParent: Entity) {
    let oldGlobalMatrix = mat4.fmultiply(oldParent.globalMatrix, this.matrix);
    mat4.multiply(
      this.matrix,
      mat4.finvert(newParent.globalMatrix),
      oldGlobalMatrix
    );
    mat4.normalizeOrthoMatrix(this.matrix, this.matrix);
    this.matrixChanged();
  }

  private applyGeometry(geometry: pb.IGeometry) {
    this.meshes = [];
    this.edges = [];
    this.advMaterials = geometry.materials;
    this.removeRenderLink();
    this.modelChanged();
    this.boxChanged();
    for (let k = 0; k < geometry.grid.length; k++) {
      let grid = geometry.grid[k];
      let mesh = new Mesh();
      mesh.name = grid.name;
      mesh.material = grid.material;
      mesh.catalog = grid.catalog;
      mesh.position = grid.position;
      mesh.normal = grid.normal;
      mesh.texcoord = grid.texture;
      if (grid.swapuv) {
        let coords = mesh.texcoord;
        for (let j = 0; j < coords.length - 1; j += 2) {
          let x = coords[j];
          let y = coords[j + 1];
          coords[j + 1] = x;
          coords[j] = y;
        }
      }
      mesh.indices = grid.index;
      this.meshes.push(mesh);
    }

    let srcEdges = geometry.edge;
    for (let k = 0; k < srcEdges.length; k++) {
      this.edges.push(srcEdges[k].position);
    }
  }

  applyContent(content: pb.IContent) {
    if (!content) {
      this.clearContent();
      return;
    }

    let common = content.common;
    if (common) {
      this.name = common.name;
      if (this.type !== common.type) {
        this.type = common.type;
        this.changed();
      }
      this._catalog = common.catalog;
      if (common.layer) {
        if (!this._layer || this._layer.name !== common.layer) {
          this.removeLayer();
          this._layer = this.ds.findOrCreateLayer(common.layer);
          this.changed(true);
        }
      } else if (this._layer) {
        this.changed(true);
        this.removeLayer();
      }
    }

    let transform = content.transform;
    if (transform) {
      if (transform.matrix && this !== this.ds.root) {
        if (this !== this.ds.dragTarget) {
          this.matrix = new Float64Array(transform.matrix);
          this.matrixChanged();
        }
      }
      if (transform.contentBox && transform.contentBox.length === 6) {
        this.contentBox = this.contentBox || new Box();
        this.contentBox.set(transform.contentBox);
        this.boxChanged();
      } else {
        this.contentBox = undefined;
      }
      this.boxChanged();
    }

    let geometry = content.geometry;
    if (geometry) {
      this.applyGeometry(geometry);
    } else if (!content.hasGeometry) {
      if (this.meshes) {
        delete this.meshes;
        this.changed();
        this.boxChanged();
      }
    }

    if (content.data) {
      if (content.data) {
        let oldData = this.data;
        this.data = JSON.parse(content.data) || {};
        this.dataUidMask = content.dataUidMask as Long;
        let mapRevision = (this.data.propInfo && this.data.propInfo.revision) || 0;
        if (mapRevision !== this.materialMapRevision) {
          this.materialMap = undefined;
          this.materialMapRevision = undefined;
          this.changed(true);
          if (this.data.propInfo) {
            let materials = this.data.propInfo.materials;
            if (materials && materials.length > 0) {
              this.materialMap = {};
              for (let pair of this.data.propInfo.materials) {
                this.materialMap[pair.old] = pair.new;
              }
            }
          }
        }
        if (oldData && !oldData.light !== !this.data.light) {
          this.changed(true);
        }
      }
    } else if (!content.hasData) {
      if (this.materialMap || this.data.light) {
        this.materialMap = undefined;
        this.materialMapRevision = undefined;
        this.changed(true);
      }
      this.data = {};
    }

    if (content.anim) {
      this.anim = new CompoundAnimation();
      let srcCompoundAnim = content.anim;
      this.anim.time = srcCompoundAnim.length;
      for (let entityAnim of srcCompoundAnim.item) {
        let anim = new Animation();
        anim.entity = entityAnim.entity;
        for (let frame of entityAnim.frame) {
          let newFrame = new AnimationFrame();
          newFrame.angle = frame.angle;
          newFrame.length = frame.length;
          vec3.copy(newFrame.move, frame.move);
          vec3.copy(newFrame.axisPos, frame.axis);
          vec3.copy(newFrame.axisDir, frame.axis.slice(3));
          anim.frames.push(newFrame);
        }
        this.anim.items.push(anim);
      }
      if (this.animPos) {
        this.ds.updateAnimation(this);
      }
    } else if (!content.hasAnim) {
      this.anim = undefined;
    }

    if (content.hasElastic) {
      let elastic = content.elastic;
      if (elastic) {
        let box: Box;
        if (elastic.size && elastic.size.length) {
          box = Box.from(elastic.size);
        }
        this.elastic = { ...elastic, box, params: elastic.param };
        if (this.elastic.min && this.elastic.min.length === 0) {
          this.elastic.min = undefined;
        }
        if (this.elastic.max && this.elastic.max.length === 0) {
          this.elastic.max = undefined;
        }
        this.boxChanged();
      }
    } else {
      this.elastic = undefined;
    }

    let oldVisibleDir = this.visibleDir;
    if (this.data.wall && this.data.wall.dir) {
      this.visibleDir = vec3.fscale(vec3.axisz, this.data.wall.dir);
    } else if (this.data.ceiling) {
      this.visibleDir = new Float64Array([0, 0, 1, 1]);
    } else {
      this.visibleDir = undefined;
    }
    if (oldVisibleDir && this.visibleDir) {
      if (!vec3.equals(oldVisibleDir, this.visibleDir)) {
        this.changed();
      }
    } else if (oldVisibleDir !== this.visibleDir) {
      this.changed();
    }

    this.ds.invalidate();
  }

  intersectMesh(mesh: Mesh, ray: Ray) {
    let positions = mesh.position;
    let indices = mesh.indices;
    let maxIndex = indices.length - 2;
    let result = false;

    let getVertex = index => {
      return vec3.fromValues(
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2]
      );
    };

    for (let i = 0; i < maxIndex; i += 3) {
      let p1 = getVertex(indices[i]);
      let p2 = getVertex(indices[i + 1]);
      let p3 = getVertex(indices[i + 2]);
      if (ray.intersectTriangle(p1, p2, p3)) {
        result = true;
      }
    }
    return result;
  }

  intersectMeshes(ray: Ray): Mesh {
    if (this.meshes) {
      for (let i = 0; i < this.meshes.length; i++) {
        if (this.intersectMesh(this.meshes[i], ray)) return this.meshes[i];
      }
    }
  }

  localIntersect(ray: EntityRay) {
    if (ray.filter && this.parent && !ray.filter(this)) {
      return false;
    }

    if (ray.visibleOnly && !this.isVisible) {
      return false;
    }

    if (!ray.animated && this.animPos) {
      return false;
    }

    let result = false;
    if (ray.boxIntersector && ray.boxIntersector(this)) {
      if (this.visibleDir && this.renderLink && this.renderLink.hidden === true) {
        return false;
      }
      result = ray.intersectBox(this.box);
      if (result) {
        ray.entity = this;
      }
      return result;
    }

    if (ray.isIntersectBox(this.box)) {
      let intersectThis = !ray.boxIntersector;
      if (this.visibleDir && this.renderLink) {
        intersectThis = this.renderLink.hidden !== true;
      }
      if (ray.contentFilter && !ray.contentFilter(this)) {
        intersectThis = false;
      }
      if (intersectThis) {
        let mesh = this.intersectMeshes(ray);
        if (mesh) {
          ray.entity = this;
          ray.mesh = mesh;
          result = true;
        } else if (ray.selection) {
          // empty elastic block with only empty child is considered as opening in wall
          // intersect with elastic box to allow selection
          let emptyElastic = this.elastic && this.elastic.box && !this.meshes;
          if (emptyElastic) {
            let onlyChild = this.children && this.children.length === 1;
            if (onlyChild) {
              let child = this.children[0];
              if (!child.meshes && !child.elastic && (!child.children || child.children.length === 0)) {
                if (ray.intersectBox(this.box)) {
                  result = true;
                  ray.entity = this;
                }
              }
            }
          }
        }
      }

      if (this.children) {
        for (let k = 0; k < this.children.length; k++) {
          if (this.children[k].intersect(ray)) result = true;
        }
      }
    }
    return result;
  }

  intersect(ray: EntityRay) {
    let oldRay = ray.toArray();
    ray.transform(this.invMatrix);
    let result = this.localIntersect(ray);
    ray.fromArray(oldRay);
    return result;
  }

  getSizeInfo(): SizeInfo {
    let box = this.computeBox();
    let elastic = this.elastic;
    let result = {
      x: box.sizex,
      y: box.sizey,
      z: box.sizez,
      xe: elastic && elastic.x,
      ye: elastic && elastic.y,
      ze: elastic && elastic.z,
      position: elastic && elastic.position,
      container: elastic && elastic.container
    }
    if (this.isContainerItem) {
      let pos = elastic.position;
      if (pos !== pb.Elastic.Position.Left && pos !== pb.Elastic.Position.Right
          && pos !== pb.Elastic.Position.LeftRight) {
        result.xe = false;
      }
      if (pos !== pb.Elastic.Position.Top && pos !== pb.Elastic.Position.Bottom
          && pos !== pb.Elastic.Position.TopBottom) {
        result.ye = false;
      }
      if (pos !== pb.Elastic.Position.Back && pos !== pb.Elastic.Position.Front) {
        result.ze = false;
      }
    }
    return result;
  }
}

export enum NavigationMode {
  Ortho,
  Orbit,
  Walk
}

export class Camera extends Entity {
  fovAngle = 60.0; // for perspective only
  scale = 1.0; // for parallel projection
  mode = NavigationMode.Orbit;
  assigned = false;
  lastRotationCenter: any;

  constructor(ds: Designer) {
    super(ds);
  }

  get nearPlaneLimit() {
    return Math.max(0.1, this.ds.box.maxSize * 0.001);
  }

  matrixChanged() {
    // disable model change
  }

  get perspective() {
    return this.mode !== NavigationMode.Ortho;
  }

  toJson() {
    return {
      fovAngle: this.fovAngle,
      scale: this.scale,
      mode: this.mode,
      matrix: Array.prototype.slice.call(this.matrix)
    };
  }

  fromJson(data) {
    this.fovAngle = data.fovAngle;
    this.scale = data.scale;
    this.mode = data.mode;
    this.matrix = new Float64Array(data.matrix);
  }

  enlargeFrustum(planes: Array<any>, box: Box, matrix?) {
    if (box.empty) {
      return;
    }
    let point = vec3.create();
    for (let k = 0; k < 8; k++) {
      box.getPoint(k, point);
      if (matrix) vec3.transformMat4(point, point, matrix);
      plane.includePoint(planes, point);
    }
  }

  enlargeFrustumRecurse(root: Entity, frustum: any[], selectionOnly?: boolean, lights = true) {
    if (!root.visible) return;
    if (root.children) {
      for (let k = 0; k < root.children.length; k++) {
        this.enlargeFrustumRecurse(root.children[k], frustum, selectionOnly, lights);
      }
    }
    if (!lights && !root.hasChildren && root.data.light) {
      return;
    }
    let hasContent = root.meshes || root.drawing;
    if (root.contentBox && hasContent) {
      if (!selectionOnly || root.isSelected) {
        this.enlargeFrustum(frustum, root.contentBox, root.globalMatrix);
      }
    }
  }

  enlargeCameraFrustum(frustum, accurate?: boolean, selectionOnly?: boolean, lights = true) {
    plane.transformArray(frustum, this.matrix);
    if (accurate || selectionOnly || !lights) {
      this.enlargeFrustumRecurse(this.ds.root, frustum, selectionOnly, lights);
      this.enlargeFrustumRecurse(this.ds.temp, frustum, selectionOnly);
    } else {
      this.enlargeFrustum(frustum, this.ds.box, mat4.createIdentity());
      this.enlargeFrustum(frustum, this.ds.temp.box, mat4.createIdentity());
    }
    this.ds.enlargeFrustum(frustum, selectionOnly);
    plane.transformArray(frustum, this.invMatrix);
  }

  calcZPlanes(limits) {
    let planes = [];
    if (!this.ds.root) {
      limits.near = 10;
      limits.far = 10000;
      return;
    }
    let modelBox = this.ds.root.box;
    let center = modelBox.center;
    let viewDir = this.NtoGlobal(vec3.axis_z);
    planes.push(plane.createPN(center, viewDir));
    planes.push(plane.createPN(center, vec3.fnegate(viewDir)));
    this.enlargeFrustum(planes, modelBox);
    plane.transformArray(planes, this.invMatrix);
    limits.near = -planes[0][3];
    limits.far = planes[1][3];
  }

  viewMatrix() {
    return this.invMatrix;
  }

  projectionMatrix(zLimits?, scale?: number) {
    let viewWidth = 1000;
    let viewHeight = 1000;
    if (this.ds.canvas) {
      viewWidth = this.ds.canvas.width;
      viewHeight = this.ds.canvas.height;
    }
    let aspect = viewWidth / viewHeight;

    if (!zLimits) {
      zLimits = { near: 0, far: 1000 };
      this.calcZPlanes(zLimits);
      zLimits.near -= 0.1;
      zLimits.far += 0.1;
    }

    let matrix = mat4.createIdentity();
    if (this.perspective) {
      if (zLimits.near < this.nearPlaneLimit)
        zLimits.near = this.nearPlaneLimit;
      if (zLimits.far < zLimits.near) zLimits.far = zLimits.near + 1000;
      mat4.perspective(
        matrix,
        glMatrix.toRadian(this.fovAngle),
        aspect,
        zLimits.near,
        zLimits.far
      );
    } else {
      scale = scale || this.scale;
      mat4.ortho(
        matrix,
        -1.0 * aspect,
        1.0 * aspect,
        -1.0,
        1.0,
        zLimits.near,
        zLimits.far
      );
      mat4.scale(matrix, matrix, new Float32Array([scale, scale, 1.0]));
    }
    return matrix;
  }

  transformMatrix() {
    let projection = this.projectionMatrix();
    let view = this.viewMatrix();
    return mat4.mul(projection, projection, view);
  }

  computeAspect() {
    let frustum = [];
    let modelBox = this.ds.root.box;
    let cubeCenter = this.toLocal(modelBox.center);
    // top & bottom planes
    frustum.push(plane.createPN(cubeCenter, vec3.fromValues(0.0, 1.0, 0.0)));
    frustum.push(plane.createPN(cubeCenter, vec3.fromValues(0.0, -1.0, 0.0)));
    // left and right planes
    frustum.push(plane.createPN(cubeCenter, vec3.fromValues(1.0, 0.0, 0.0)));
    frustum.push(plane.createPN(cubeCenter, vec3.fromValues(-1.0, 0.0, 0.0)));

    this.enlargeCameraFrustum(frustum, true, false, false);
    let dy = frustum[0][3] + frustum[1][3];
    let dx = frustum[2][3] + frustum[3][3];
    return dx / dy;
  }

  zoomToFit(aspect: number, accurate?: boolean, selectionOnly?: boolean, lights?: boolean) {
    if (!this.ds.root) {
      return;
    }
    mat4.normalizeOrthoMatrix(this.matrix, this.matrix);
    let frustum = [];
    let modelBox = this.ds.root.box;
    let cubeCenter = this.toLocal(modelBox.center);
    if (selectionOnly && this.ds.selection.items.length > 0) {
      let pivot = this.ds.selection.items[0];
      cubeCenter = this.toLocal(pivot.toGlobal(pivot.box.center));
    }

    if (this.perspective) {
      let halfy = glMatrix.toRadian(this.fovAngle) * 0.5;
      // make an angle a little smaller to make small margins around the screen
      if (selectionOnly) {
        halfy *= 0.85;
      } else {
        halfy *= 0.95;
      }
      let halfx = Math.atan(aspect * Math.tan(halfy));
      // top & bottom planes
      frustum.push(
        plane.createPN(
          cubeCenter,
          vec3.fromValues(0.0, -Math.cos(halfy), -Math.sin(halfy))
        )
      );
      frustum.push(
        plane.createPN(
          cubeCenter,
          vec3.fromValues(0.0, Math.cos(halfy), -Math.sin(halfy))
        )
      );
      // left and right planes
      frustum.push(
        plane.createPN(
          cubeCenter,
          vec3.fromValues(-Math.cos(halfx), 0.0, -Math.sin(halfx))
        )
      );
      frustum.push(
        plane.createPN(
          cubeCenter,
          vec3.fromValues(Math.cos(halfx), 0.0, -Math.sin(halfx))
        )
      );

      this.enlargeCameraFrustum(frustum, accurate, selectionOnly, lights);

      let horPos = vec3.create(),
        horNormal = vec3.create();
      let vertPos = vec3.create(),
        vertNormal = vec3.create();

      if (
        plane.planePlaneIntersect(frustum[0], frustum[1], horNormal, horPos) &&
        plane.planePlaneIntersect(frustum[2], frustum[3], vertNormal, vertPos)
      ) {
        // if min is vertPos.z then I need to recal horpos
        let zPos = Math.max(vertPos[2], horPos[2]);
        let cameraPos = vec3.fromValues(vertPos[0], horPos[1], zPos);
        cameraPos = this.toGlobal(cameraPos);
        this.translation = cameraPos;
      }
    } else {
      // top & bottom planes
      frustum.push(plane.createPN(cubeCenter, vec3.fromValues(0.0, 1.0, 0.0)));
      frustum.push(plane.createPN(cubeCenter, vec3.fromValues(0.0, -1.0, 0.0)));
      // left and right planes
      frustum.push(plane.createPN(cubeCenter, vec3.fromValues(1.0, 0.0, 0.0)));
      frustum.push(plane.createPN(cubeCenter, vec3.fromValues(-1.0, 0.0, 0.0)));

      this.enlargeCameraFrustum(frustum, accurate, selectionOnly, lights);
      let dy = frustum[0][3] + frustum[1][3];
      let dx = frustum[2][3] + frustum[3][3];
      let cameraY = (frustum[0][3] - frustum[1][3]) * 0.5;
      let cameraX = (frustum[2][3] - frustum[3][3]) * 0.5;
      if (dx > glMatrix.EPSILON && dy > glMatrix.EPSILON) {
        let scalex = aspect / dx;
        let scaley = 1.0 / dy;
        this.scale = Math.min(scalex, scaley) * 2.0;
        if (selectionOnly) {
          this.scale *= 0.75;
        } else {
          this.scale *= 0.9;
        }
      }
      let cameraPos = vec3.fromValues(-cameraX, -cameraY, 0.0);
      cameraPos = this.toGlobal(cameraPos);
      this.translation = cameraPos;
    }
    this.lastRotationCenter = undefined;
  }

  get viewPos() {
    return this.toGlobal(vec3.origin);
  }

  get viewDir() {
    return this.NtoGlobal(vec3.axis_z);
  }

  get rightDir() {
    return this.NtoGlobal(vec3.axisx);
  }

  get upDir() {
    return this.NtoGlobal(vec3.axisy);
  }

  get orthoViewDir() {
    let dir = this.NtoGlobal(vec3.axis_z);
    let maxCoord = vec3.maxCoord(dir);
    let result = vec3.create();
    result[maxCoord] = dir[maxCoord] > 0 ? 1 : -1;
    return result;
  }

  findRotationCenter() {
    if (this.mode === NavigationMode.Orbit) {
      if (!this.ds.box.inside(this.toGlobal(vec3.origin))) {
        return this.ds.box.center;
      }
      let ray = new EntityRay();
      // find center point on the screen to rotate about
      ray.pos = this.translation;
      ray.dir = this.NtoGlobal(vec3.axis_z);
      let zLimits = { near: 0, far: 1000 };
      this.calcZPlanes(zLimits);

      if (!this.perspective && zLimits.near < this.nearPlaneLimit) {
        vec3.scaleAndAdd(ray.pos, ray.pos, ray.dir, zLimits.near - 1);
        zLimits.far -= zLimits.near - 1.0;
        zLimits.near = this.nearPlaneLimit;
      }

      // we rotate around certain point only if model is close enough to us
      let box = this.ds.root.box.copy();
      box.enlarge(box.maxSize * 0.1);
      let cameraInside = box.inside(this.toGlobal(vec3.origin));
      if (
        (this.perspective && cameraInside) ||
        (!this.perspective && this.scale > 3 / this.ds.box.diagonal)
      ) {
        this.intersect(ray);
      }

      if (!ray.intersected) {
        if (this.perspective) {
          if (zLimits.near < 1.0) zLimits.near = 1.0;
          if (zLimits.far < zLimits.near) zLimits.far = zLimits.near;
        }
        ray.distance = (zLimits.near + zLimits.far) * 0.5;
        ray.intersected = true;
      } else {
        let backRay = new EntityRay();
        // find center point on the screen to rotate about
        backRay.pos = this.translation;
        backRay.dir = this.NtoGlobal(vec3.axisz);
        this.intersect(backRay);
        if (
          backRay.intersected &&
          backRay.distance > 1 &&
          // enable ortho navigation only if close enough
          backRay.distance < ray.distance * 3
        ) {
          ray.distance = 0;
        }
      }

      return ray.intersectPos;
    }
    return vec3.fcopy(this.translation);
  }
}

export class Selection {
  items = new Array<Entity>();
  private meshName?: number;
  // in LCS of pivot
  pos?: Float64Array;

  get pivot() {
    return this.items[this.items.length - 1];
  }

  get globalPos() {
    let pos = this.pos || vec3.fromValues(0, 0, 0);
    let last = this.items[this.items.length - 1];
    if (last) {
      pos = last.toGlobal(pos);
    }
    return pos;
  }

  get mesh() {
    if (this.meshName) {
      let pivot = this.pivot;
      if (pivot && pivot.meshes) {
        return pivot.meshes.find(m => m.name === this.meshName);
      }
    }
  }

  set mesh(value: Mesh) {
    this.meshName = value && value.name;
  }

  clear() {
    this.meshName = undefined;
    while (this.items.length > 0) {
      this.items[this.items.length - 1].selected = false;
    }
  }

  change = new EventEmitter<Entity>();

  changed(e: Entity) {
    this.change.emit(e);
  }
}

export interface SizeInfo {
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
  xe: boolean;
  ye: boolean;
  ze: boolean;
  position: pb.Elastic.Position;
  container: boolean;
}

export class DesignerOptions {
  collisions = true;
  navigator = false;
}

export class Designer {
  modelId: string;
  rootId?: string;
  fileToken?: string;
  root: Entity;
  camera: Camera;
  temp: Entity; // temp area for action objects
  entityMap: { [key: string]: Entity } = {};
  selection = new Selection();
  options = new DesignerOptions();
  dragTarget: Entity;
  private _layers: Layer[] = [];
  private updateLayers = false;

  get selectedItems() {
    return this.selection.items;
  }

  private _readOnly = true;
  private _editable = false;

  constructor(public canvas?: HTMLCanvasElement) {
    this.camera = new Camera(this);
    this.temp = new Entity(this);
    if (typeof document === 'object') {
      this._editor = <HTMLInputElement>document.getElementById('canvas3d-input');
    }
    this.root = new Entity(this);
    this.root.uid = new Long(0);
  }

  destroy() {
    this.canvas = undefined;
    if (this.root) {
      this.root.delete();
    }
  }

  get readOnly() {
    return this._readOnly;
  }

  get editable() {
    return this._editable;
  }

  get pixelRatio() {
    return 1;
  }

  set editable(value: boolean) {
    this._editable = value;
    this._readOnly = !value;
  }

  get hasSelection() {
    return this.selection.items.length > 0;
  }

  get layers() {
    if (this.updateLayers) {
      if (this.root) {
        this.root.forAll(e => {
          if (e.layer) {
            e.layer.used = true;
          }
        });
      }
      this._layers = this._layers.filter(l => l.used);
      this.updateLayers = false;
    }
    return this._layers;
  }

  findOrCreateLayer(name: string) {
    let layer = this._layers.find(l => l.name === name);
    if (!layer) {
      layer = new Layer(this, name);
      this._layers.push(layer);
    }
    return layer;
  }

  tryRemoveLayer(layer: Layer) {
    layer.used = false;
    this.updateLayers = true;
  }

  get selected(): Entity | undefined {
    if (this.selection.items.length === 1) {
      return this.selection.items[0];
    }
  }

  set selected(e: Entity | undefined) {
    let items = this.selection.items;
    for (let k = items.length - 1; k >= 0; k--) {
      if (items[k] !== e) {
        items[k].selected = false;
      }
    }
    if (e) {
      e.selected = true;
    }
  }

  private _editor: HTMLInputElement;

  get box() {
    return this.root ? this.root.box : new Box();
  }

  // overriden in modeler to return matrix corrected with animation
  get transformMatrix() {
    return this.camera.transformMatrix();
  }

  get windowTransform() {
    let transform = mat4.createIdentity();
    let temp = mat4.create();
    mat4.multiply(
      transform,
      transform,
      mat4.fromTranslation(temp, [-0.5, -0.5, 0])
    );
    let width = 1000;
    let height = 1000;
    if (this.canvas) {
      width = this.canvas.clientWidth;
      height = this.canvas.clientHeight;
    }
    mat4.multiply(
      transform,
      transform,
      mat4.fromScaling(temp, [width * 0.5, -height * 0.5, 1.0])
    );
    mat4.multiply(transform, transform, mat4.fromTranslation(temp, [1, -1, 0]));
    mat4.multiply(transform, transform, this.camera.transformMatrix());
    return transform;
  }

  toScreen(pos) {
    let screenPos = vec3.transformMat4(
      vec3.create(),
      pos,
      this.windowTransform
    );
    if (screenPos[2] > -1 && screenPos[2] < 1) {
      return new geom.Vector(screenPos[0], screenPos[1]);
    }
  }

  onScreen(pos) {
    let point = this.toScreen(pos);
    if (point) {
      return (point.x > 0 && point.x < this.canvas.width && point.y > 0 && point.y < this.canvas.height);
    }
  }

  unitsInPixel(pos?: Float64Array) {
    let transform = this.windowTransform;
    let p1 = pos || this.box.center;
    let p2 = vec3.fadd(p1, this.camera.upDir);
    vec3.transformMat4(p1, p1, transform);
    vec3.transformMat4(p2, p2, transform);
    return 1 / vec3.distance(p1, p2);
  }

  // virtual method
  invalidate() {}
  // virtual method
  modelChanged() {}
  escape() {}
  // virtual method
  animateCamera() {}
  animateEntity(e: Entity, newPos?: number) {}
  updateAnimation(e: Entity) {}
  handleNavigator(x: number, y: number, orient: boolean) {
    return false;
  }
  enlargeFrustum(frustum, selectionOnly?: boolean) {

  }
  snack(message: string, action?: string, duration?: number): Observable<void> {
    return new EventEmitter<void>();
  }
  // overrided in modeler to take into account animated objects
  intersect(ray: EntityRay) {
    return this.root.intersect(ray);
  }

  floatToStr(value: number) {
    let digits = 1;
    return (Math.round(value * digits) / digits).toString();
  }

  lengthToStr(value: number) {
    return `${this.floatToStr(value)} mm`;
  }

  startEditor(
    left: number,
    top: number,
    value: number,
    apply: (number) => any
  ) {
    this.updateEditor(left, top, value);
    this._editor.style.visibility = 'visible';
    this._editor.value = this.floatToStr(value);
    this._editor.focus();
    this._editor.select();
    this._editor.onkeydown = event => {
      if (event.keyCode === 27) this.escape();
    };
    this._editor.onchange = _ => {
      let value = MathCalculator.calculateRange(this._editor.value);
      if (value !== undefined) {
        apply(value);
      }
      this.hideEditor();
    };
  }

  updateEditor(left: number, top: number, value: number) {
    left = left;
    top = top;
    this._editor.style.left = left - this._editor.clientWidth * 0.5 + 'px';
    this._editor.style.top = top - this._editor.clientHeight * 0.5 + 'px';
    this._editor.value = this.floatToStr(value);
    this._editor.select();
  }

  hideEditor() {
    if (this._editor) {
      this._editor.style.visibility = 'hidden';
    }
  }

  get editorActive() {
    return this._editor && this._editor.style.visibility === 'visible';
  }

  // virtual method
  execute(action, sync?: boolean): Promise<any> {
    return undefined;
  }

  static normalizeBuilderItem(item: BuilderApplyItem) {
    if (item.uid instanceof Entity) {
      item.uid = item.uid.uidStr;
    }
    if (item.parent instanceof Entity) {
      item.parent = item.parent.uidStr;
    }
    if (item.matrix) {
      item.matrix = Array.prototype.slice.call(item.matrix);
    }
    if (item.insert && item.insert.matrix) {
      item.insert.matrix = Array.prototype.slice.call(item.insert.matrix);
    }
    if (item.mesh) {
      if (item.mesh.transform) {
        item.mesh.transform = Array.prototype.slice.call(item.mesh.transform);
      }
    }
    if (item.children) {
      for (let child of item.children) {
        this.normalizeBuilderItem(child);
      }
    }
    return item;
  }

  static normalizeBuilderItems(items: BuilderApplyItem[]) {
    for (let item of items) {
      Designer.normalizeBuilderItem(item);
    }
    return items;
  }

  apply(name: string, item: BuilderApplyItem, sync?: boolean, undo?: UndoMode) {
    Designer.normalizeBuilderItem(item);
    return this.execute({
      type: 'apply',
      name, undo, items: [item]
    }, sync);
  }

  applyBatch(name: string, items: BuilderApplyItem[], sync?: boolean, undo?: UndoMode,
      flush?: string | string[]) {
    Designer.normalizeBuilderItems(items);
    return this.execute({type: 'apply', name, undo, items, flushModelId: flush}, sync);
  }

  applyToSelection(name: string, f: (e: Entity) => BuilderApplyInfo, sync?: boolean) {
    let items = this.selectedItems.map(e => ({uid: e, ...f(e)}));
    return this.applyBatch(name, items, sync);
  }

  getter(value: ModelGetValue, arg: any, uid: Entity | string, recursive?: boolean) {
    if (uid instanceof Entity) {
      uid = uid.uidStr;
    }
    return this.execute({
      type: 'get',
      value,
      arg,
      uid,
      recursive
    });
  }

  batchGetter(values: ModelValueRequest[]) {
    for (let value of values) {
      if (value.uid instanceof Entity) {
        value.uid = value.uid.uidStr;
      }
    }
    return this.execute({ type: 'get', values }) as Promise<any[]>;
  }

  executeActionOnSelection(
    type: string,
    name: string,
    getData?: (Entity) => any,
    action?: any
  ): Promise<any> {
    return undefined;
  }

  zoomToFit(selection?: boolean, lights = true) {
    if (this.canvas && this.canvas.width > 0 && this.canvas.height > 0 && this.root) {
      let aspect = this.canvas.width / this.canvas.height;
      let oldPos = vec3.fcopy(this.camera.translation);
      let oldScale = this.camera.scale;
      let useSelection = selection && this.selection.items.length > 0;
      this.camera.zoomToFit(aspect, true, useSelection, useSelection || lights);
      if (
        vec3.equals(oldPos, this.camera.translation) &&
        glMatrix.equalsd(oldScale, this.camera.scale) &&
        useSelection
      ) {
        this.camera.zoomToFit(aspect, true, false, false);
      }
      this.invalidate();
    }
  }

}
