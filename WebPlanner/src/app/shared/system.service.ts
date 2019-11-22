import { Injectable, Type } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { of, Observable } from "rxjs";

export interface EmailResult {
  ok: boolean;
  error?: string;
}

export enum ReportType {
  Print = 0,
  Xml = 1,
  Email = 2
}

export class BaseConfig {

}

export class ApplicationConfig {
  applicationName = 'WebPlanner';
  registrationEnabled = false;
}

export class SmsServerConfig extends BaseConfig {
  server: string;
  bodyTemplate: string;
  bodyType: string;
  phoneRewriteRules?: { pattern: string, replacement: string };
}

export class ArchiveConfig extends BaseConfig {
  destination: string;
  archiveAfter: number;
  removeAfter: number;
}

const configNameMap = {
  'application': ApplicationConfig,
  'smsserver': SmsServerConfig,
  'archive': ArchiveConfig
}

export interface Report {
  type: ReportType;
  id: number;
  name: string;
  params?: any;
  template?: string;
  style?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  constructor(private http: HttpClient) {
  }

  getAssets(path = '') {
    return this.http.get<{folders: string[], files: string[]}>(`/api/system/assets/` + path);
  }

  getAsset(path: string) {
    return this.http.get(`/api/system/asset/${path}`, { responseType: 'blob' });
  }

  uploadAsset(path: string, file: File | null) {
    let data = new FormData();
    if (file) {
      data.append('file', file, file.name);
    }
    return this.http.post(`/api/system/asset/${path}`, data);
  }

  removeAsset(name: string) {
    return this.http.delete('/api/system/asset/' + name);
  }

  getScript(name: string) {
    return this.http.get(`/api/system/script/${name}`, { responseType: 'text' });
  }

  setScript(name: string, source: string) {
    return this.http.post(`/api/system/script/${name}`, { source });
  }

  getStyle() {
    return this.http.get('/api/system/webstyle', { responseType: 'text' });
  }

  setStyle(style: string) {
    return this.http.post('/api/system/webstyle', { style });
  }

  getEmbedStyle() {
    return this.http.get('/api/system/embedstyle', { responseType: 'text' });
  }

  setEmbedStyle(style: string) {
    return this.http.post('/api/system/embedstyle', { style });
  }

  sendEmail(address: string, body: string) {
    return this.http.post<EmailResult>('/api/system/email', { address, body }).pipe(
      catchError(error => {
        let message = `${error}`;
        if (error instanceof HttpErrorResponse) {
          message = error.message;
        }
        return of({ok: false, error: message});
      })
    );
  }

  // commented to remove dependency on AuthService and tree shake away
  // signalr libraries
  testEmail(settings/*: MailSettings */) {
    return this.http.post<EmailResult>('/api/system/testemail', settings);
  }

  proxyPost<T>(url: string, data: any) {
    const proxyPrefix = 'proxy://';
    if (url.startsWith(proxyPrefix)) {
      let body = { url: url.substr(proxyPrefix.length), data };
      return this.http.post<T>('/api/system/proxy', body);
    }
    return this.http.post<T>(url, data);
  }

  getTemplates() {
    return this.http.get<Report[]>('/api/system/reports');
  }

  getTemplate(id: number) {
    return this.http.get<Report>('/api/system/report/' + id).pipe(map(r => {
      r.params = r.params ? JSON.parse(r.params as any) : undefined;
      return r;
    }));
  }

  editTemplate(report: Report) {
    return this.http.post<number>('/api/system/report', report);
  }

  removeTemplate(report: Report) {
    return this.http.delete<number>('/api/system/report/' + report.id);
  }

  builderStatus() {
    return this.http.get('/api/system/builder');
  }

  closeOpenedModels() {
    return this.http.post('/api/system/builder/closemodels', {});
  }

  backup() {
    return this.http.post<string>('/api/system/backuptask', {});
  }

  angstremUpdate() {
    return this.http.post('/api/system/angstremupdate', {ftpUrl: 'default'});
  }

  stopJob(id: string) {
    return this.http.post('/api/system/stopjob/' + id, {});
  }

  sendSmsCode(phone: string) {
    return this.http.post('/api/system/sendsmscode', { phone }, { responseType: 'text'});
  }

  verifySmsCode(phone: string, code: string) {
    return this.http.post<boolean>('/api/system/verifysmscode', { phone, code });
  }

  getConfig<T extends BaseConfig>(type: Type<T>): Observable<T> {
    for (let key in configNameMap) {
      if (configNameMap[key] === type) {
        return this.http.get<any>(`/api/system/config/${key}`).pipe(
          map(data => Object.assign(new type(), data))
        );
      }
    }
  }

  setConfig<T extends BaseConfig>(value: T) {
    for (let key in configNameMap) {
      if (value instanceof configNameMap[key]) {
        return this.http.post<T>(`/api/system/config/${key}`, value);
      }
    }
  }
}
