import {
  AfterViewInit,
  AfterContentChecked,
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { EMPTY_COLOR, AppColorPickerOption } from './color-picker';

@Component({
  selector: 'app-color-picker-collection',
  templateUrl: './color-picker-collection.component.html',
  styleUrls: ['./color-picker-collection.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppColorPickerCollectionComponent implements AfterContentChecked {
  /**
   * Hide empty slots
   * Empty slots are the difference between the collection size and limit
   */
  @Input()
  set hideEmpty(value: boolean) {
    this._hideEmpty = coerceBooleanProperty(value);
  }
  private _hideEmpty = false;

  /**
   * Name of the collection
   */
  @Input()
  get label(): string {
    return this._label;
  }
  set label(value: string) {
    this._label = value;
  }
  private _label: string;

  /**
   * Array of colors to be displayed
   */
  @Input()
  get colors(): AppColorPickerOption[] {
    return this._colors;
  }
  set colors(values: AppColorPickerOption[]) {
    this._colors = values;
  }
  private _colors: AppColorPickerOption[];

  /**
   * Size limit of the collection
   */
  @Input() size = 30;

  /**
   * Show transparent option
   */
  @Input() transparent = false;

  /**
   * Emit selected color value
   */
  @Output() changeColor: EventEmitter<string> = new EventEmitter<string>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngAfterContentChecked() {
    if (this._colors && this._colors.length !== this.size) {
      this._colors = this._colors
        .slice(0, this.size)
        .concat(new Array(this._getCollectionDiffSize()));
      this.changeDetectorRef.markForCheck();
    }
  }

  /**
   * Return the difference between the limit and the collection size.
   * Always return 0 when hideEmpty is true
   * @returns number
   */
  private _getCollectionDiffSize(): number {
    if (this._colors.length > this.size || this._hideEmpty) {
      return 0;
    }

    return this.size - this._colors.length;
  }

  /**
   * Remove color
   */
  setTransparent(): void {
    this.changeColor.emit(EMPTY_COLOR);
  }

  /**
   * Emit selected color value
   * @param option AppColorPickerOption
   */
  setColor(option: AppColorPickerOption) {
    const color = typeof option === 'string' ? option : option.value;
    this.changeColor.emit(color);
  }
}
