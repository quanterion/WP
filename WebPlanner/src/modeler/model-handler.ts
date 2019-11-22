import { WebDesigner } from "./webdesigner";
import { NavigationMode, Entity, ElasticParam, ElasticParamView, BuilderApplyItem } from "./designer";
import { vec3, eps } from "./geometry";
import { RenderMode } from "./render/render-scene";
import { pb } from "./pb/scene";
import { roundFloat } from "app/shared";
import { Observable, forkJoin, from, of } from "rxjs";
import { Property, ModelProperties, ParameterType, PropertyVariant } from "./model-properties";
import { map, concatMap, tap } from "rxjs/operators";

interface FileInsert {
  id: number;
  name: string;
  sku?: string;
}

export class EntityModelProperties extends ModelProperties {
  constructor(public e: Entity) {
    super();
  }
}

export class EntityProperty extends Property {
  constructor(source: Property) {
    super();
    this.id = source.id;
    this.catalogId = source.catalogId;
    this.name = source.name;
    this.params = source.params;
    this.variants = source.variants;
    this.value = source.value;
  }
  elements: {e: Entity, value: number}[] = [];

  findMaterial(variant?: PropertyVariant) {
    let index = 0;
    if (!variant) {
      variant = this.find(this.value);
      if (!variant) {
        return;
      }
    }
    for (let param of this.params) {
      if (param.type === ParameterType.Material) {
        return `${this.catalogId}\n${variant.values[index]}`;
      }
      index++;
    }
  }
}

export class ModelHandler {
  constructor(public ds: WebDesigner) {

  }

  orthoCamera() {
    this.ds.camera.mode = NavigationMode.Ortho;
    this.ds.camera.orient(vec3.axisy, vec3.axis_z);
    this.ds.zoomToFit();
    this.ds.render.mode = RenderMode.HiddenEdgesVisible;
  }

  orbitCamera(defaultOrientation = false) {
    let perspective = this.ds.camera.perspective;
    this.ds.camera.mode = NavigationMode.Orbit;
    if (perspective && !defaultOrientation) return;
    let viewDir = vec3.fromValues(0.6, 0.5, 0.6);
    let upDir = vec3.cross(vec3.create(), viewDir, vec3.axisy);
    upDir = vec3.cross(vec3.create(), upDir, viewDir);
    vec3.normalize(viewDir, viewDir);
    vec3.normalize(upDir, upDir);
    this.ds.camera.orient(viewDir, upDir);
    this.ds.zoomToFit();
    this.ds.render.mode = RenderMode.Shaded;
  }

  walkCamera() {
    let perspective = this.ds.camera.perspective;
    this.ds.camera.mode = NavigationMode.Walk;
    if (perspective) return;
    let viewDir = vec3.fromValues(0.6, 0.3, 0.6);
    let upDir = vec3.cross(vec3.create(), viewDir, vec3.axisy);
    upDir = vec3.cross(vec3.create(), upDir, viewDir);
    vec3.normalize(viewDir, viewDir);
    vec3.normalize(upDir, upDir);
    this.ds.camera.orient(viewDir, upDir);
    this.ds.zoomToFit();
    this.ds.render.mode = RenderMode.Shaded;
  }

  modelStatistics() {
    let objCount = 0;
    let meshCount = 0;
    let triCount = 0;
    let selTriCount = 0;
    this.ds.root.forAll(e => {
      objCount++;
      let selected = e.isSelected;
      if (e.meshes) {
        for (let mesh of e.meshes) {
          meshCount++;
          let count = Math.round(mesh.indices.length / 3);
          triCount += count;
          if (selected) {
            selTriCount += count;
          }
        }
      }
    });
    return {
      objCount,
      meshCount,
      triCount,
      selTriCount,
      webgl: !!window['WebGLRenderingContext'],
      webgl2: !!window['WebGLRenderingContext']
    }
  };

  replaceModel(src: Entity, dest: FileInsert) {
    return this.replaceModels([src], dest);
  }

  replaceModels(srcs: Entity[], dest: FileInsert) {
    let changes: BuilderApplyItem[] = srcs.map(e => ({
      uid: e,
      replace: {
        insertModelId: dest.id.toString(),
        modelName: dest.name,
        sku: dest.sku
      }
    }));
    return this.ds.applyBatch('Replace models', changes,
      undefined, undefined, dest.id.toString());
  }

  animateAll(root?: Entity, pos?: number) {
    let ok = false;
    root = root || this.ds.root;
    root.forAll(e => {
      if (e.anim) {
        if (pos === undefined) {
          pos = e.animPos ? 0 : 1;
        }
        this.ds.render.animateEntity(e, pos);
        ok = true;
      }
    });
    return ok;
  }

