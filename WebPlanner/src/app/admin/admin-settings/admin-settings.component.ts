import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AuthService } from '../../shared';
import { Observable, empty, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';
import {
  AngstremSettings,
  PlannerSettings,
  EmbeddedSettings,
  OrderSettings,
  MailSettings,
  JobProgressEvent
} from 'app/shared/auth.service';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { share, map, startWith, catchError, concatMap, tap } from 'rxjs/operators';
import { SystemService, EmailResult, SmsServerConfig, BaseConfig, ArchiveConfig, ApplicationConfig } from 'app/shared/system.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  app$ = this.system.getConfig(ApplicationConfig);
  mail$: Observable<MailSettings>;
  planner$: Observable<PlannerSettings>;
  embedded$: Observable<EmbeddedSettings>;
  order$: Observable<OrderSettings>;
  angstrem$: Observable<AngstremSettings>;
  smsServer$ = this.system.getConfig(SmsServerConfig).pipe(
    map(c => {
      c.phoneRewriteRules = c.phoneRewriteRules || { pattern: '', replacement: ''};
      return c;
    })
  );
  archiving$ = this.system.getConfig(ArchiveConfig);

  mailTest$: Observable<EmailResult>;

  constructor(public auth: AuthService, private snack: MatSnackBar, private system: SystemService) {
    this.mail$ = auth.getAppSetting<MailSettings>('MailSettings');
    this.planner$ = auth.getAppSetting<PlannerSettings>('PlannerSettings');
    this.embedded$ = auth.getAppSetting<EmbeddedSettings>('EmbeddedSettings');
    this.order$ = auth.getAppSetting<OrderSettings>('OrderSettings').pipe(map(s => {
      s.customParams = s.customParams || [];
      s.customClientParams = s.customClientParams || [];
      return s;
    }));
    if (auth.angstrem) {
      this.angstrem$ = auth.getAppSetting<AngstremSettings>('AngstremSettings');
    }
  }

  ngOnInit() {
  }

  saveApp(form: NgForm) {
    this.saveSettings(form, 'ApplicationSettings')
      .subscribe(v => this.auth.settings = v);
  }

  testMail(form: NgForm) {
    this.mailTest$ = this.system.testEmail(form.value).pipe(
      startWith({ ok: true, error: '*'}),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          return of({ ok: false, error: error.message })
        }
        return of({ ok: false, error: error.toString() });
      })
    );
  }

  smsTest$: Observable<EmailResult>;

  testSms(input: HTMLInputElement) {
    this.smsTest$ = this.system.sendSmsCode(input.value).pipe(
      tap(v => input.value = v),
      map(_ => ({ ok: true })),
      catchError(_ => of({ ok: false}))
    )
  }

  saveMail(form: NgForm) {
    this.saveSettings(form, 'MailSettings').subscribe();
  }

  savePlanner(form: NgForm, value) {
    this.saveSettings(form, 'PlannerSettings', value)
  }

  saveAngstrem(form: NgForm) {
    this.saveSettings(form, 'AngstremSettings')
  }

  saveEmbedded(form: NgForm) {
    this.saveSettings(form, 'EmbeddedSettings')
  }

  saveOrder(form: NgForm, value) {
    this.saveSettings(form, 'OrderSettings', value);
  }

  @ViewChild('updateSuccess', { static: true }) updateSuccessTemplate: TemplateRef<any>;

  saveConfig(form: NgForm, config: BaseConfig) {
    if (form.valid) {
      Object.assign(config, form.value);
      this.system.setConfig(config).subscribe(_ => {
        form.resetForm(config);
        this.snack.openFromTemplate(this.updateSuccessTemplate);
      }, this.errorHandler);
    }
  }

  saveSettings(form: NgForm, name: string, value?) {
    if (!form.valid) return empty();
    value = value || form.value;
    let result = this.auth.setAppSetting(value, name, 0)
      .pipe(map(_ => value), share());
    result.subscribe(_ => {
      form.resetForm(form.value);
      this.snack.openFromTemplate(this.updateSuccessTemplate);
    }, this.errorHandler);
    return result;
  }

  errorHandler = (error) => {
    this.snack.open('Failed to save settings: ' + error.toString(),
      undefined, {duration: 3000});
  }

  angstremUpdating = false;

  angstremUpdate() {
    this.angstremUpdating = true;
    this.system.angstremUpdate().subscribe(
      _ => this.snack.open('Update success', undefined, { duration: 5000}),
      _ => {
        this.angstremUpdating = false;
        this.snack.open('Fail to update', undefined, { duration: 5000});
      },
      () => this.angstremUpdating = false
    );
  }

  archivingProgress$?: Observable<JobProgressEvent>;

  runArchiving(form: NgForm) {
    form.control.disable();
    this.archivingProgress$ = this.system.backup()
      .pipe(concatMap(id => this.auth.getJobPogress(id)));
  }
}
