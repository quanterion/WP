import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'td-dynamic-slide-toggle',
  styleUrls: [ './dynamic-slide-toggle.component.scss' ],
  templateUrl: './dynamic-slide-toggle.component.html',
})
export class TdDynamicSlideToggleComponent {
  control: FormControl;
  label = '';
  name = '';
  hint = '';
  required = false;
}
