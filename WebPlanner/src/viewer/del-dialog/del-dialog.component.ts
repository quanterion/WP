import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-del-dialog',
  templateUrl: './del-dialog.component.html',
  styleUrls: ['./del-dialog.component.css']
})
export class DelDialogComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<DelDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public name: string) {}

  ngOnInit() {
  }

close() {
    this.dialogRef.close();
}


}
