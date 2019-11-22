import { Injectable, Optional, NgZone, EventEmitter } from '@angular/core';
import { Observable, throwError, combineLatest } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { EmbedService } from 'embed/embed.service';
import { HttpInterceptor, HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { HttpRequest } from "@angular/common/http";
import { HttpHandler } from "@angular/common/http";
import { environment } from 'environments/environment';
import * as Sentry from "@sentry/browser";
import { timer, of } from 'rxjs';
import { concatMap, map, share, takeUntil, catchError, shareReplay, take, filter, startWith } from 'rxjs/operators';
import { UserInfo, UserUpdateData } from './account.service';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState} from '@aspnet/signalr'
import { SystemService, ApplicationConfig } from './system.service';

const REFRESH_TOKEN_LIFETIME = 1000 * 60 * 10; // ten minutes

export class AngstremSettings {
  priceFtp: string;
}

export class PlannerSettings {
  showPrices = false;
  allowExport = false;
  sounds = true;
  showFavoriteFolders = false;
  doorAnimation = true;
  showFloors = true;
  replaceByType = true;
  navigatorCube = true;
  updateChangedModels = true;
}

export class EmbeddedSettings {
  enabled = true;
  userName: string;
  configUrl?: string; // can be used in addition to query params
  priceUrl?: string;
  orderUrl?: string;
}

export class OrderSettings {
  enabled = true;
  // auto generate project name
  projectName?: string;
  // order button and actions
  order = false;
  lock = false;
  verifyPhone = false;
  requirePhone = false;
  email: string;
  post: string;
  customParams: any[];
  customClientParams: any[];
}

export class MailSettings {
  host: string;
  port = 465;
  ssl = true
  disableSslCheck = false;
  userName: string;
  password: string;
  senderEmail: string;
  adminName: string;
  adminEmail: string;
}

export interface JobProgressEvent {
  id: string;
  message?: string;
  progress?: number;
  complete: boolean;
  result?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  accessToken?: string;
  isAuthenticated = new BehaviorSubject<boolean | undefined>(undefined);
  isAdmin = new BehaviorSubject<boolean | undefined>(undefined);
  offline$ = new BehaviorSubject<boolean>(false);
  userId?: number;
  userName = '';
  address = '';
  phone = '';
  activePriceListId: number;
  fullName = '';
  email = '';
  roles: string[] = [];
  employees: UserInfo[] = [];
  admin = false;
  superAdmin = false;
  firm: { id: number; name: string };
  angstrem = false;
  wigwam = false;
  settings = new ApplicationConfig();
  embedded = new EmbeddedSettings();
  reloadUrl: string;

  private refreshToken: string;
  private authAction$ = new EventEmitter<void>();
  private storeAuthTokens = true;

  public readonly host = window.location.hostname;
  private publicHosts = ['www.wigwam3d.ru', 'www.webplanner.app'];
  private _publicMode = this.publicHosts.indexOf(this.host) >= 0;

  constructor(private http: HttpClient, @Optional() embed: EmbedService, private system: SystemService, private zone: NgZone) {
    let host = window.location.hostname;
    this.angstrem = host.indexOf('localhost') >= 0 || host.indexOf('angstrem') >= 0
    this.wigwam =  host.indexOf('wigwam3d.') >= 0;
    if (embed) {
      this.storeAuthTokens = false;
    } else {
      this.refreshToken = localStorage.getItem('refresh_token');
      // protection against token written as 'undefined' to storage
      if (this.refreshToken && this.refreshToken.length < 10) {
        this.refreshToken = undefined;
      }
    }
    if (environment.e2e) {
      this.resetAuth();
    } else {
      if (!embed) {
        setTimeout(_ => this.updateRefreshToken());
      }
      this.zone.runOutsideAngular(() => {
        timer(REFRESH_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME).subscribe(_ =>
          this.updateRefreshToken()
        );
      });
      window.addEventListener('offline',  _ => this.offline$.next(true));
        window.addEventListener('online',  _ => {
          this.updateRefreshToken();
          this.offline$.next(false);
        });
    }
    // to avoid cyclic dependency with AuthInterceptor
    setTimeout(_ =>
      this.system.getConfig(ApplicationConfig)
        .subscribe(v => this.settings = v));
  }

