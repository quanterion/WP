import { Entity, ModelGetValue, ModelValueRequest } from 'modeler/designer';
import { FilesService, FileItem } from '../shared/files.service';
import { MaterialUnit, CatalogMaterial, CatalogService } from '../shared/catalog.service';
import * as pako from 'pako';
import { of, from } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { roundFloat } from '../shared/units.service';
import { ElementBill, Property } from 'modeler/model-properties';
import { Injectable, EventEmitter } from '@angular/core';
import { SystemService } from 'app/shared/system.service';
import { MaterialMapper, isMaterialUsed } from 'modeler/material-utils';

interface PriceResponse {
  products: [{ sku: string, price: string}];
}

export interface PriceListInfo {
  id: number;
  ownerId: number;
  shared?: string;
  name: string;
  data: string;
  externalId: string;
}

export class PriceList {
  id: number;
  ownerId: number;
  shared?: string;
  name: string;
  externalId: string;
  items: { [sku: string]: number };

  constructor(src?: PriceListInfo) {
    if (src) {
      this.id = src.id;
      this.name = src.name;
      this.ownerId = src.ownerId;
      this.shared = src.shared;
      this.externalId = this.externalId;
      this.loadItems(src.data);
    }
  }

  get itemCount() {
    let count = 0;
    for (let _ in this.items) {
      ++count;
    }
    return count;
  }

  loadItems(base64?: string) {
    this.items = {};
    if (base64) {
      let data = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
      let json = pako.inflate(data, { to: 'string' }).toString();
      this.items = JSON.parse(json);
    }
  }

  saveItems() {
    return btoa(pako.deflate(JSON.stringify(this.items), { to: 'string' }));
  }

  clear() {
    this.items = {};
  }

  importXml(xml: string) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(xml, 'text/xml');
    let root = doc.getElementsByTagName('city');
    if (root.length < 1) {
      root = doc.getElementsByTagName('Articles');
    }
    if (root.length < 1) {
      return 0;
    }
    this.clear();
    let source = root[0];
    let count = 0;
    for (let i = 0; i < source.children.length; ++i) {
      let record = source.children[i];
      let sku = record.getElementsByTagName('sku')[0].textContent;
      let price = record.getElementsByTagName('price')[0].textContent;
      if (sku && price) {
        this.items[sku] = Number(price);
        ++count;
      }
    }
    return count;
  }

  importCsv(source: string) {
    let count = 0;
    let strings = source.split('\n');
    if (strings.length < 1) {
      return 0;
    }
    this.clear();
    for (let info of strings) {
      let parts = info.split(';');
      if (parts.length === 2) {
        let sku = parts[0].trim();
        let price = parts[1].trim();
        if (sku && price) {
          this.items[sku] = Number(price);
          count++;
        }
      }
    }
    return count;
  }
}

export class PriceElement {
  constructor(e?: Entity, public parent?: PriceElement) {
    if (e) {
      this.name = e.name;
      this.entities.push(e);
      this.count = 1;
      if (e.data.model) {
        this.modelId = Number(e.data.model.id || 0);
        this.sku = e.data.model.sku;
        this.price = e.data.model.price || 0;
        this.description = e.data.model.description;
        if (e.data.model.bill === ElementBill.Disabled) {
          this.enabled = false;
        }
      }
      if (e.data.propInfo) {
        this.props = e.data.propInfo.props || [];
        this.price = this.price + (e.data.propInfo.price || 0);
      }
      this.catalogId = e.catalog;
    }
  }

  modelId?: number;
  materialId?: number;
  catalogId = 0;
  name: string;
  sku: string;
  price = 0;
  unit = MaterialUnit.Units;
  count = 0;
  entities: Entity[] = [];
  elements: PriceElement[] = [];
  // element is shown in model list
  enabled = true;
  // propId and variantId
  props: [number, number][] = [];
  description?: string;
  index = 0;

  clone() {
    let result = new PriceElement();
    return Object.assign(result, this);
  }

  newElement(name?: string, sku?: string, price= 0) {
    let element = new PriceElement(undefined, this);
    element.name = name;
    element.sku = sku;
    element.price = price;
    this.elements.push(element);
  }

  addElement(element: PriceElement) {
    let old = this.elements.find(e => e.same(element));
    if (old) {
      old.entities.push(...element.entities);
      old.count += element.count;
    } else {
      this.elements.push(element);
    }
  }

