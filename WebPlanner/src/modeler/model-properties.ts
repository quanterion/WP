import { Observable } from 'rxjs';
import { MathCalculator } from './math-calculator';
import { of, forkJoin } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { CatalogProperty } from 'app/shared/catalog.service';
import { EntityData, BuilderApplyInfo } from './designer';
import { pb } from './pb/scene';

// how Entity is shown in specification
export enum ElementBill {
  Default,
  Article,
  Disabled
}

export interface ElementInfo {
  id?: string;
  rev?: number;
  sku?: string;
  bill?: ElementBill;
  price?: number;
  description?: string;
  offers?: number[];
}

export enum ParameterType {
  Unknown,
  Material,
  Element,
  Width,
  Height,
  Depth,
  SKU,
  Price,
  Parameter,
  Position
}

export class Parameter {
  constructor(public type: ParameterType, public value: string | number) {}

  toJson() {
    return {
      type: this.type,
      value: this.value
    };
  }

  static fromJson(json) {
    return new Parameter(json.type, json.value);
  }
}

export class PropertyVariant {
  constructor(name: string) {
    this.name = name;
  }
  id = Math.round(Math.random() * 1000000);
  name: string;
  values: (string | number)[] = [];
  disabled = false;

  toJson() {
    let obj: any = {
      id: this.id,
      name: this.name,
      values: this.values
    };
    if (this.disabled) {
      obj.disabled = true;
    }
    return obj;
  }

  static fromJson(json) {
    let result = new PropertyVariant(json.name);
    result.id = Number(json.id || result.id);
    result.values = json.values || [];
    result.disabled = !!json.disabled;
    if (json.params) {
      result.values = json.params.map(p => p.value);
    }
    return result;
  }
}

// property switch one or set of parameters
export class Property {
  id: number;
  catalogId: number;
  name: string;
  description?: string;
  params: Parameter[] = [];
  variants: PropertyVariant[] = [];
  // variantId
  value = 0;

  valueName(value?: number) {
    let variant = this.find(value || this.value);
    return variant && variant.name;
  }

  addParameter(type: ParameterType, value: string | number, variantValue?: string | number) {
    let param = new Parameter(type, value);
    this.params.push(param);
    variantValue = variantValue || value;
    for (let variant of this.variants) {
      variant.values.push(variantValue);
    }
    return param;
  }

  deleteParameter(index: number) {
    this.params.splice(index, 1);
    for (let variant of this.variants) {
      variant.values.splice(index, 1);
    }
  }

  addVariant(name: string) {
    let variant = new PropertyVariant(name);
    if (this.variants.length > 0) {
      let last = this.variants[this.variants.length - 1];
      variant.values = [...last.values];
    }
    if (this.params.length === 1) {
      let param = this.params[0];
      let pt = ParameterType;
      if (param.type === pt.Width || param.type === pt.Height || param.type === pt.Depth || param.type === pt.Parameter) {
        let value = parseFloat(name);
        if (value > 0 && value < MathCalculator.MAX_RANGE) {
          variant.values[0] = value;
        }
      }
    }
    this.variants.push(variant);
    return variant;
  }

  find(variantId: number) {
    for (let variant of this.variants) {
      if (variant.id === variantId) {
        return variant;
      }
    }
  }

  toJson() {
    return {
      params: this.params.map(p => p.toJson()),
      variants: this.variants.map(v => v.toJson())
    };
  }

  loadFrom(json) {
    this.params = (json.params || [])
      .map(data => Parameter.fromJson(data));
    this.variants = (json.variants || [])
      .map(data => PropertyVariant.fromJson(data));
    // migrate old property format
    if (this.params.length === 0 && json.variants && json.variants[0]) {
      this.params = (json.variants[0].params || [])
        .map(data => Parameter.fromJson(data));
    }
    return this;
  }

  static fromJson(json) {
    return new Property().loadFrom(json);
  }

  static fromProperty(prop?: CatalogProperty) {
    if (!prop) {
      return undefined;
    }
    try {
      let newProp = prop.data ? Property.fromJson(JSON.parse(prop.data)) : new Property();
      newProp.id = prop.id;
      newProp.catalogId = prop.catalogId;
      newProp.name = prop.name;
      return newProp;
    } catch {
      return undefined;
    }
  }
}

type ReplacementTable = { old: string; new: string }[];