  static gatherModelProperties(items: Entity[], loader: (id: number) => Observable<Property>, propertyId?: number) {
    let entities: Entity[] = [];
    if (propertyId === null) {
      entities = items;
    } else {
      for (let item of items) {
        item.forAll(e => {
          if (e.data.propInfo) {
            if (propertyId) {
              if (ModelProperties.containsProperty(e.data, propertyId)) {
                entities.push(e);
              }
            } else {
              entities.push(e);
            }
          }
        });
      }
    }
    let toModelProperties = e => new EntityModelProperties(e).load(e.data, loader);
    if (entities.length < 1) {
      return of([] as EntityModelProperties[]);
    }
    return forkJoin(entities.map(toModelProperties));
  }

  static gatherProperties(items: Entity[], loader: (id: number) => Observable<Property>) {
    let modelProps = this.gatherModelProperties(items, loader);
    return modelProps.pipe(map(list => {
      let props: EntityProperty[] = [];
      for (let mp of list) {
        for (let prop of mp.props) {
          let newProp = props.find(p => p.id === prop.id);
          if (newProp) {
            if (prop.value !== newProp.value) {
              newProp.value = undefined;
            }
          } else {
            newProp = new EntityProperty(prop);
            props.push(newProp);
          }
          newProp.elements.push({e: mp.e, value: prop.value});
        }
      }
      return props;
    }));
  }

  static gatherMaterialsFromProperties(properties: EntityProperty[], first = true) {
    let materials = new Set<string>();
    for (let property of properties) {
      let paramIndex = 0;
      for (let param of property.params) {
        if (param.type === ParameterType.Material) {
          for (let variant of property.variants) {
            materials.add(`${property.catalogId}\n${variant.values[paramIndex]}`);
          }
          if (first) {
            break;
          }
        }
        paramIndex++;
      }
    }
    return Array.from(materials);
  }

  static editProperties(ds: WebDesigner, items: Entity[], loader: (id: number) => Observable<Property>,
      propertyId: number, editor: (mp: EntityModelProperties) => void | false, name = 'Edit properties') {
    let modelProps = this.gatherModelProperties(items, loader, propertyId);
    return modelProps.pipe(
      tap(list => list.filter(mp => editor(mp) !== false)),
      map(list => list.map(mp => {
        let apply = mp.save();
        return {uid: mp.e, ...apply};
      })),
      concatMap(changes => from(ds.applyBatch(name, changes)))
    );
  }

  static applyProperty(ds: WebDesigner, propertyId: number, valueId: number, items: Entity[],
      loader: (id: number) => Observable<Property>) {
    return this.editProperties(ds, items, loader, propertyId, mp => {
      let prop = mp.props.find(p => p.id === propertyId);
      if (prop.value === valueId) {
        return false;
      }
      prop.value = valueId;
    });

  }

  static removeProperty(ds: WebDesigner, propertyId: number, items: Entity[], loader: (id: number) => Observable<Property>) {
    return this.editProperties(ds, items, loader, propertyId, mp => {
      mp.props = mp.props.filter(p => p.id !== propertyId);
    });
  }

  static addProperty(ds: WebDesigner, property: Property, items: Entity[], loader: (id: number) => Observable<Property>) {
    return this.editProperties(ds, items, loader, null, mp => {
      mp.addProperty(property);
    });
  }

  static getParamVariants(param: ElasticParam) {
    if (!param.variants) {
      return;
    }
    let list = param.variants.split('\n').map(s => s.trim()).filter(s => s);
    if (list.length < 2) {
      list = param.variants.split(';').map(s => s.trim()).filter(s => s);
    }
    return list.map(s => {
      let index = s.indexOf(' - ');
      if (index > 0) {
        return {
          name: s.substr(index + 3),
          value: roundFloat(Number(s.substr(0, index)))
        }
      } else {
        return {
          name: s,
          value: roundFloat(Number(s))
        }
      }
    }).filter(v => !Number.isNaN(v.value));
  }

  static gatherParams(items: Entity[]) {
    let params: ElasticParamView[] = [];
    for (let item of items) {
      item.forAll(e => {
        if (e.elastic && e.elastic.params) {
          for (let param of e.elastic.params) {
            let entry = params.find(p => p.name === param.name);
            if (entry) {
              if (entry.size && Math.abs(entry.size - param.size) > eps) {
                entry.size = null;
              }
            } else {
              entry = {
                name: param.name,
                description: param.description,
                size: param.size,
                entitites: [],
                flags: param.flags,
                control: param.variants === '@checkbox' ? 'checkbox' : undefined,
                variants: this.getParamVariants(param)
              }
              entry.size = roundFloat(entry.size);
              params.push(entry);
            }
            entry.entitites.push(e);
          }
        }
      });
    }
    return params;
  }

  getElasticAxis(item: Entity) {
    if (item.elastic) {
      const Pos = pb.Elastic.Position;
      switch (item.elastic.position) {
        case Pos.Left:
        case Pos.Right:
        case Pos.Vertical:
        case Pos.VSplitter:
          return 0;
        case Pos.Back:
        case Pos.Front:
        case Pos.Front:
        case Pos.FSplitter:
          return 2;
      }
    }
    return 1;
  }
}