  get fullPrice() {
    let result = this.price;
    this.elements.forEach(e => result += e.cost);
    return roundFloat(result, 2);
  }

  get cost() {
    return roundFloat(this.fullPrice * this.count, 2);
  }

  get unitName() {
    return MaterialUnit[this.unit];
  }

  set unitName(value) {
    this.unit = MaterialUnit[value];
  }

  toJson() {
    return {
      name: this.name,
      sku: this.sku,
      description: this.description,
      price: this.price,
      count: this.count,
      elements: this.elements.map(e => e.toJson()),
      entities: this.entities.map(e => e.uidStr),
      cost: this.cost
    };
  }

  same(other: PriceElement) {
    if (other.name !== this.name || other.sku !== this.sku || other.catalogId !== this.catalogId) {
      return false;
    }
    if (this.props.length !== other.props.length) {
      return false;
    }
    if (this.props.some((value, index) =>
        value[0] !== other.props[index][0] || value[1] !== other.props[index][1])) {
      return false;
    }
    if (this.elements.length !== other.elements.length) {
      return false;
    }
    let notExists = e1 => !other.elements.some(e2 => e1.same(e2) && e2.count === e1.count);
    return !this.elements.some(notExists);
  }

  contains(e: Entity) {
    return this.entities.includes(e) ||
     this.elements.some(elem => elem.contains(e));
  }

  forAll(fun: (e: PriceElement) => void) {
    fun(this);
    this.elements.forEach(fun);
  }
}

@Injectable()
export class EstimateService {
  models: PriceElement[] = [];
  priceList: PriceList;
  priceUrl?: string;
  priceUrlParams: any = {};
  showPrices = true;
  computed$ = new EventEmitter<void>();

  constructor(private system: SystemService, private files: FilesService, private catalogs: CatalogService) {
  }

  gatherElements(zeroPrice = true) {
    let result: PriceElement[] = [];
    for (let model of this.models) {
      if (!zeroPrice && model.fullPrice <= 0) {
        continue;
      }
      result.push(model);
      let index = 1;
      for (let element of model.elements) {
        if (element.enabled) {
          element.index = index++;
          result.push(element);
        }
      }
    }
    return result;
  }

  findElement(e: Entity) {
    for (let model of this.models) {
      if (model.entities.includes(e)) {
        return model;
      }
      for (let element of model.elements) {
        if (element.entities.includes(e)) {
          return element;
        }
      }
    }
  }

  contains(e: Entity) {
    for (let model of this.models) {
      if (model.contains(e)) {
        return true;
      }
    }
    return false;
  }

  private fileCache = new Map<number, FileItem>();
  private priceCache = new Map<number, number>();

  missingModels: Entity[] = [];

  get price() {
    let value = 0;
    for (let model of this.models) {
      value += model.cost;
    }
    return roundFloat(value, 2);
  }

  get count() {
    let value = 0;
    for (let model of this.models) {
      value += model.unit === MaterialUnit.Units ? model.count : 1;
    }
    return value;
  }

  static isPriceElement(e: Entity) {
    let m = e.data.model;
    return (m && m.bill !== ElementBill.Disabled && (m.id || m.sku || m.price)) || e.data.propInfo;
  }

  private addModel(list: PriceElement[], e: Entity, materials?: CatalogMaterial[]) {
    let model = new PriceElement(e);
    if (e.data.propInfo) {
      model.props = e.data.propInfo.props || [];
    }

    if (materials) {
      let mapper = new MaterialMapper(e);
      for (let mat of materials) {
        if (mat.unit && (mat.sku || (mat.price > 0))) {
          let digits = 2;
          if (mat.unit === MaterialUnit.SquareMeters) {
            digits = 4;
          }
          if (mat.unit === MaterialUnit.CubicMeters) {
            digits = 6;
          }
          let count = roundFloat(this.computeVolume(e, mat, mapper), digits);
          if (count > 0) {
            let material = new PriceElement(undefined, model);
            material.materialId = mat.id;
            material.catalogId = mat.catalogId;
            material.name = mat.name;
            material.price = mat.price;
            material.unit = mat.unit;
            material.sku = mat.sku;
            material.count = count;
            if (this.alterPriceElement) {
              material = this.alterPriceElement(material, undefined);
            }
            if (material) {
              model.elements.push(material);
            }
          }
        }
      }
    }

    e.forEach(echild => {
      if (EstimateService.isPriceElement(echild)) {
        let bill = echild.data.model && echild.data.model.bill;
        if (bill === ElementBill.Article) {
          this.addModel(list, echild, materials);
        } else {
          let element = new PriceElement(echild, model);
          if (this.alterPriceElement) {
            element = this.alterPriceElement(element, echild);
          }
          if (element) {
            model.addElement(element);
          }
        }
      }
    });

    if (this.alterPriceElement) {
      model = this.alterPriceElement(model, e);
    }

    if (model) {
      let same = list.find(m => m.same(model));
      if (same) {
        same.entities.push(...model.entities);
        same.count += 1;
      } else {
        list.push(model);
      }
    }
    return model;
  }

