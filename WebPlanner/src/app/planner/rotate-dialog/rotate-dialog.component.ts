import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rotate-dialog',
  templateUrl: './rotate-dialog.component.html',
  styleUrls: ['./rotate-dialog.component.scss']
})
export class RotateDialogComponent implements AfterViewInit {
  value = { angle: undefined, axis: 1 };

  constructor(private dialogRef: MatDialogRef<RotateDialogComponent>) { }

  @ViewChild('angleinput', { static: true }) _input: ElementRef;

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
