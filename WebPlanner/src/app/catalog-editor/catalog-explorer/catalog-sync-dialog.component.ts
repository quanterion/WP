import { Component, OnInit, Inject } from '@angular/core';
import { CatalogSyncConfig, CatalogService, AuthService, JobProgressEvent } from '../../shared';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-catalog-sync-dialog',
  templateUrl: './catalog-sync-dialog.component.html',
  styleUrls: ['./catalog-sync-dialog.component.scss']
})
export class CatalogSyncDialogComponent implements OnInit {

  constructor( private catalogs: CatalogService, private auth: AuthService,
    private dialogRef: MatDialogRef<CatalogSyncDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { catalogId, folderId }) { }

  catalogUrl = new FormControl('', Validators.required);
  token = new FormControl('', Validators.required);
  updateExistingModels = new FormControl(false);
  removeMissingModels = new FormControl(false);

  form = new FormGroup({
    catalogUrl: this.catalogUrl,
    token: this.token,
    updateExistingModels: this.updateExistingModels,
    removeMissingModels: this.removeMissingModels
  });

  ngOnInit() {
  }

  progress$: Observable<JobProgressEvent>;

  sync() {
    this.dialogRef.disableClose = true;
    let config: CatalogSyncConfig = {
      ...this.form.value,
      destFolderId: this.data.folderId
    }
    this.form.disable();
    this.progress$ = this.catalogs.syncCatalog(this.data.catalogId, config)
      .pipe(concatMap(id => this.auth.getJobPogress(id)));
  }

}
