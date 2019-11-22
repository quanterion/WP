import { Component, AfterViewInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CopyParams } from 'modeler/project-handler';

@Component({
  selector: 'app-copy-dialog',
  templateUrl: './copy-dialog.component.html',
  styleUrls: ['./copy-dialog.component.scss']
})
export class CopyDialogComponent implements AfterViewInit {

  value = new CopyParams();

  constructor(private dialogRef: MatDialogRef<CopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public axis: number) { }

  @ViewChild('countinput', { static: true }) _countinput: ElementRef;

  ngAfterViewInit(): void {
    // focus input once everything is rendered and good to go
    Promise.resolve().then(() => {
      (<HTMLInputElement>this._countinput.nativeElement).focus();
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
