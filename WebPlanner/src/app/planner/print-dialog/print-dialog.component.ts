import { Component, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable, combineLatest, from, fromEvent } from "rxjs";
import { SystemService, Report, ReportType } from "app/shared/system.service";
import { FormControl } from "@angular/forms";
import { filter, concatMap, tap, shareReplay, delay, map } from "rxjs/operators";
import { compileTemplate } from "./template-compiler";
import { ImageMakerParams } from "../image-maker";
import { OrderInfo, OrderService } from "app/shared";
import { DialogService } from "app/dialogs/services/dialog.service";
import { OrderEditorComponent } from "../orders/order-editor/order-editor.component";
import { TdDynamicFormsComponent } from "app/shared/dynamic-forms/dynamic-forms.component";

export interface PrintData {
  readOnly: boolean;
  embedded: boolean;
  user?: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  },
  order: OrderInfo,
  client?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }
  specification: any[];
  totalPrice: number;

  currentDate: (format?: string) => string;
  renderImage: (params?: ImageMakerParams) => Observable<any>;

  // variables available to JS plugins
  planner: any;
  http: any;
  estimate: any;
}

@Component({
  selector: "app-print-dialog",
  templateUrl: "./print-dialog.component.html",
  styleUrls: ["./print-dialog.component.scss"]
})
export class PrintDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PrintData,
    private dialogRef: MatDialogRef<PrintDialogComponent>,
    private system: SystemService,
    private dialog: DialogService,
    private firm: OrderService
  ) {

  }

  reports$ = this.system.getTemplates().pipe(
    map(list => list.filter(t => t.type === ReportType.Print)),
    filter(list => list.length > 0),
    tap(list => this.reportControl.setValue(list[0].id))
  );
  reportControl = new FormControl(undefined);
  report$ = this.reportControl.valueChanges.pipe(
    filter(v => v),
    concatMap(id => this.system.getTemplate(id)),
    shareReplay(1)
  );

  @ViewChild(TdDynamicFormsComponent, { static: false }) form: TdDynamicFormsComponent;

  valid() {
    return this.reportControl.value && this.form && this.form.valid;
  }

  editOrder() {
    let config = { minWidth: '50%', data: this.data.order };
    this.dialog.open(OrderEditorComponent, config).afterClosed().pipe(
      filter(v => v),
      concatMap((order: OrderInfo) => this.firm.setOrder(order.id, order)),
    ).subscribe(order => {
      this.data.order = order;
      this.data.client = order.client;
    });
  }

  print(test: boolean) {
    let features = 'top=0,left=0,height=100%,width=auto';
    let printWindow = window.open('', '_blank', features);
    this.report$.subscribe(report => {
      this.doPrint(printWindow, report, {...this.data, form: this.form.value}, test);
    });
  }

  private async doPrint(printWindow: Window, report: Report, data: any, test?: boolean) {
    this.dialogRef.close();
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${report.name}</title>
          <style>page {
            display: block;
            position: relative;
            page-break-after: always;
          }</style>
          <style>${report.style}</style>
        </head>
        <body>${report.template}</body>
      </html>`);
    printWindow.document.close();
    let compile$ = from(compileTemplate(printWindow.document.body, data));
    let load$ = fromEvent(printWindow, 'load');
    combineLatest(compile$, load$).pipe(delay(100)).subscribe(_ => {
      if (!test) {
        printWindow.print();
        printWindow.close();
      }
    });
  }
}