export interface EntityPropertyInfo {
  props?: [number, number][];
  materials: ReplacementTable;
  size?: any;
  sku?: string;
  price?: number;
  position?: pb.Elastic.Position;
  revision: number;
}

export class ModelProperties {
  // maps catalog properties to its values
  props: Property[] = [];
  // maps
  materials: ReplacementTable = [];
  size: {[size: string]: number} = {};
  sku?: string;
  price = 0;
  position?: pb.Elastic.Position;
  revision = 0;

  hasProperty(id: number) {
    return this.props.some(p => p.id === id);
  }

  addProperty(prop: Property) {
    let oldProp = this.props.find(p => p.id === prop.id);
    if (oldProp) {
      oldProp.variants = prop.variants;
      if (!oldProp.variants.some(v => v.id === oldProp.value)) {
        oldProp.value = oldProp.variants[0].id;
      }
    } else {
      prop.value = prop.variants[0].id;
      this.props.push(prop);
    }
  }

  private updateParams() {
    this.revision++;
    this.materials = [];
    let size: {[size: string]: number} = {};
    this.price = 0;
    this.sku = undefined;
    this.position = undefined;
    let resize = false;
    for (let property of this.props) {
      if (property && property.variants.length > 1) {
        let variant = property.find(property.value);
        if (!variant) {
          continue;
        }
        for (let i = 0; i < property.params.length; i++) {
          let param = property.params[i];
          let value = variant.values[i];
          if (param.type === ParameterType.Material) {
            let pair = {
              old: property.params[i].value as string,
              new: value as string
            };
            if (pair.old !== pair.new) {
              this.materials.push(pair);
            }
          } else if (param.type === ParameterType.Width) {
            size['#width'] = Number(value);
            resize = true;
          } else if (param.type === ParameterType.Height) {
            size['#height'] = Number(value);
            resize = true;
          } else if (param.type === ParameterType.Depth) {
            size['#depth'] = Number(value);
            resize = true;
          } else if (param.type === ParameterType.SKU) {
            this.sku = value.toString()
          } else if (param.type === ParameterType.Price) {
            this.price += Number(value);
          } else if (param.type === ParameterType.Position) {
            this.position = Number(value);
          } else if (param.type === ParameterType.Parameter) {
            size[param.value] = Number(value);
            resize = true;
          }
        }
      }
    }
    if (resize) {
      this.size = size;
    }
  }

  load(
    data: { propInfo?: EntityPropertyInfo},
    loader: (id: number) => Observable<Property>
  ) {
    if (data && data.propInfo) {
      let info = data.propInfo;
      let props: any[] = info.props || [];
      this.materials = info.materials || [];
      this.revision = info.revision || 0;
      this.size = info.size || {};
      this.sku = info.sku;
      this.price = info.price;
      this.position = info.position;

      if (props.length === 0) {
        this.props = [];
        return of(this);
      }
      const queue = of(props);
      const propLoader = (propInfo: any[]) => {
        return loader(propInfo[0]).pipe(map(prop => {
          if (prop) {
            prop.variants = prop.variants.filter(v => !v.disabled);
            prop.value = propInfo[1];
          }
          return prop;
        }));
      };
      const result = queue.pipe(concatMap(q => forkJoin(...q.map(propLoader))));
      return result.pipe(map(propList => {
        this.props = propList.filter(v => !!v);
        return this;
      }));
    } else {
      return of(this);
    }
  }

  save() {
    this.updateParams();
    let result: BuilderApplyInfo = { data: { propInfo: null, merge: true } };
    if (this.props.length > 0) {
      let propInfo: EntityPropertyInfo = {
        props: this.props.map(p => [p.id, p.value] as [number, number]),
        materials: this.materials,
        size: this.size,
        sku: this.sku,
        price: this.price,
        revision: this.revision
      };
      result.data.propInfo = propInfo;
      if (this.sku) {
        result.data.model = {sku: this.sku};
      }
      if (this.size) {
        result.size = this.size;
      }
      if (this.position || this.position === 0) {
        result.elastic = {position: this.position};
      }
    }
    return result;
  }

  static containsProperty(data: EntityData, propId: number) {
    if (data.propInfo && data.propInfo.props) {
      let propInfo = data.propInfo as EntityPropertyInfo;
      return propInfo.props.some(p => p[0] === propId);
    }
    return false;
  }

  public clear() {
    this.props = [];
    this.materials = [];
  }
}
