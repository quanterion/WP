import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService, AccountService, FileItem, FilesService } from 'app/shared';
import { forkJoin } from 'rxjs';

export interface FilePropertiesDisplay {
  files: FileItem[];
  activeField?: 'price' | 'sku';
}

@Component({
  selector: 'app-file-properties-dialog',
  templateUrl: './file-properties-dialog.component.html',
  styleUrls: ['./file-properties-dialog.component.scss']
})
export class FilePropertiesComponent implements OnInit {

  isFolderPresent = false;
  progressMode = false;
  error = false;

  constructor(public auth: AuthService, private account: AccountService,
    private dialogRef: MatDialogRef<FilePropertiesComponent>,
    private filesService: FilesService,
    @Inject(MAT_DIALOG_DATA) public data: FilePropertiesDisplay) { }

  roles$ = this.account.getRoles();

  name = new FormControl({value: '', disabled: this.data.files.length > 1}, [Validators.required]);
  sku = new FormControl('');
  price = new FormControl('');
  shared = new FormControl(null);

  form = new FormGroup({
    name: this.name,
    sku: this.sku,
    price: this.price,
    shared: this.shared
  });

  ngOnInit() {
    let files = this.data.files;
    this.isFolderPresent = files.some(f => f.folder);
    let sampleFile = files[0];
    if (files.length > 1) {
      let isSameShared = files.every(f => f.shared === sampleFile.shared);
      let isSameSKU = files.every(f => f.sku === sampleFile.sku);
      let isSamePrice = files.every(f => f.price === sampleFile.price);
      let shared = isSameShared ? sampleFile.shared : ' ';
      let sku = isSameSKU ? sampleFile.sku : '';
      let price = isSamePrice ? sampleFile.price : '';
      let names = files.map(f => f.name);
      this.form.patchValue({ name: names.join(", "), shared, sku, price });
    } else {
      this.form.patchValue(sampleFile);
    }
    if (files.every(f => !f.shared)) {
      this.shared.setValue('!');
    }
  }

  saveProperties() {
    if (this.form.invalid) {
      return;
    }
    let files = this.data.files;
    let value = this.form.value;
    let result: { [key: string]: any } = {};
    if (this.shared.dirty && value.shared !== ' ') {
      if (value.shared === '!') {
        result.shared = false;
      } else {
        result.sharedRole = value.shared;
        result.shared = true;
      }
    }
    if (this.name.dirty) {
      result.name = value.name;
    }
    if (this.sku.dirty) {
      result.sku = value.sku;
    }
    if (this.price.dirty) {
      result.price = value.price;
    }
    if (this.form.dirty) {
      this.progressMode = true;
      this.form.disable();
      let reqs = files.map(f => this.filesService.sendFileProperties(f, result));
      let resultReq = forkJoin(...reqs).subscribe(_ => {
        this.form.enable();
        this.progressMode = false;
        this.dialogRef.close(value);
      }, error => {
        this.error = true;
      });
    }
  }
}
