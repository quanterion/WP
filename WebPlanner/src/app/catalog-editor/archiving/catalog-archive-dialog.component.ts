import { Component, Inject, ViewContainerRef, ViewChild, TemplateRef } from '@angular/core';
import { CatalogService, AuthService, JobProgressEvent } from '../../shared';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { concatMap, map, tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-catalog-archive-dialog',
  templateUrl: './catalog-archive-dialog.component.html',
  styleUrls: ['./catalog-archive-dialog.component.scss']
})
export class CatalogArchiveDialogComponent {

  constructor( private catalogs: CatalogService, private auth: AuthService,
    private dialogRef: MatDialogRef<CatalogArchiveDialogComponent>,
    public dialog: MatDialog, private viewRef: ViewContainerRef,
    @Inject(MAT_DIALOG_DATA) public catalogId: number) {
  }

  archives$ = this.catalogs.getCatalogArchives(this.catalogId);
  showArchives = true;
  restoreMode = false;

  progress$: Observable<JobProgressEvent>;

  downloadLink(name: string) {
    return `/api/catalogs/${this.catalogId}/archive/${name}`;
  }

  @ViewChild('confirmTemplate', { static: true }) confirmDialogTemplate: TemplateRef<any>;
  runConfirmDialog?: MatDialogRef<any, any>;

  private nextTask?: Observable<string>;

  tryRunTask(task: Observable<string>, restore = false) {
    this.nextTask = task;
    this.restoreMode = restore;
    this.runConfirmDialog = this.dialog.open(this.confirmDialogTemplate, { viewContainerRef: this.viewRef });
  }

  runTask() {
    if (this.runConfirmDialog)     {
      this.runConfirmDialog.close();
    }
    if (this.nextTask) {
      this.dialogRef.disableClose = true;
      this.showArchives = false;
      this.progress$ = this.nextTask.pipe(
        concatMap(id => this.auth.getJobPogress(id)),
        catchError(err => of({ id: '', error: err.toString(), complete: false} as JobProgressEvent)),
        tap(p => this.showArchives = p && p.complete));
    }
  }

  cancelTask() {
    if (this.runConfirmDialog)     {
      this.runConfirmDialog.close();
    }
  }

  archive() {
    this.tryRunTask(this.catalogs.archiveCatalog(this.catalogId));
  }

  restoreFromArchive(archive: string) {
    this.dialogRef.disableClose = true;
    this.tryRunTask(this.catalogs.restoreCatalog(this.catalogId, archive), true);
  }

  restoreFromFile(file: File) {
    this.restoreMode = true;
    this.tryRunTask(this.catalogs.restoreCatalogFromFile(this.catalogId, file), true);
  }

  deleteConfirmDialog?: MatDialogRef<any, any>;

  showDeleteConfirmation(template: TemplateRef<any>) {
    this.deleteConfirmDialog = this.dialog.open(template);
  }

  deleteArchive(archive: string) {
    if (this.deleteConfirmDialog) {
      this.deleteConfirmDialog.close();
    }
    this.catalogs.deleteArchive(this.catalogId, archive)
      .subscribe(_ => this.archives$ = this.archives$.pipe(map(v => v)));
  }

  close() {
    this.dialogRef.close();
  }
}