  get publicMode() {
    return this._publicMode;
  }

  private resetAuth() {
    this.userId = undefined;
    this.userName = '';
    this.fullName = '';
    this.address = '';
    this.phone = '';
    this.activePriceListId = undefined;
    this.email = '';
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.roles = [];
    this.firm = undefined;
    this.admin = false;
    this.superAdmin = false;
    this.isAuthenticated.next(false);
    this.isAdmin.next(false);
  }

  private processLogin() {
    if (this.accessToken && this.refreshToken) {
      let obs = this.http.post<any>('/api/account/userinfo', { full: true }).pipe(share());
      obs.subscribe(response => {
        this.userId = response.userId;
        this.userName = response.name;
        this.fullName = response.fullName;
        this.address = response.address;
        this.phone = response.phone;
        this.activePriceListId = response.activePriceListId;
        this.email = response.email;
        this.roles = response.roles || [];
        this.employees = response.employees || [];
        this.firm = response.firm;
        this.admin = this.roles.includes('admin');
        this.superAdmin = this.roles.includes('superadmin');
        this.isAuthenticated.next(true);
        this.isAdmin.next(this.admin);
        this.authAction$.next();
        if (environment.raven) {
          Sentry.configureScope((scope) => {
            scope.setUser({
              username: this.userName,
              email: this.email
            });
          });
        }
        return true;
      },
      _ => {
        this.resetAuth();
        return 'access_token is invalid';
      });
      return obs;
    }
    return of(false);
  }

  private encodeParams(params: any): string {
    let body = '';
    for (let key in params) {
      if (body.length) {
        body += '&';
      }
      body += key + '=';
      body += encodeURIComponent(params[key]);
    }

    return body;
  }

  login(info: { userName: string; password: string }) {
    let params = {
      client_id: 'WebPlanner',
      grant_type: 'password',
      username: info.userName,
      password: info.password,
      scope: 'WebAPI offline_access openid profile roles'
    };
    let body = this.encodeParams(params);
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http
      .post<any>('connect/token', body, { headers })
      .pipe(concatMap(response => {
        this.accessToken = response.access_token;
        this.refreshToken = response.refresh_token;
        this.saveAuthToStorage();
        return this.processLogin();
      }));
  }

