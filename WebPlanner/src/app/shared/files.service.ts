import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { HttpClient, HttpParams, HttpEvent, HttpEventType, HttpErrorResponse } from "@angular/common/http";
import { map, concatMap, startWith, tap, catchError, delay } from 'rxjs/operators';
import { saveAsDialog } from './filesaver';
import * as pako from 'pako';

export function getFileExtension(name: string) {
  return name.slice((name.lastIndexOf(".") - 1 >>> 0) + 2);
}

export interface FileItem {
  id: number;
  name: string;
  preview?: string;
  folder: boolean;
  shared?: string;
  readOnly?: boolean | 'locked' | 'archived';
  // returned by GetFile() only
  parentId?: number;
  catalogId?: number;
  price?: number;
  sku?: string;
  modifiedAt?: string;
  ownerId?: number;
  ownerName?: string;
  files?: FileItem[];
  insertInfo?: string;
}

export type FileItemFilter = (f: FileItem) => boolean;

export interface MoveFilesResult {
  error?: 'permission' | 'recursion',
  folder: FileItem,
  materials: string[];
}

export interface ApplyResult {
  id: string;
  items: string[];
}

export function dataURItoFile(dataURI, name?: string) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  // separate out the mime component
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  // write the bytes of the string to a typed array
  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  try {
    return new File([ia], name || 'file', { type: mimeString });
  } catch {
    return new Blob([ia], { type: mimeString });
  }
}

const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Use a lookup table to find the index.
const base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  base64Lookup[base64Chars.charCodeAt(i)] = i;
}

export function decodeBase64(base64) {
  let bufferLength = base64.length * 0.75;
  let len = base64.length;
  let i = 0;
  let p = 0;
  let encoded1, encoded2, encoded3, encoded4;

  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }

  let arraybuffer = new ArrayBuffer(bufferLength),
  bytes = new Uint8Array(arraybuffer);

  for (i = 0; i < len; i += 4) {
    encoded1 = base64Lookup[base64.charCodeAt(i)];
    encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
    encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
    encoded4 = base64Lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arraybuffer;
};

export interface FilesUploadResponse {
  progress?: number;
  error?: string;
  errorStatus?: number;
  uploaded?: any[];
  failed?: any[];
  newMaterials?: any[];
  curFileIndex?: number;
}

export interface FileDownloadResponse {
  progress?: number;
  blob?: Blob;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  constructor(
    private http: HttpClient
  ) {}

  getFile(id: string | number, children = false, token?: string): Observable<FileItem> {
    let url = `/api/files/${id}`;
    let params = new HttpParams();
    if (children) {
      params = params.set('children', 'true');
    }
    if (token) {
      params = params.set('token', token);
    }
    return this.http.get<FileItem>(url, { params }).pipe(map(f => {
      if (f.files) {
        f.files.sort(this.fileSort);
      }
      return f;
    }));
  }

  getFiles(ids: number[], strict = false): Observable<FileItem[]> {
    if (ids.length < 1) {
      return of([]);
    }
    let url = `/api/files/items/${ids.join('+')}`;
    if (strict) {
      url += '?strict=true';
    }
    return this.http.get<FileItem[]>(url);
  }

  generateFileTokens(id: number | string, token?: string) {
    let url = `/api/files/${id}/tokens`;
    let params = new HttpParams();
    if (token) {
      params = params.set('token', token);
    }
    return this.http.get<{read: string, write?: string}>(url, { params });
  }

  getModelValues(folder: number, value: number, arg: number) {
    let params = { value: value.toString(), arg: arg.toString() };
    return this.http.get<{id: number, value: any}[]>(`/api/files/${folder}/models/get`, { params });
  }

  findModelsByName(names: string[]): Observable<FileItem[]> {
    return this.http.post<FileItem[]>('/api/files/findmodelsbyname', names);
  }

  private fileSort = (f1: FileItem, f2: FileItem) => {
    let result = Number(f2.folder) - Number(f1.folder);
    if (result === 0) {
      result = f1.name.localeCompare(f2.name);
    }
    return result;
  }

  getChildren(folder: number): Observable<FileItem[]> {
    return this.http
      .get<FileItem[]>(`/api/files/${folder}/items/`)
      .pipe(map(items => items.sort(this.fileSort)));
  }

  recent(count: number) {
    return this.http.get<FileItem[]>(`/api/files/recent/${count}`);
  }

  getProjectTemplates(all?: boolean): Observable<FileItem[]> {
    let params = all ? { view: 'all' } : undefined;
    return this.http.get<FileItem[]>(`/api/files/templates`, { params }).pipe(map(files => {
      files.forEach(f => f.name = f.name || '');
      return files;
    }));
  }

