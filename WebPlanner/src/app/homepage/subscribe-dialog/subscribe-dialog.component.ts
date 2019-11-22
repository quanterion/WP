import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

interface SubscribeResponse {
  ok: boolean;
  email: string;
}

@Component({
  selector: 'app-subscribe-dialog',
  templateUrl: './subscribe-dialog.component.html',
  styleUrls: ['./subscribe-dialog.component.scss']
})
export class SubscribeDialogComponent implements OnInit {

  info = { name: "", phone: "", email: "" }

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private dialogRef: MatDialogRef<SubscribeDialogComponent>) { }

  ngOnInit() {
  }

  subscribe() {
    let showError = () => this.snackBar.open(`Failed to subscribe. Please try again`);
    this.http.post<SubscribeResponse>('/api/firm/evaluate', this.info).subscribe(
      result => {
        if (result.ok) {
          this.snackBar.open(`Success!`);
          this.dialogRef.close();
        } else {
          showError();
        }
      },
      error => showError()
    );
  }

}