  updateRefreshToken() {
    if (!this.refreshToken) {
      if (this.isAuthenticated.value !== false) {
        this.resetAuth();
      }
      return of(false);
    }
    let params: any = {
      client_id: 'WebPlanner',
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken
    };

    let body: string = this.encodeParams(params);
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let result = this.http
      .post<any>('connect/token', body, { headers })
      .pipe(
        map(body => {
          if (body && body.access_token && body.refresh_token) {
            // Stores access token & refresh token.
            this.accessToken = body.access_token;
            this.refreshToken = body.refresh_token;
            this.saveAuthToStorage();
            if (!this.isAuthenticated.value) {
              this.processLogin();
            }
            return true;
          }
          this.resetAuth();
          return false;
        }),
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status !== 0) {
              this.resetAuth();
            }
          }
          return of(false);
        }),
        takeUntil(this.authAction$),
        shareReplay()
      );
    result.subscribe();
    return result;
  }

  loginAs(id: number, remember = false, backWay = false) {
    if (backWay) {
      this.reloadUrl = window.location.href;
    }
    this.storeAuthTokens = remember;
    return this.http.post<any>(`/api/account/loginas/${id}`, {})
      .pipe(concatMap(result => {
        this.accessToken = result.accessToken;
        this.refreshToken = result.refreshToken;
        this.authAction$.next();
        this.saveAuthToStorage();
        return this.processLogin();
      }));
  }

  returnToLastUser() {
    window.location.replace(this.reloadUrl);
  }

  embedLogin() {
    this.storeAuthTokens = true;
    let login$ = this.http.post<any>(`/api/account/embedlogin`, {});
    let embedded$ = this.getAppSetting<EmbeddedSettings>('EmbeddedSettings');
    return combineLatest(login$, embedded$).pipe(
      take(1),
      concatMap(result => {
        this.accessToken = result[0].accessToken;
        this.refreshToken = result[0].refreshToken;
        this.embedded = result[1];
        this.authAction$.next();
        return this.processLogin();
      }));
  }

  requestEmailToken(email: string) {
    return this.http.post<{token?: string, registred: boolean}>(`/api/account/emailtoken`, {email});
  }

  emailLogin(email: string, token: string) {
    this.storeAuthTokens = true;
    return this.http.post<any>(`/api/account/emaillogin`, {email, token})
      .pipe(concatMap(result => {
        this.accessToken = result.accessToken;
        this.refreshToken = result.refreshToken;
        this.saveAuthToStorage();
        this.authAction$.next();
        return this.processLogin();
      }));
  }

  register(info: { userName: string; email: string; password: string }) {
    let body: UserUpdateData = {
      username: info.userName,
      password: info.password,
      email: info.email
    };
    return this.http
      .post<any>('/api/account/register', body)
      .pipe(map(r => {
        if (!r.succeeded) {
          throw r;
        }
        return r;
      }));
  }

  logout(remeber?: boolean) {
    if (this.refreshToken) {
      let params: any = {
        client_id: 'WebPlanner',
        token: this.refreshToken,
        token_type_hint: 'refresh_token'
      };
      // Encodes the parameters.
      let body: string = this.encodeParams(params);
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
      this.http.post('connect/revocation', body, { headers }).subscribe();
    }
    this.authAction$.next();
    this.resetAuth();
    if (remeber !== undefined) {
      this.storeAuthTokens = remeber;
    }
    this.saveAuthToStorage();
  }

  private saveAuthToStorage() {
    if (this.storeAuthTokens) {
      if (this.refreshToken) {
        localStorage.setItem('refresh_token', this.refreshToken);
      } else {
        localStorage.removeItem('refresh_token');
      }
    }
  }

  getAppSetting<T>(name: string): Observable<T> {
    return this.http.get<T>(`api/system/appsetting/${name}`);
  }

  getAppSettingRaw(name: string) {
    return this.getAppSetting<any>(name);
  }

  setAppSetting(settings: Object, name: string, userId?: number) {
    if (userId === undefined) {
      userId = this.userId;
    }
    return this.http.post('api/system/appsetting', {
      name,
      userId,
      value: JSON.stringify(settings)
    });
  }

  setAppSettingRaw(name: string, value: any, userId?: number) {
    if (userId === undefined) {
      userId = this.userId;
    }
    return this.http.post('api/system/appsetting', {
      name,
      userId,
      value: JSON.stringify(value)
    });
  }

  hasRole(role: string) {
    return this.roles.includes(role);
  }

  private _hubConnection: HubConnection;
  private _serverProgress = new EventEmitter<JobProgressEvent>();

  private get serverProgress() {
    if (!this._hubConnection) {
      this._hubConnection = new HubConnectionBuilder()
        .withUrl('/api/events/', { accessTokenFactory: () => this.accessToken})
        .configureLogging(environment.production ? LogLevel.Warning : LogLevel.Information)
        .build();
      this._hubConnection.on('progress', data => {
        this._serverProgress.next(data);
        this.zone.run(_ => setTimeout(_ => {}));
      });
    }
    if (this._hubConnection.state !== HubConnectionState.Connected) {
      this.zone.runOutsideAngular(() => {
        this._hubConnection.start();
      });
    }
    return this._serverProgress;
  }

  getJobPogress(id: string) {
    return this.serverProgress.pipe(
      filter(event => event.id === id.toString()),
      startWith({ id, complete: false } as JobProgressEvent)
    );
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ) {
    if (this.auth && this.auth.accessToken) {
      let cors = req.url.match(/https{0,1}:/);
      if (!cors) {
        req = req.clone({
            setHeaders: { 'Authorization': 'Bearer ' + this.auth.accessToken }
          });
      }
    }
    return next.handle(req).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          // call to userinfo endpoint follows refresh token update
          // calling to updateRefreshToken() again would result in infinite loop
          if (error.status === 401 && req.url !== '/api/account/userinfo') {
            return this.auth.updateRefreshToken().pipe(
              concatMap(ok => ok ? next.handle(req) : throwError(error))
            );
          }
          // TODO: retry requested when fix long HTTP queries like angstrem update or catalog sync
          // if (error.status === 504) {
          //   return next.handle(req);
          // }
        }
        return throwError(error);
      })
    );
  }
}
