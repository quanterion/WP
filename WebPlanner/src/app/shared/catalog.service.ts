import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from "@angular/platform-browser";
import { map, concatMap, share } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export enum CatalogType {
  Model = 0,
  Material = 1,
  Planner = 2,
  ModelAndMaterial = 3
}

export interface CatalogParams {
  name: string;
  description?: string;
  preview?: string;
  shared?: string;
  type?: CatalogType;
  parentCatalogId?: number;
}

export interface Catalog {
  id: number;
  name: string;
  description?: string;
  preview?: string;
  parentCatalogId: number;
  modelFolderId: number;
  materialGroupId: number;
  shared?: string;
  ownerId: number;
  readOnly: boolean;
  type: CatalogType;
}

export interface CatalogSyncConfig {
  catalogUrl: string;
  token?: string;
  username?: string;
  password?: string;
  destFolderId?: number;
  updateExistingModels: boolean;
  removeMissingModels: boolean;
}

export interface CatalogSyncResult {
  error?: string;
  modelCount: number;
  materialCount: number;
  textureCount: number
}

export interface CatalogBatchConfig {
  folder: number;
  mask: string;
  command: string;
}

export enum MaterialUnit {
  None = 0,
  Units = 1,
  Meters = 2,
  SquareMeters = 3,
  CubicMeters = 4
}

export enum MaterialType {
  Material = 0,
  Group = 1,
  DoubleSided = 2
}

export interface CatalogMaterial {
  id?: number;
  type: MaterialType;
  groupId?: number;
  catalogId: number;
  name: string;
  sku?: string;
  texture: string;
  bumpTexture: string;
  sizex: number;
  sizey: number;
  offsetx: number;
  offsety: number;
  angle: number;
  transparency: number;
  reflection: number;
  ambient: number;
  specular: number;
  shininess: number;
  price: number;
  unit: MaterialUnit;
}

export interface CatalogGroup {
  id?: number;
  type: MaterialType.Group;
  groupId?: number;
  catalogId: number;
  name: string;
  texture?: string;
  readOnly: boolean;
  materials: CatalogMaterial[];
}

export interface UpdateMaterialResponse {
  changedModels: number;
}

export interface SearchQuery {
  catalog: number;
  term: string;
  materials?: boolean;
}

export interface SearchResult {
  files: any[];
  materials: any[];
  properties: any[];
}

export function createMaterial(
  name: string,
  catalog?: number
): CatalogMaterial {
  return {
    id: undefined,
    type: MaterialType.Group,
    catalogId: catalog,
    name,
    texture: undefined,
    bumpTexture: undefined,
    sizex: 100,
    sizey: 100,
    offsetx: 0,
    offsety: 0,
    angle: 0,
    transparency: 0,
    reflection: 0,
    ambient: 0,
    specular: 0.3,
    shininess: 0.4,
    sku: undefined,
    price: 0,
    unit: MaterialUnit.None
  };
}

export interface CatalogArchiveInfo {
  name: string;
  size: number;
  date: string;
}

export function copyMaterial(src: CatalogMaterial) {
  let result = createMaterial('');
  for (let prop in result) {
    result[prop] = src[prop];
  }
  return result;
}

export interface CatalogProperty {
  id: number;
  catalogId: number;
  name: string;
  description: string;
  data: string;
}