  compute(root: Entity, materials?: CatalogMaterial[], file?: FileItem) {
    this.missingModels = [];
    let list: PriceElement[] = [];
    root.forAll(e => {
      let root = file && !e.parent;
      if (EstimateService.isPriceElement(e) || root) {
        let model = this.addModel(list, e, materials);
        if (root) {
          model.modelId = file.id;
          model.name = file.name;
          model.price = file.price || model.price;
          model.sku = file.sku || model.sku;
          if (list[0] !== model) {
            list = [model, ...list.filter(m => m !== model)];
          }
        }
        return false;
      }
    });
    return this.fillPrice(list).pipe(
      concatMap(models => this.fillPropertyInfo(models)),
      concatMap(models => this.computeMaterialInfo(models)),
      concatMap(models => {
        let next$ = of(models);
        if (this.alterEstimate) {
          let result = this.alterEstimate(models);
          if (result && result.then) {
            next$ = from(result);
          }
        }
        return next$.pipe(map(r => r || models));
      }),
      map(models => {
        this.models = models.filter(m => {
          m.elements = m.elements.filter(e => e.sku || e.cost);
          return m.sku || m.cost || (file && file.id === m.modelId);
        })
        this.computed$.next();
        return this.models;
      })
    );
  }

  private computeVolume(root: Entity, material: CatalogMaterial, mapper: MaterialMapper) {
    let volume = 0;
    mapper.push(root);
    if (root.meshes) {
      let materialUsed = isMaterialUsed(root, material.name, mapper);
      if (materialUsed) {
        let box = root.contentBox;
        switch (material.unit) {
          case MaterialUnit.Units:
            volume += 1;
            break;
          case MaterialUnit.Meters:
            // actual value will be computed by Builder
            // but we need to provide a good approximation
            // because this value will be used to check if elements are the same
            // TODO: better approach will run Builder computation before
            // duplicate processing
            volume += box.sizex + box.sizey + box.sizez;
            break;
          case MaterialUnit.SquareMeters:
            volume += Math.max(box.sizex * box.sizey, box.sizex * box.sizez, box.sizey * box.sizez) * 1e-6;
            break;
          case MaterialUnit.CubicMeters:
            volume += box.sizex * box.sizey * box.sizez * 1e-9;
            break;
        }
      }
    }
    if (root.children) {
      for (let child of root.children) {
        let article = child.data.model && child.data.model.bill === ElementBill.Article;
        if (!article) {
          volume += this.computeVolume(child, material, mapper);
        }
      }
    }
    mapper.pop(root);
    return volume;
  }

  private getExternalPrices(products: {sku}[]) {
    let request = {
      cityId: 52,
      sessionId: "12",
      ...this.priceUrlParams,
      products
    };
    return this.system.proxyPost<PriceResponse>(this.priceUrl, request);
  }

  canFillPrices() {
    let hasPriceSource = !!this.priceUrl || !!this.priceList;
    return this.showPrices && hasPriceSource;
  }

  fillPrices(files: FileItem[]) {
    if (this.priceUrl) {
      let products = files.filter(f => !f.folder && f.sku).map(f => ({sku: f.sku}));
      if (products.length > 0) {
        return this.getExternalPrices(products).pipe(map(result => {
          if (result && result.products) {
            for (let file of files) {
              let product = result.products.find(i => i.sku === file.sku);
              if (product) {
                file.price = parseFloat(product.price);
              }
            }
          }
          return files;
        }));
      }
    } else if (this.priceList) {
      for (let file of files) {
        let price = this.priceList.items[file.sku];
        if (price) {
          file.price = price;
        }
      }
    }
    return of(files);
  }

