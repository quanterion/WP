import { Component, OnInit, Inject, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Catalog, CatalogType, CatalogService } from 'app/shared/catalog.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService, AccountService } from 'app/shared';
import { TdFileInputComponent } from 'app/shared/file/file-input/file-input.component';

@Component({
  selector: 'app-catalog-info',
  templateUrl: './catalog-info.component.html',
  styleUrls: ['./catalog-info.component.scss']
})
export class CatalogInfoComponent implements OnInit {

  constructor(public auth: AuthService, private account: AccountService,
    private dialogRef: MatDialogRef<CatalogInfoComponent>,
    private service: CatalogService,
    @Optional() @Inject(MAT_DIALOG_DATA) public catalog?: Catalog) { }

  roles$ = this.account.getRoles();

  get create() {
    return !this.catalog;
  }

  name = new FormControl('', [Validators.required]);
  description = new FormControl('');
  type = new FormControl(CatalogType.Model);
  shared = new FormControl(null);

  form = new FormGroup({
    name: this.name,
    description: this.description,
    type: this.type,
    shared: this.shared
  });

  ngOnInit() {
    if (this.catalog) {
      this.form.patchValue(this.catalog);
      if (!this.catalog.shared) {
        this.shared.setValue('!');
      }
    }
  }

  close() {
    let value = this.form.value;
    if (value.shared === '!') {
      value.shared = undefined;
    }
    if (this.catalog) {
      value.preview = this.catalog.preview;
    }
    this.dialogRef.close(value);
  }

  @ViewChild(TdFileInputComponent, { static: false }) fileUpload: TdFileInputComponent;
  startUploadThumbnail() {
    this.fileUpload.inputElement.click();
    this.fileUpload.clear();
  }

  uploadThumbnail(preview: File) {
    this.service.updateThumbnail(this.catalog.id, preview)
      .subscribe(c => this.catalog = c);
  }

  removeThumbnail() {
    this.catalog.preview = '';
  }
}
