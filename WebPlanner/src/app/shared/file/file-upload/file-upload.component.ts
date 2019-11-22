import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ContentChild, ChangeDetectorRef,
  forwardRef } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TdFileInputComponent, TdFileInputLabelDirective } from '../file-input/file-input.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { mixinControlValueAccessor, IControlValueAccessor } from 'app/shared/control-value-accesor.mixin';
import { ICanDisable, mixinDisabled } from 'app/shared/disabled.mixin';

export class TdFileUploadBase {
  constructor(public _changeDetectorRef: ChangeDetectorRef) {}
}

/* tslint:disable-next-line */
export const _TdFileUploadMixinBase = mixinControlValueAccessor(mixinDisabled(TdFileUploadBase));

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TdFileUploadComponent),
    multi: true,
  }],
  selector: 'td-file-upload',
  /* tslint:disable-next-line */
  inputs: ['disabled', 'value'],
  styleUrls: ['./file-upload.component.scss'],
  templateUrl: './file-upload.component.html',
})
export class TdFileUploadComponent extends _TdFileUploadMixinBase implements IControlValueAccessor, ICanDisable {

  private _multiple = false;
  private _required = false;

  @ViewChild(TdFileInputComponent, { static: false }) fileInput: TdFileInputComponent;

  @ContentChild(TdFileInputLabelDirective, { static: false }) inputLabel: TdFileInputLabelDirective;

  /**
   * defaultColor?: string
   * Sets browse button color. Uses same color palette accepted as [MatButton] and defaults to 'primary'.
   */
  @Input() defaultColor = 'primary';

  /**
   * activeColor?: string
   * Sets upload button color. Uses same color palette accepted as [MatButton] and defaults to 'accent'.
   */
  @Input() activeColor = 'accent';

  /**
   * cancelColor?: string
   * Sets cancel button color. Uses same color palette accepted as [MatButton] and defaults to 'warn'.
   */
  @Input() cancelColor = 'warn';

  /**
   * multiple?: boolean
   * Sets if multiple files can be dropped/selected at once in [TdFileUploadComponent].
   */
  @Input()
  set multiple(multiple: boolean) {
    this._multiple = coerceBooleanProperty(multiple);
  }
  get multiple(): boolean {
    return this._multiple;
  }

  /**
   * required?: boolean
   * Forces at least one file upload.
   * Defaults to 'false'
   */
  @Input('required')
  set required(required: boolean) {
    this._required = coerceBooleanProperty(required);
  }
  get required(): boolean {
    return this._required;
  }

  /**
   * accept?: string
   * Sets files accepted when opening the file browser dialog.
   * Same as 'accept' attribute in <input/> element.
   */
  @Input() accept: string;

  /**
   * select?: function
   * Event emitted when a file is selected.
   * Emits a [File | FileList] object.
   */
  @Output() select: EventEmitter<File | FileList> = new EventEmitter<File | FileList>();

  /**
   * upload?: function
   * Event emitted when upload button is clicked.
   * Emits a [File | FileList] object.
   */
  @Output() upload: EventEmitter<File | FileList> = new EventEmitter<File | FileList>();

  @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  /**
   * Method executed when upload button is clicked.
   */
  uploadPressed(): void {
    if (this.value) {
      this.upload.emit(this.value);
    }
  }

  /**
   * Method executed when a file is selected.
   */
  handleSelect(value: File | FileList): void {
    this.value = value;
    this.select.emit(value);
  }

  /**
   * Methods executed when cancel button is clicked.
   * Clears files.
   */
  cancel(): void {
    this.value = undefined;
    this.canceled.emit(undefined);
    // check if the file input is rendered before clearing it
    if (this.fileInput) {
      this.fileInput.clear();
    }
  }

  /** Method executed when the disabled value changes */
  onDisabledChange(v: boolean): void {
    if (v) {
      this.cancel();
    }
  }
}