  private fillPrice(list: PriceElement[]) {
    if (!list.length) {
      return of(list);
    }
    let result = of(list);
    // update element sku and price from files and pricelist
    result = result.pipe(concatMap(
      elements => {
        let fileList = [];
        for (let model of elements) {
          if (model.modelId && !this.fileCache.has(model.modelId)) {
            fileList.push(model.modelId);
          }
          for (let subElement of model.elements) {
            if (subElement.modelId && !this.fileCache.has(subElement.modelId)) {
              fileList.push(subElement.modelId);
            }
          }
        }
        if (fileList.length < 1) {
          return of(elements);
        }
        return this.files.getFiles(fileList).pipe(
          tap(files => {
            files.forEach(f => this.fileCache.set(f.id, f))
          }),
          map(_ => elements)
        );
      }),
      map(src => {
        return src.map(model => {
          let newModel = model.clone();
          newModel.forAll(e => {
            let file = this.fileCache.get(e.modelId);
            if (file) {
              e.name = file.name;
              e.sku = e.sku || file.sku;
              e.price = e.price || file.price;
            }
            if (e.modelId && !file) {
              this.missingModels.push(...e.entities);
            }
            if (this.priceList && e.sku) {
              e.price = this.priceList.items[e.sku] || e.price;
            }
          });
          return newModel;
        });
      }
    ));
    // update prices from api url
    if (this.priceUrl) {
      result = result.pipe(concatMap(models => {
          let products = []
          models.forEach(m => m.forAll(e => {
            if (e.sku) {
              products.push({sku: e.sku});
            }
          }));
          if (products.length > 0) {
            return this.getExternalPrices(products);
          }
          return of(undefined);
        },
        (models, response?: PriceResponse) => {
          if (response && response.products) {
            models.forEach(m => m.forAll(e => {
              let product = response.products.find(p => p.sku === e.sku);
              if (product) {
                e.price = parseFloat(product.price);
              }
            }));
          }
          return models;
        }));
    }
    return result;
  }

  private propertyCache = new Map<number, Property>();

  getElementPropertyDescription(e: PriceElement) {
    return e.props.map(p => {
      let property = this.propertyCache.get(p[0]);
      if (property) {
        let value = property.valueName(p[1]);
        if (property.name && value) {
          return property.name + ': ' + value;
        }
      }
    }).filter(v => v).join(', ');
  }

  private fillPropertyInfo(list: PriceElement[]) {
    let missingProps = new Set<number>();
    for (let elem of list) {
      elem.forAll(e => {
        for (let prop of e.props) {
          if (!this.propertyCache.has(prop[0])) {
            missingProps.add(prop[0]);
          }
        }
      })
    }

    let result = of(list);
    if (missingProps.size > 0) {
      result = result.pipe(
        concatMap(list => {
          return this.catalogs.getProperties(Array.from(missingProps)).pipe(map(newProps => {
            for (let prop of newProps) {
              let newProp = Property.fromProperty(prop);
              this.propertyCache.set(newProp.id, newProp);
            }
            return list;
          }))
        })
      )
    }

    return result.pipe(map(list => {
      for (let elem of list) {
        elem.forAll(e => {
          if (!e.description) {
            e.description = this.getElementPropertyDescription(e);
          }
        });
      }
      return list;
    }));
  }

  private computeMaterialInfo(list: PriceElement[]) {
    let materialQuery: ModelValueRequest[] = [];
    let elems: PriceElement[] = [];
    for (let elem of list) {
      for (let item of elem.elements) {
        if (item.unit === MaterialUnit.Meters && item.materialId) {
          materialQuery.push({
            value: ModelGetValue.MaterialLength,
            arg: item.name,
            uid: elem.entities[0],
            recursive: true
          });
          elems.push(item);
        }
      }
    }
    if (materialQuery.length > 0) {
      let ds = (materialQuery[0].uid as Entity).ds;
      //this.files.g
      return from(ds.batchGetter(materialQuery)).pipe(
        map(lengths => {
          for (let i = 0; i < elems.length; ++i) {
            elems[i].count = roundFloat(lengths[i] / 1000, 2);
          }
          return list;
        })
      )
    }
    return of(list);
  }

  clearCache() {
    this.fileCache.clear();
    this.priceCache.clear();
    this.propertyCache.clear();
  }

  toJson() {
    return {
      price: this.price,
      elements: this.models.map(m => m.toJson())
    }
  }

  // script interface
  alterPriceElement: (element: PriceElement, entity?: Entity) => PriceElement;
  alterEstimate: (models: PriceElement[]) => Promise<any> | undefined;
}
