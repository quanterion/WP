import { Component, Inject, ViewChild, AfterViewInit, Optional } from '@angular/core';
import { OrderService } from 'app/shared';
import { PriceList } from '../../planner/estimate';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { delay } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { TdFileUploadComponent } from '../file/file-upload/file-upload.component';
import { AccountService } from '../account.service';

interface PriceListRow {
  sku: string;
  price: number;
}

@Component({
  selector: 'app-pricelist-detail',
  templateUrl: './pricelist-detail.component.html',
  styleUrls: ['./pricelist-detail.component.scss']
})
export class PricelistDetailComponent implements AfterViewInit {
  tableData = new MatTableDataSource<PriceListRow>([]);
  price: PriceList;
  displayedColumns = ["sku", "price"];
  loading = true;
  changed = false;

  constructor(private firm: OrderService, private snackBar: MatSnackBar,
      private auth: AuthService, private account: AccountService,
      private dialogRef: MatDialogRef<PricelistDetailComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {
    if (typeof data === 'number') {
      this.price = new PriceList(undefined);
      this.price.ownerId = data;
      this.loading = false;
    } else if (data) {
      let id = data.id;
      firm.getPrice(id)
        // TODO: wait for dialog to popup, remove when virtual scroll added
        .pipe(delay(500))
        .subscribe(pl => {
          this.price = pl;
          this.updateData(this.price);
          this.loading = false;
        });
    } else {
      this.price = new PriceList(undefined);
      this.price.ownerId = auth.userId;
      this.loading = false;
    }
  }

  roles$ = this.account.getRoles();

  private updateData(price: PriceList) {
    price.shared = price.shared || '!';
    let table: PriceListRow[] = [];
    for (let item in price.items) {
      table.push({ sku: item, price: parseFloat(price.items[item] as any) });
    }
    this.tableData.data = table;
  }

  @ViewChild('sortForDataSource', { static: true }) sortForDataSource: MatSort;
  ngAfterViewInit() {
    this.tableData.sort = this.sortForDataSource;
  }

  get editable() {
    if (this.auth.isAdmin.value) {
      return true;
    }
    return this.price && (this.price.ownerId === this.auth.userId);
  }

  priceChanged() {
    this.changed = true;
  }

  applyFilter(value: string) {
    value = value.trim().toLocaleLowerCase();
    this.tableData.filter = value;
  }

  clearSearch() {
    this.tableData.filter = undefined;
  }

  @ViewChild(TdFileUploadComponent, { static: false }) fileUpload: TdFileUploadComponent;

  savePrice() {
    this.firm.savePrice(this.price).subscribe(
      _ => {
        this.snackBar.open('Изменения сохранены');
        this.dialogRef.close();
        this.changed = false;
      },
      _ => this.snackBar.open('Ошибка сохранения прайс-листа')
    );
  }

  empty() {
    return this.tableData.data.length < 1;
  }

  uploadPriceList(fileInfo: File | FileList) {
    if (fileInfo instanceof FileList) {
      for (let i = 0; i < fileInfo.length; ++i) {
        this.uploadFile(fileInfo.item(i));
      }
    } else if (fileInfo instanceof File) {
      this.uploadFile(fileInfo);
    }
    this.fileUpload.cancel();
  }

  private uploadFile(file: File) {
    let reader = new FileReader();
    reader.onload = e => this.parseFile(file, e.target['result']);
    reader.readAsText(file);
  }

  private parseFile(file: File, text: string) {
    let ok = false;
    if (file.name.endsWith('.xml') || file.name.endsWith('.XML')) {
      ok = this.price.importXml(text) > 0;
    } else {
      ok = this.price.importCsv(text) > 0;
    }
    if (ok) {
      this.updateData(this.price);
      this.changed = true;
    } else {
      this.snackBar.open('Неверный формат файла');
    }
  }
}
