import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderInfo } from 'app/shared';
import { ClientEditorComponent } from '../client-editor/client-editor.component';

@Component({
  selector: 'app-order-editor',
  templateUrl: './order-editor.component.html',
  styleUrls: ['./order-editor.component.scss']
})
export class OrderEditorComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<OrderEditorComponent>,
      @Inject(MAT_DIALOG_DATA) public order: OrderInfo) {
  }

  ngOnInit() {
  }

  @ViewChild(ClientEditorComponent, { static: true }) clientEditor?: ClientEditorComponent;

  sendOrder() {
    if (this.clientEditor.form.valid) {
      this.order.client = this.order.client || this.clientEditor.form.value;
      let newOrder = { ...this.order };
      if (newOrder.client && this.clientEditor) {
        newOrder.client = this.clientEditor.client;
      }
      this.dialogRef.close(newOrder);
    }
  }

}