  backupProject(projectId: number, name?: string) {
    let params = name ? {name} : undefined;
    return this.http.post<File>(`/api/files/${projectId}/backup`, {}, {params});
  }

  restoreProject(projectId: number, backupId: string | number) {
    return this.http.post<boolean>(`/api/files/${projectId}/restore/${backupId}`, {});
  }

  archiveProject(projectId: number) {
    return this.http.post(`/api/files/${projectId}/archive`, {});
  }

  restoreFromArchive(projectId: number) {
    return this.http.post<boolean>(`/api/files/${projectId}/restorefromarchive`, {});
  }

  getProjectBackups(projectId: number): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(`/api/files/${projectId}/backups`);
  }

  removeFile(file: FileItem) {
    return this.http.delete(`/api/files/${file.id}`);
  }

  removeFiles(files: FileItem[]) {
    return this.http.post(`/api/files/delete`, { files: files.map(f => f.id)});
  }

  restoreFiles(files: FileItem[]) {
    return this.http.post(`/api/files/restore`, { files: files.map(f => f.id)});
  }

  renameFile(file: FileItem, newName: string) {
    return this.http.post<FileItem>(`/api/files/${file.id}`, { name: newName });
  }

  setPrice(file: FileItem, price: number) {
    return this.http.post(`/api/files/${file.id}`, { price });
  }

  setSku(file: FileItem, sku: string) {
    return this.http.post(`/api/files/${file.id}`, { sku });
  }

  share(file: FileItem, sharedRole?: string) {
    return this.http.post(`/api/files/${file.id}`, { shared: true, sharedRole });
  }

  sendFileProperties(file: FileItem, data) {
    return this.http.post<FileItem>(`/api/files/${file.id}`, data);
  }

  lock(fileId: string | number, locked: boolean) {
    return this.http.post<FileItem>(`/api/files/${fileId}`, { locked });
  }

  addFolder(parentId: number, name: string) {
     return this.http.post<FileItem>(`/api/files`, {name, parentId, type: "Folder"});
  }

  moveFiles(source: number[], destination: number) {
    return this.http.post<MoveFilesResult>(`/api/files/move`, {source, destination});
  }

  apply(fileOrFolderId: number, changes: any[]) {
    return this.http.post<ApplyResult[]>(`/api/files/${fileOrFolderId}/apply`, changes);
  }

  createProject(name: string, action?: object, template?) {
    return this.http.post<FileItem>('/api/files', {
      name,
      type: 'Project',
      parentId: 0,
      shared: null,
      action,
      template
    })
  }

  uploadFile(folderOrFileId: number, file: File, extractPreview = true, compress = true) {
    let data = new FormData();
    let url = `./api/files/${folderOrFileId}/upload?preview=${extractPreview}`;
    if (compress && typeof Response !== 'undefined') {
      return from(new Response(file).arrayBuffer()).pipe(
        map(buf => {
          let compressed = pako.gzip(new Uint8Array(buf));
          return {blob: new Blob([compressed]), filesize: buf.byteLength};
        }),
        concatMap(({blob, filesize}) => {
          data.append('file', blob, file.name);
          data.append('filesize', filesize.toString());
          data.append('compress', 'gzip');
          return this.http.post<FilesUploadResponse>(url, data);
        })
      )
    }
    data.append('file', file, file.name);
    return this.http.post<FilesUploadResponse>(url, data)
  }

  private handleUploadResponse(event: HttpEvent<FilesUploadResponse>) {
    switch (event.type) {
      case HttpEventType.Sent:
        return { progress: -1 } as FilesUploadResponse;
      case HttpEventType.UploadProgress:
        const progress = Math.round(100 * event.loaded / event.total);
        return { progress } as FilesUploadResponse;
      case HttpEventType.Response:
        return event.body as FilesUploadResponse;
      default:
        return { progress: -3 } as FilesUploadResponse;
    }
  }

  private handleDownloadResponse(event: HttpEvent<Blob>) {
    switch (event.type) {
      case HttpEventType.Sent:
        return { progress: -1 } as FileDownloadResponse;
      case HttpEventType.DownloadProgress:
        const progress = Math.round(100 * event.loaded / event.total);
        return { progress } as FileDownloadResponse;
      case HttpEventType.Response:
        return {blob: event.body} as FileDownloadResponse;
      default:
        return {progress: -2 } as FileDownloadResponse;
    }
  }

  uploadFileWithProgress(folderOrFileId: number, file: File, extractPreview = true, compress = true) {
    const bigFileSize = 1024 * 1024;
    let data = new FormData();
    let url = `./api/files/${folderOrFileId}/upload?preview=${extractPreview}`;
    let sendResponse = () => {
      return this.http.post<FilesUploadResponse>(url, data, { reportProgress: true, observe: "events" }).pipe(
        map(event => this.handleUploadResponse(event)));
    }
    if (compress && typeof Response !== 'undefined') {
      let result$ = from(new Response(file).arrayBuffer()).pipe(
        concatMap(buf => {
          if (file.size > bigFileSize) {
            return of(buf).pipe(delay(500));
          }
          return of(buf);
        }),
        tap(buf => {
          let compressed = pako.gzip(new Uint8Array(buf));
          let blob = new Blob([compressed]);
          let filesize = buf.byteLength;
          data.append('file', blob, file.name);
          data.append('filesize', filesize.toString());
          data.append('compress', 'gzip');
        }),
        concatMap(_ => {
          return sendResponse();
        })
      );
      return result$.pipe(
        startWith({ progress: -2 } as FilesUploadResponse)
      );
    }
    data.append('file', file, file.name);
    return sendResponse();
  }

  downloadFile(file: FileItem, format?: string, rootUid?: string, materials = false) {
    let link = `/api/files/${file.id}/download`;
    let params = new HttpParams();
    if (format) {
      params = params.append('format', format);
    }
    if (rootUid) {
      params = params.append('root', rootUid);
    }
    if (materials) {
      params = params.append('materials', '1');
    }
    let ext = format || 'wpm';
    this.http.get(link, {params, responseType: 'blob'}).subscribe(
      blob => saveAsDialog(blob, file.name + '.' + ext),
      _ => alert('Ошибка скачивания файла')
    )
  }

  downloadFileWithProgress(file: FileItem, format?: string, rootUid?: string,
    materials = false) {
    let link = `/api/files/${file.id}/download`;
    let params = new HttpParams();
    if (format) {
      params = params.append('format', format);
    }
    if (rootUid) {
      params = params.append('root', rootUid);
    }
    if (materials) {
      params = params.append('materials', '1');
    }
    format = format || 'wpm';
    return this.http.get(link, {
      params,
      reportProgress: true,
      responseType: "blob",
      observe: "events"
    }).pipe(
      map(
        event => this.handleDownloadResponse(event)),
      catchError(e => {
        console.log(e);
        let message = "Download error!"
        if (e instanceof HttpErrorResponse) {
          message += " " + e.message;
        }
        return of({ error: message } as FileDownloadResponse);
      })
    );
  }

  updateThumbnail(fileId: string, thumbnailData: string, token?: string) {
    let data = new FormData();
    let thumbBlob = dataURItoFile(thumbnailData);
    data.append('file', thumbBlob, 'thumb.png')
    let params = token ? { token } : undefined;
    return this.http.post<{ preview: string}>(`/api/files/${fileId}/preview`, data, { params });
  }

  updateCustomThumbnail(fileId: number | string, thumbnail: File | Blob, name?: string, token?: string) {
    let data = new FormData();
    if (!name && thumbnail instanceof File) {
      name = thumbnail.name;
    }
    data.append('file', thumbnail, name || 'image.png');
    let params = token ? { token } : undefined;
    return this.http.post<{ preview: string}>(`/api/files/${fileId}/custompreview`, data, { params });
  }

  removeThumbnail(id: number) {
    return this.http.delete(`/api/files/${id}/preview`);
  }

  nextFileId() {
    return this.http.get<number>(`/api/files/nextfileid`);
  }

  // return files newer than id
  getChanged(id: number, ids: number[]): Observable<FileItem[]> {
    let url = `/api/files/${id}/changed/${ids.join('+')}`;
    return this.http.get<FileItem[]>(url);
  }

  isFileLocked(id: number | string) {
    return this.http.get<boolean>(`/api/files/${id}/locked`);
  }

  addFileImage(id: number, image: File | Blob | string, name?: string) {
    let data = new FormData();
    if (typeof image === 'string') {
      image = dataURItoFile(image, 'image.png');
    }
    if (!name && image instanceof File) {
      name = image.name;
    }
    data.append('file', image, name);
    return this.http.post<FileItem>(`/api/files/${id}/image`, data);
  }

  getFileImages(id: number) {
    return this.http.get<FileItem[]>(`/api/files/${id}/images`);
  }
}

@Pipe({ name: 'preview', pure: false })
export class PreviewPipe implements PipeTransform {
  transform(value: FileItem | any): string {
    if (value && value.preview) {
      return `./previews/${value.preview.substr(0, 2)}/${value.preview}`;
    } else if (value && value.folder) {
      return `./assets/icon/folder.svg`;
    } else if (value && value.modelFolderId) {
      return `./assets/icon/catalog.svg`;
    } else {
      return `./previews/default.jpg`;
    }
  }
}
