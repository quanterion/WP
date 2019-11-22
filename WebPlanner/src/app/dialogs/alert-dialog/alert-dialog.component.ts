import { Component } from '@angular/core';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss' ],
})
export class AppAlertDialogComponent {
  title: string;
  message: string;
}