export function catalogSort(a: Catalog, b: Catalog) {
  if (!isNaN(Number(a.name)) && !isNaN(Number(b.name))) {
    return (Number(a.name) - Number(b.name));
  }
  if (isNaN(Number(a.name)) && !isNaN(Number(b.name))) {
    return 1;
  }
  if (!isNaN(Number(a.name)) && isNaN(Number(b.name))) {
    return -1;
  }
  return a.name.localeCompare(b.name);
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor(private http: HttpClient) {}

  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`/api/catalogs/`).pipe(map(list => {
      list.sort((a, b) => {
        if (!isNaN(Number(a.name)) && !isNaN(Number(b.name))) {
          return (Number(a.name) - Number(b.name));
        }
        if (isNaN(Number(a.name)) && !isNaN(Number(b.name))) {
          return 1;
        }
        if (!isNaN(Number(a.name)) && isNaN(Number(b.name))) {
          return -1;
        }
        return a.name.localeCompare(b.name);
      });
      return list;
    }));
  }

  getAllCatalogs(): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`/api/catalogs/all`);
  }

  getSharedCatalogs(): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`/api/catalogs/shared`)
      .pipe(map(list => list.sort(catalogSort)));
  }

  getCatalog(id: number): Observable<Catalog> {
    return this.http.get<Catalog>(`/api/catalogs/${id}`);
  }

  getNestedCatalogs(parentCatalogId: number): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`/api/catalogs/${parentCatalogId}/nested`)
      .pipe(map(list => list.sort(catalogSort)));
  }

  addCatalog(data: CatalogParams): Observable<Catalog> {
    return this.http.post<Catalog>(`/api/catalogs`, data);
  }

  syncCatalog(id: number, config: CatalogSyncConfig) {
    return this.http.post<string>(`/api/catalogs/${id}/sync`, config);
  }

  archiveCatalog(id: number) {
    return this.http.post<string>(`/api/catalogs/${id}/archive`, {});
  }

  getCatalogArchives(id: number) {
    return this.http.get<CatalogArchiveInfo[]>(`/api/catalogs/${id}/archives`);
  }

  deleteArchive(id: number, name: string) {
    return this.http.delete(`/api/catalogs/${id}/archive/${name}`);
  }

  restoreCatalog(id: number, name: string) {
    return this.http.post<string>(`/api/catalogs/${id}/restore?name=${name}`, {});
  }

  restoreCatalogFromFile(id: number, file: File) {
    let data = new FormData();
    data.append('file', file, file.name);
    return this.http.post<string>(`/api/catalogs/${id}/restore`, data);
  }

  batchCatalog(id: number, config: CatalogBatchConfig) {
    return this.http.post<string>(`/api/catalogs/${id}/batch`, config);
  }

  removeCatalog(id: number) {
    return this.http.delete(`/api/catalogs/${id}`);
  }

  editCatalog(id: number, params: CatalogParams) {
    return this.http.post(`/api/catalogs/${id}`, params);
  }

  searchCatalog(query?: SearchQuery) {
    if (!query) {
      return of(undefined as SearchResult);
    }
    let url = `/api/catalogs/${query.catalog}/search`;
    let options = { params: { term: query.term } };
    return this.http.get<SearchResult>(url, options);
  }

  updateThumbnail(id: number, thumbnail: File) {
    let data = new FormData();
    data.append('file', thumbnail, thumbnail.name);
    return this.http.post<Catalog>(`./api/catalogs/${id}/preview`, data);
  }

  removeThumbnail(id: number) {
    return this.http.delete(`/api/catalogs/${id}/preview`);
  }

  getGroup(catalogId, groupId: number): Observable<CatalogGroup> {
    return this.http.get<CatalogGroup>(
      `/api/catalogs/${catalogId}/materialgroup/${groupId}`
    ).pipe(map(g => {
      let compare = (a, b) => a.name.localeCompare(b.name);
      g.materials.sort(compare);
      return g;
    }));
  }

  getMaterials(catalogId: number): Observable<CatalogMaterial[]> {
    return this.http.get<CatalogMaterial[]>(
      `/api/catalogs/${catalogId}/materials`
    );
  }

  addMaterial(
    catalogId: number,
    name: string,
    groupId?: number
  ): Observable<CatalogMaterial> {
    return this.http.post<
      CatalogMaterial
    >(`/api/catalogs/${catalogId}/materials`, { name, groupId });
  }

  addGroup(
    catalogId: number,
    name: string,
    groupId?: number
  ): Observable<CatalogGroup> {
    let data = { name, groupId, type: MaterialType.Group };
    return this.http.post<CatalogGroup>(`/api/catalogs/${catalogId}/materials`, data);
  }

  updateMaterial(material: CatalogMaterial | CatalogGroup, updateModel?: number): Observable<UpdateMaterialResponse> {
    if (!material.id) {
      return this.addMaterial(material.catalogId, material.name).
        pipe(concatMap(mat => this.updateMaterial(mat)));
    }
    let params = typeof updateModel === 'number' ? { model: updateModel.toString()} : undefined;
    return this.http.post<UpdateMaterialResponse>(
      `/api/catalogs/${material.catalogId}/materials/${material.id}`,
      material, {params}
    );
  }

  findMaterial(
    catalogId: number,
    name: string
  ): Observable<CatalogMaterial> {
    return this.http.get<CatalogMaterial>(
      `/api/catalogs/${catalogId}/findmaterial/${name}`
    );
  }

  findMaterials(pointers: string[]): Observable<CatalogMaterial[]> {
    return this.http.post<CatalogMaterial[]>(
      `/api/catalogs/materials`,
      pointers
    );
  }

  findModelMaterials(catalogId: number, modelId: number): Observable<CatalogMaterial[]> {
    let url = `/api/catalogs/${catalogId}/model/${modelId}/materials`;
    return this.http.get<CatalogMaterial[]>(url);
  }

  removeMaterial(m: CatalogMaterial | CatalogGroup) {
    return this.http.delete(`/api/catalogs/${m.catalogId}/materials/${m.id}`);
  }

  // uploading texture changes texture, size, and sizey properties
  uploadTexture(
    m: CatalogMaterial,
    file: File
  ): Observable<CatalogMaterial> {
    if (!m.id) {
      return this.addMaterial(m.catalogId, m.name).
        pipe(concatMap(mat => this.uploadTexture(mat, file)));
    }
    let data = new FormData();
    data.append('file', file, file.name);
    return this.http.post<CatalogMaterial>(
      `/api/catalogs/${m.catalogId}/materials/${m.id}/texture`,
      data
    );
  }

  uploadBumpMap(
    m: CatalogMaterial,
    file?: File,
    bump = false
  ): Observable<CatalogMaterial> {
    let data = new FormData();
    if (file) {
      data.append('file', file, file.name);
    }
    return this.http.post<CatalogMaterial>(
      `/api/catalogs/${m.catalogId}/materials/${m.id}/bumptexture?bump=${bump}`,
      data
    );
  }

  getCatalogProperties(catalogId: number): Observable<CatalogProperty[]> {
    return this.http.get<CatalogProperty[]>(
      `/api/catalogs/${catalogId}/properties`
    );
  }

  getProperty(
    catalogId: number,
    propertyId: number
  ): Observable<CatalogProperty> {
    return this.http.get<CatalogProperty>(
      `/api/catalogs/${catalogId}/properties/${propertyId}`
    );
  }

  getProperties(ids: number[]): Observable<CatalogProperty[]> {
    let url = `/api/catalogs/properties/${ids.join('+')}`;
    return this.http.get<CatalogProperty[]>(url);
  }

  addProperty(
    catalogId: number,
    name: string,
    data?: string
  ): Observable<CatalogProperty> {
    return this.http.post<
      CatalogProperty
    >(`/api/catalogs/${catalogId}/properties`, { name, data });
  }

  setProperty(
    property: CatalogProperty
  ): Observable<CatalogProperty> {
    return this.http.post<CatalogProperty>(
      `/api/catalogs/${property.catalogId}/properties/${property.id}`,
      property
    );
  }

  removeProperty(catalogId: number, propertyId: number) {
    return this.http.delete(
      `/api/catalogs/${catalogId}/properties/${propertyId}`
    );
  }
}

