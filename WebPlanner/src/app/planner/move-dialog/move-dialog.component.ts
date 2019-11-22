import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-move-dialog',
  templateUrl: './move-dialog.component.html',
  styleUrls: ['./move-dialog.component.scss']
})
export class MoveDialogComponent implements AfterViewInit {
  value = [undefined, undefined, undefined];

  constructor(private dialogRef: MatDialogRef<MoveDialogComponent>) { }

  @ViewChild('xinput', { static: true }) _input: ElementRef;

  ngAfterViewInit(): void {
    // focus input once everything is rendered and good to go
    Promise.resolve().then(() => {
      (<HTMLInputElement>this._input.nativeElement).focus();
    });
  }

  /**
   * Method executed when input is focused
   * Selects all text
   */
  handleInputFocus(input: HTMLInputElement): void {
    input.select();
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  accept(): void {
    this.dialogRef.close(this.value);
  }

}
