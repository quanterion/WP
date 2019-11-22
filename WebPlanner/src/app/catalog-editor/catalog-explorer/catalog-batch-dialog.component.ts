import { Component, OnInit, Inject } from '@angular/core';
import { CatalogService, AuthService, JobProgressEvent, CatalogBatchConfig } from '../../shared';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-catalog-batch-dialog',
  templateUrl: './catalog-batch-dialog.component.html',
  styleUrls: ['./catalog-batch-dialog.component.scss']
})
export class CatalogBatchDialogComponent implements OnInit {

  constructor( private catalogs: CatalogService, private auth: AuthService,
    private dialogRef: MatDialogRef<CatalogBatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { catalogId, folderId }) { }

  mask = new FormControl('*');
  command = new FormControl('', Validators.required);

  form = new FormGroup({
    mask: this.mask,
    command: this.command
  });

  ngOnInit() {
  }

  progress$: Observable<JobProgressEvent>;

  run() {
    this.dialogRef.disableClose = true;
    let config: CatalogBatchConfig = {
      ...this.form.value,
      folder: this.data.folderId
    }
    this.form.disable();
    this.progress$ = this.catalogs.batchCatalog(this.data.catalogId, config)
      .pipe(concatMap(id => this.auth.getJobPogress(id)));
  }

}
