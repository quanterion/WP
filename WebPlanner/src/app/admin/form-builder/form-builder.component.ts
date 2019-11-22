import { Component, OnInit, Input } from '@angular/core';
import { ITdDynamicElementConfig, TdDynamicElement, TdDynamicType } from 'app/shared/dynamic-forms/services/dynamic-forms.service';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() label?: string;
  @Input() elements: ITdDynamicElementConfig[] = [];

  isMinMaxSupported(type: TdDynamicElement | TdDynamicType) {
    return type === TdDynamicElement.Slider || type === TdDynamicType.Number || this.isDate(type);
  }

  isDate(type: TdDynamicElement | TdDynamicType): boolean {
    return type === TdDynamicElement.Datepicker;
  }

  isMinMaxLengthSupported(type: TdDynamicElement | TdDynamicType) {
    return type === TdDynamicElement.Input || type === TdDynamicType.Text;
  }

  isBool(type: TdDynamicElement | TdDynamicType) {
    return type === TdDynamicElement.Checkbox
      || type === TdDynamicType.Boolean
      || type === TdDynamicElement.SlideToggle;
  }

  addElement(type: any) {
    let name = 'value' + (this.elements.length + 1);
    this.elements.push({ name, label: name, type, required: false });
  }

  deleteElement(index: number): void {
    this.elements.splice(index, 1);
  }

}
