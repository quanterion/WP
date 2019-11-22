import { Component, OnInit, Inject } from '@angular/core';
import { PreviewPipe, OrderService } from 'app/shared';
import { ProjectDetails } from '../project-details/project-details.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SystemService } from 'app/shared/system.service';
import { map, tap, catchError, concatMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PriceElement } from '../estimate';

export interface SendOrderResponse {
  ok: boolean;
  error?: string;
  redirectUrl?: string;
}

@Component({
  selector: 'app-order-sender',
  templateUrl: './order-sender.component.html',
  styleUrls: ['./order-sender.component.scss']
})
export class OrderSenderComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProjectDetails,
    private system: SystemService, private firm: OrderService,
    private dialogRef: MatDialogRef<OrderSenderComponent>,
  ) { }

  response$: Observable<SendOrderResponse>;

  ngOnInit() {
    let modelToJson = (m: PriceElement) => {
      return {
        id: m.modelId,
        sku: m.sku,
        name: m.name,
        description: m.description,
        price: m.price,
        cost: m.cost,
        entities: m.entities.map(e => e.uidStr),
        elements: m.elements.map(modelToJson)
      }
    }
    let thumbnail = new PreviewPipe().transform(this.data.file);
    thumbnail.replace(/^\./, window.location.origin)
    let request = {
      ...this.data.orderUrlParams,
      projectId: this.data.file.id,
      thumbnail,
      name: this.data.file.name,
      url: this.data.scriptInterface.project.url,
      products: this.data.estimate.models.map(modelToJson),
      price: this.data.estimate.price,
      revision: this.data.revision
    }

    let data = { price: this.data.estimate.price };
    this.response$ = this.firm.processOrder(this.data.file.id, data).pipe(
      concatMap(_ => {
        if (!this.data.orderUrl) {
          return of({ok: true} as SendOrderResponse);
        }
        return this.system.proxyPost<SendOrderResponse>(this.data.orderUrl, request);
      }),
      map(r => r || { ok: false, error: 'Сервер возвратил пустой ответ'}),
      tap(r => {
        if (r && r.ok) {
          if (r.redirectUrl) {
            setTimeout(_ => window.location.href = r.redirectUrl, 100);
          } else {
            setTimeout(_ => this.dialogRef.close(), 1000);
          }
        }
      }),
      catchError(error => {
        let message = `${error}`;
        if (error instanceof HttpErrorResponse) {
          message = error.message;
        }
        return of({ok: false, error: message});
      })
    );
  }

}
