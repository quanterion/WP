import { Component, OnInit, Inject, ViewChild, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSort, MatTableDataSource, MatDialog } from "@angular/material";
import { MaterialUnit, FileItem, OrderInfo, OrderService, FilesService, AuthService } from '../../shared';
import { EstimateService } from '../estimate';
import { Observable, combineLatest } from 'rxjs';
import { concatMap, filter, map } from 'rxjs/operators';
import { EmbedService } from 'embed/embed.service';
import { saveAsDialog } from 'app/shared/filesaver';
import { OrderSenderComponent } from '../order-sender/order-sender.component';
import { OrderEditorComponent } from '../orders/order-editor/order-editor.component';
import { SystemService, ReportType, Report } from 'app/shared/system.service';
import { compileXml, compileHtml } from '../print-dialog/template-compiler';

export interface SpecificationDetails {
  file: FileItem,
  estimate: EstimateService,
  order: Observable<OrderInfo>,
  scriptInterface: any;
  orderUrl?: string;
  orderUrlParams: any;
};

@Component({
  selector: 'app-specification',
  templateUrl: './specification.component.html',
  styleUrls: ['./specification.component.scss']
})
export class SpecificationComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: SpecificationDetails,
    @Optional() public embed: EmbedService, public auth: AuthService,
    private dialogs: MatDialog, private firm: OrderService,
    private system: SystemService,
    private dialogRef: MatDialogRef<SpecificationComponent>,
    private files: FilesService) {
      this.dataSource = new MatTableDataSource(data.estimate.gatherElements());
    }

  xmlTemplates$ = this.system.getTemplates().pipe(
    map(list => list.filter(t => t.type === ReportType.Xml)),
    filter(list => list.length > 0)
  );
  dataSource: MatTableDataSource<any>;
  displayedColumns = ['sku', 'name', 'price', 'count', 'cost'];
  versionColumns = ['name', 'date'];
  unit = MaterialUnit;
  orderConfirmation = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dialogRef.updateSize('70vw');
  }

  publishProjectPrice() {
    this.files.setPrice(this.data.file, this.data.estimate.price).subscribe();
  }

  makeOrder(template?: Report) {
    if (!template) {
      return;
    }
    this.dialogRef.close(false);
    let order$ = this.data.order.pipe(
      concatMap(order => {
        let data = order || { id: this.data.file.id};
        let dialog = this.dialogs.open(OrderEditorComponent, { minWidth: '50%', data });
        return dialog.afterClosed();
      }),
      filter(v => v),
      concatMap((order: OrderInfo) => this.firm.setOrder(order.id, order)),
    );
    combineLatest(order$, this.system.getTemplate(template.id)).subscribe(
      ([o, t]) => this.saveOrderXml(t, o)
    );
    this.close();
  }

  private async saveOrderXml(report: Report, order: OrderInfo) {
    this.publishProjectPrice();
    order.client = order.client || { name: '' };
    this.data.scriptInterface.order = order;
    let xml = await compileXml(report.template, this.data.scriptInterface);
    let bb = new Blob([xml], {type: 'application/xml;charset=utf-8'});
    let fileName = await compileHtml(report.name, this.data.scriptInterface);
    saveAsDialog(bb, fileName + '.xml', { autoBOM: true});
  }

  sendOrder() {
    this.dialogs.open(OrderSenderComponent, { data: this.data, minWidth: '40%'});
  }

  close() {
    this.dialogRef.close();
  }
}