@Pipe({ name: 'thumbnail', pure: false })
export class ThumbnailPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  transform(value: CatalogMaterial) {
    if (value && value.texture) {
      if (value.texture.length === 7 && value.texture[0] === '#') {
        let svg = `<svg width="96" height="96" viewBox="0 0 96 96"
            xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="96" height="96" style="fill: ${value.texture}"/>
          </svg>`;
        let data = `data:image/svg+xml;base64,${btoa(svg)}`;
        return this.domSanitizer.bypassSecurityTrustResourceUrl(data);
      }
      return `./thumbnails/${value.texture.substr(0, 2)}/${value.texture}`;
    } else if (value && value.type === 1) {
      return `./assets/icon/folder.svg`;
    } else {
      return `./thumbnails/default.jpg`;
    }
  }
}

@Pipe({ name: 'texture', pure: false })
export class TexturePipe implements PipeTransform {
  transform(value: CatalogMaterial): string {
    if (value && value.texture) {
      return `./textures/${value.texture.substr(0, 2)}/${value.texture}`;
    } else {
      return `./textures/default.jpg`;
    }
  }
}

@Pipe({ name: 'bumpthumbnail', pure: false })
export class BumpThumbnailPipe implements PipeTransform {
  transform(value: CatalogMaterial): string {
    if (value && value.bumpTexture) {
      return `./bumpthumbs/${value.bumpTexture.substr(0, 2)}/${value.bumpTexture}`;
    } else {
      return `./bumpthumbs/default.jpg`;
    }
  }
}

@Pipe({ name: 'bumpmap', pure: false })
export class BumpmapPipe implements PipeTransform {
  transform(value: CatalogMaterial): string {
    if (value && value.bumpTexture) {
      return `./bumpmaps/${value.bumpTexture.substr(0, 2)}/${value.bumpTexture}`;
    } else {
      return `./bumpmaps/default.jpg`;
    }
  }
}

export class CatalogMaterialCache {
  constructor(public catalogs: CatalogService) {}
  private cache = new Map<string, CatalogMaterial | null>();

  add(materials: string[]) {
    let updateList = materials.filter(m => !this.cache.has(m));
    if (updateList.length < 1) {
      return of();
    }
    materials.forEach(m => this.cache.set(m, undefined));
    let result = this.catalogs.findMaterials(materials).pipe(share());
    result.subscribe(list => {
      for (let m of list) {
        let name = `${m.catalogId}\n${m.name}`;
        this.cache.set(name, m);
      }
    });
    return result;
  }

  get(material: string) {
    return this.cache.get(material);
  }
}
