import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { concatMap, startWith, filter } from 'rxjs/operators';
import { AuthService, JobProgressEvent } from 'app/shared';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { SystemService } from 'app/shared/system.service';

interface SqlQueryResult {
  fields: string[];
  rows: any[];
  recordsAffected: number;
}

@Component({
  selector: 'app-admin-status',
  templateUrl: './admin-status.component.html',
  styleUrls: ['./admin-status.component.scss']
})
export class AdminStatusComponent implements OnInit {
  status: Observable<any>;
  journal: Observable<any[]>;
  sqlQuery: Observable<SqlQueryResult>;
  journalColumns = ['date', 'message'];
  journalDays = new FormControl(1);
  journalErrorsOnly = new FormControl(false);
  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private dialog: DialogService,
    private system: SystemService
  ) {
    this.status = system.builderStatus();
    let days = this.journalDays.valueChanges.pipe(startWith(1));
    let errorsOnly = this.journalErrorsOnly.valueChanges.pipe(startWith(false));
    this.journal = combineLatest(days, errorsOnly).pipe(
      concatMap(p => {
        let params = {days: p[0], type: p[1] ? 'error' : undefined };
        return http.get<any[]>('/api/system/journal', { params }).pipe(startWith(undefined));
      })
    );
  }

  ngOnInit() {
  }

  superAdmin() {
    return this.auth.roles.includes('superadmin');
  }

  eventColor(event) {
    if (event.level === 1) {
      return 'accent';
    }
    if (event.level === 2) {
      return 'warn';
    }
    return 'primary';
  }

  eventIcon(event) {
    if (event.level === 1) {
      return 'warning';
    }
    if (event.level === 2) {
      return 'error';
    }
    return 'info';
  }

  cleanupInfo: string;
  cleanup() {
    this.http.post('/api/system/cleanup', {}).subscribe(
      result => {
        this.cleanupInfo = JSON.stringify(result);
      },
      error => {
        this.cleanupInfo = `Cleanup failed. ${error.statusText}`;
      }
    );
  }

  backupProgress$?: Observable<JobProgressEvent>;
  backup() {
    this.backupProgress$ = this.system.backup()
      .pipe(concatMap(id => this.auth.getJobPogress(id)));
  }

  clearJournal() {
    this.dialog.openConfirm({ message: 'Очистить журнал?' })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.http.delete('/api/system/journal'))
      ).subscribe(
        _ => this.dialog.openAlert({ message: 'Журнал успешно очищен' }),
        _ => this.dialog.openAlert({ message: 'Ошибка очистки журнала' })
      );
  }

  sqlInput = new FormControl('', [Validators.required]);

  runSql() {
    if (this.sqlInput.valid) {
      this.sqlQuery = this.http.post<SqlQueryResult>('/api/system/sql', { text: this.sqlInput.value });
    }
  }

  closeModels() {
    this.system.closeOpenedModels().subscribe(
      _ => this.status = this.system.builderStatus()
    );
  }
}
