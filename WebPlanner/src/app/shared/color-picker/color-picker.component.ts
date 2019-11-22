import {
  AfterContentInit,
  Component,
  ContentChildren,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  QueryList,
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AppColorPickerCollectionComponent } from './color-picker-collection.component';
import { AppColorPickerService } from './color-picker.service';
import { EMPTY_COLOR, coerceHexaColor } from './color-picker';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppColorPickerComponent implements AfterContentInit, OnInit, OnDestroy {
  /**
   * Get all collections
   */
  @ContentChildren(AppColorPickerCollectionComponent)
  _collections: QueryList<AppColorPickerCollectionComponent>;

  /**
   * Change label of the collection UsedColors
   */
  @Input()
  get usedColorLabel(): string {
    return this._usedColorLabel;
  }
  set usedColorLabel(value: string) {
    this._usedColorLabel = value;
  }
  private _usedColorLabel = 'Used Colors';

  /**
   * Set initial value for used color
   */
  @Input()
  set usedColorStart(colors: string[]) {
    if (colors && colors.length > 0) {
      for (const color of colors) {
        this.colorPickerService.addColor(color);
      }
    }
  }

  /**
   * Hide empty slots from the collection UsedColors
   */
  @Input('hideEmptyUsedColors')
  get hideEmpty(): boolean {
    return this._hideEmpty;
  }
  set hideEmpty(value: boolean) {
    this._hideEmpty = coerceBooleanProperty(value);
  }
  private _hideEmpty = false;

  /**
   * Hide UsedColors collection
   */
  @Input('hideUsedColors')
  get hideUsedColors(): boolean {
    return this._hideUsedColors;
  }
  set hideUsedColors(value: boolean) {
    this._hideUsedColors = coerceBooleanProperty(value);
  }
  private _hideUsedColors = false;

  /**
   * Start with a color selected
   */
  @Input()
  get selectedColor(): string {
    return this._selectedColor;
  }
  set selectedColor(value: string) {
    value = coerceHexaColor(value);
    if (this._selectedColor !== value) {
      this.changeDetectorRef.markForCheck();
      this.updateTmpSelectedColor(value, true);
    }
    this._selectedColor = coerceHexaColor(value);
  }
  private _selectedColor = '';

  /**
   * Define if the panel will be initiated open
   */
  @Input()
  get isOpen(): boolean {
    return this._isOpen;
  }
  set isOpen(value: boolean) {
    this._isOpen = coerceBooleanProperty(value);
  }
  private _isOpen = false;

  /**
   * Define if the panel will show in overlay or not
   */
  @Input()
  get overlay(): boolean {
    return this._overlay;
  }
  set overlay(value: boolean) {
    this._overlay = coerceBooleanProperty(value);
  }
  private _overlay = true;

  /**
   * Hide the action buttons (cancel/confirm)
   */
  @Input()
  get hideButtons(): boolean {
    return this._hideButtons;
  }
  set hideButtons(value: boolean) {
    this._hideButtons = coerceBooleanProperty(value);
  }
  private _hideButtons = false;

  /**
   * Set the size of the used colors
   */
  @Input() usedSizeColors = 30;

  /**
   * Change btnCancel label
   */
  @Input() btnCancel = 'Cancel';

  /**
   * Change btnConfirm label
   */
  @Input() btnConfirm = 'Confirm';

  /**
   * Event emitted when user change the selected color (without confirm)
   */
  @Output() change = new EventEmitter();

  /**
   * Event emitted when selected color is confirm
   */
  @Output() selected = new EventEmitter();

  /**
   * Event emitted when is clicked outside of the component
   */
  @Output() clickOut = new EventEmitter();

  /**
   * Return a Observable with the color the user is picking
   */
  get tmpSelectedColor$(): Observable<string> {
    return this._tmpSelectedColor.asObservable();
  }
  private _tmpSelectedColor: BehaviorSubject<string>;

  /**
   * Array of subscriptions from the collections
   */
  private _collectionSubs: Subscription[] = [];

  /**
   * Observable with all the colors used by the user
   */
  usedColors$: Observable<string[]>;

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private colorPickerService: AppColorPickerService
  ) { }

  ngOnInit() {
    this.usedColors$ = this.colorPickerService.getColors();
    this._tmpSelectedColor = new BehaviorSubject<string>(this._selectedColor);
  }

  /**
   * Walk throw all collections and subcribe to changes
   */
  ngAfterContentInit() {
    if (this._collections) {
      this._collections.forEach((collection: AppColorPickerCollectionComponent) => {
        const subscription = collection.changeColor.subscribe(color => {
          this.updateTmpSelectedColor(color);
        });

        this._collectionSubs.push(subscription);
      });
    }
  }

  /**
   * Destroy all subscriptions
   */
  ngOnDestroy() {
    if (this._collectionSubs) {
      this._collectionSubs.forEach((subscription: Subscription) => {
        if (subscription && !subscription.closed) {
          subscription.unsubscribe();
        }
      });
    }
  }

  /**
   * Update selected color and emit the change
   */
  private _updateSelectedColor() {
    if (this._isOpen || !this.overlay) {
      const tmpSelectedColor = this._tmpSelectedColor.getValue();
      if (this._selectedColor !== tmpSelectedColor) {
        this._selectedColor = tmpSelectedColor;
        this.selected.next(this._selectedColor);
      } else {
        this.selected.emit(this._selectedColor);
      }
    }
  }

  /**
   * Open/close color picker panel
   */
  toggle() {
    this._isOpen = !this._isOpen;
    if (!this._isOpen && this._selectedColor !== EMPTY_COLOR) {
      this.colorPickerService.addColor(this._selectedColor);
    }
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Update selected color, close the panel and notify the user
   */
  backdropClick(): void {
    this.confirmSelectedColor();
    this.clickOut.emit(null);
  }

  updateTmpSelectedColor(color: string, external = false) {
    if (color && this._tmpSelectedColor) {
      this._tmpSelectedColor.next(color);
      if (!external) {
        this.change.next(color);
      }
      if (this._hideButtons) {
        this._updateSelectedColor();
      }
    }
  }

  /**
   * Cancel the selection and close the panel
   */
  cancelSelection() {
    this.selected.emit(this._selectedColor);
    this.toggle();
  }

  /**
   * Update selectedColor and close the panel
   */
  confirmSelectedColor() {
    this._updateSelectedColor();
    this.toggle();
  }
}
