import { Component, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'td-dynamic-file-input',
  styleUrls: [ './dynamic-file-input.component.scss' ],
  templateUrl: './dynamic-file-input.component.html',
})
export class TdDynamicFileInputComponent {
  control: FormControl;
  required: boolean = undefined;
  label = '';
  name = '';
  hint = '';
  errorMessageTemplate: TemplateRef<any> = undefined;

  _handlefileDrop(value: File): void {
    this.control.setValue(value);
  }

}
