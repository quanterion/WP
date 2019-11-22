import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.scss' ],
})
export class AppPromptDialogComponent implements AfterViewInit {
  title: string;
  message: string;
  value: string;

  @ViewChild('input', { static: true }) _input: ElementRef;

  constructor(private _dialogRef: MatDialogRef<AppPromptDialogComponent>) {}

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
  handleInputFocus(): void {
    (<HTMLInputElement>this._input.nativeElement).select();
  }

  cancel(): void {
    this._dialogRef.close(undefined);
  }

  accept(): void {
    this._dialogRef.close(this.value);
  }
}
