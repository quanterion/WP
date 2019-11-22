import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppColorPickerComponent } from './color-picker.component';
import { EMPTY_COLOR, coerceHexaColor, isValidColor, AppColorPickerOption } from './color-picker';
import { BehaviorSubject, Subscription } from 'rxjs';

/**
 * This directive change the background of the button
 */
@Directive({
  selector: '[appColorPickerOption], [app-color-picker-option]',
  exportAs: 'appColorPickerOption',
})
export class AppColorPickerOptionDirective implements AfterViewInit {
  /**
   * Receive the color
   */
  @Input('appColorPickerOption')
  get color(): AppColorPickerOption {
    return this._color;
  }
  set color(value: AppColorPickerOption) {
    this._color = value;
  }
  private _color: AppColorPickerOption = EMPTY_COLOR;

  constructor(private elementRef: ElementRef, private render: Renderer2) {}

  ngAfterViewInit() {
    if (this.color) {
      let color: string;
      if (typeof this.color === 'string') {
        color = this.color;
      } else {
        color = this.color.value;
        this.render.setAttribute(this.elementRef.nativeElement, 'aria-label', this.color.text);
      }

      if (isValidColor(color)) {
        // apply the color
        this.render.setStyle(this.elementRef.nativeElement, 'background', coerceHexaColor(color));
      }
    }
  }
}

/**
 * Directive applied to an element to make it usable as an origin for an ColorPicker.
 */
@Directive({
  selector: '[app-color-picker-origin], [appColorPickerOrigin]',
  exportAs: 'appColorPickerOrigin',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppColorPickerOriginDirective),
      multi: true,
    },
  ],
})
export class AppColorPickerOriginDirective implements ControlValueAccessor {
  /**
   * Emit changes from the origin
   */
  @Output() change: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Propagate changes to angular
   */
  propagateChanges: (_: any) => {};

  /**
   * Reference to the element on which the directive is applied.
   */
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    // listen changes onkeyup and update color picker
    renderer.listen(elementRef.nativeElement, 'keyup', (event: KeyboardEvent) => {
      const value: string = event.currentTarget['value'];
      if (event.isTrusted && isValidColor(value)) {
        this.writeValueFromKeyup(coerceHexaColor(value));
      } else {
        this.writeValueFromKeyup(EMPTY_COLOR);
      }
    });
  }

  /**
   * This method will be called by the forms API to write to the view when
   * programmatic (model -> view) changes are requested.
   */
  writeValue(color: string) {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', color);
    this.change.next(color);
    if (this.propagateChanges) {
      this.propagateChanges(color);
    }
  }

  /**
   * This method will be called by the color picker
   */
  writeValueFromColorPicker(color: string) {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', color);
    this.propagateChanges(color);
  }

  /**
   * This method will be called from origin whe key is up
   */
  writeValueFromKeyup(color: string) {
    this.change.next(color);
    this.propagateChanges(color);
  }

  /**
   * This is called by the forms API on initialization so it can update the
   * form model when values propagate from the view (view -> model).
   * @param fn any
   */
  registerOnChange(fn: any): void {
    this.propagateChanges = fn;
  }

  /**
   * This is called by the forms API on initialization so it can update the form model on blur
   * @param fn any
   */
  registerOnTouched(fn: any): void {}

  /**
   * called by the forms API when the control status changes to or from "DISABLED"
   * @param isDisabled boolean
   */
  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }
}

/**
 * Directive connect an color picker with any input, select or textarea.
 * The color picker will be automatically updated when the value of the origin is
 * changed.
 */
@Directive({
  selector: '[app-connected-color-picker], [appConnectedColorPicker]',
  exportAs: 'appConnectedColorPicker',
})
export class AppConnectedColorPickerDirective implements AfterViewInit, OnDestroy {
  /**
   * Origin of the connected color picker
   */
  @Input() appConnectedColorPickerOrigin: AppColorPickerOriginDirective;

  /**
   * Color picker subscription
   */
  private _colorPickerSub: Subscription;

  /**
   * Origin subscription
   */
  private _originSub: Subscription;

  constructor(
    private colorPicker: AppColorPickerComponent,
    public changeDetectorRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    if (!this._colorPickerSub) {
      this._attachColorPicker();
    }
  }

  ngOnDestroy() {
    if (this._colorPickerSub && !this._colorPickerSub.closed) {
      this._colorPickerSub.unsubscribe();
    }
    if (this._originSub && !this._originSub.closed) {
      this._originSub.unsubscribe();
    }
  }

  /**
   * Attach color picker and origin
   */
  private _attachColorPicker(): void {
    // subscribe to origin change to update color picker
    this._originSub = this.appConnectedColorPickerOrigin.change.subscribe(value => {
      this.colorPicker.selectedColor = value;
      this.changeDetectorRef.detectChanges();
    });

    // subscribe to color picker changes and set on origin element
    this._colorPickerSub = this.colorPicker.change.subscribe(value =>
      this.appConnectedColorPickerOrigin.writeValueFromColorPicker(value)
    );
  }
}

@Directive({
  selector: `[appColorTriggerFor]`,
  exportAs: 'appColorTriggerFor'
})
export class AppColorPickerTriggerDirective {
  /** References the picker instance that the trigger is associated with. */
  @Input() appColorTriggerFor: AppColorPickerComponent;

  @HostBinding('attr.aria-haspopup') hasPopup = true;

  /** Handles click events on the trigger. */
  @HostListener('click', ['$event'])
  _handleClick(event: MouseEvent): void {
    if (this.appColorTriggerFor) {
      this.appColorTriggerFor.toggle();
    }
  }
}
