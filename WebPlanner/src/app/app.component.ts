import { Component, ChangeDetectorRef, HostBinding } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { LoginComponent } from './login/login.component';
import { AuthService } from './shared';
import { LOCALE_ID, Inject } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { DialogService } from './dialogs/services/dialog.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  lastCloseResult: string;
  readonly wigwam = window.location.hostname.indexOf('wigwam3d.') >= 0;

  @ViewChild(MatSidenav, { static: true }) _sideNav: MatSidenav;
  @HostBinding('class') classes = '';

  constructor(
    @Inject(LOCALE_ID)
    private locale: string,
    private dialog: DialogService,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    public auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    angulartics2GoogleAnalytics.startTracking();
    this.auth.isAuthenticated.subscribe(logged => {
      let classes = auth.roles.map(r => 'role-' + r);
      if (logged) {
        classes.push('logged');
      }
      this.classes = classes.join(' ');
    });
  }

  appName() {
    return this.auth.settings.applicationName || 'WebPlanner';
  }

  get isEnglish() {
    return this.locale === 'en-US';
  }

  get translateRedirection() {
    let zone = this.isEnglish ? "ru" : "com"
    return "https://www.wigwam3d." + zone;
  }

  get canLogin() {
    return !this.auth.userId && (this.auth.publicMode || this.router.url !== '/home');
  }

  loginClick() {
    this.dialog.open(LoginComponent);
  }

  logoutClick() {
    if (this.auth.roles && this.auth.roles.includes('seller')) {
      this.auth.loginAs(-1).subscribe(
        _ => this.cd.markForCheck(),
        e => this.auth.logout()
      );
    } else {
      this.auth.logout();
    }
  }

  storeMode$ = this.auth.isAuthenticated.pipe(
    map(v => v && this.auth.roles.includes('store'))
  );

  get userName() {
    return this.auth.roles.includes("seller") ? this.auth.fullName : this.auth.userName;
  }
}
