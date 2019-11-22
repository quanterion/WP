import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface EmbedProjectLink {
  id: number;
  token?: string;
}

@Injectable()
export class EmbedService {

  constructor(private router: Router) {

  }

  private _initParams: any;

  linkOrigin?: string;

  get initParams() {
    return this._initParams || {};
  }

  setInitParams(value: any, force = false) {
    if (this._initParams && !force) {
      return;
    }
    this._initParams = {...value};
    delete this._initParams.project;
    delete this._initParams.id;
  }

  encodeLink(link: EmbedProjectLink) {
    let str = JSON.stringify(link);
    return btoa(str.slice(1, str.length - 1));
  }

  decodeLink(data: string) {
    try {
      let json = atob(data);
      if (!json.startsWith('{')) {
        json = '{' + json + '}';
      }
      return JSON.parse(json) as EmbedProjectLink;
    } catch {
      return undefined;
    }
  }

  goToProject(id: number) {
    let queryParams = {...this.initParams};
    queryParams.project = this.encodeLink({id});
    this.router.navigate(['/editor'], { queryParams });
  }

  private static LAST_PROJECT_STORAGE = 'embed_current_project_id';

  getLastProjectId() {
    let id = localStorage.getItem(EmbedService.LAST_PROJECT_STORAGE);
    return id ? Number(id) : undefined
  }

  setLastProjectId(id?: number | string) {
    if (id) {
      localStorage.setItem(EmbedService.LAST_PROJECT_STORAGE, id.toString());
    } else {
      localStorage.removeItem(EmbedService.LAST_PROJECT_STORAGE);
    }
  }
}
