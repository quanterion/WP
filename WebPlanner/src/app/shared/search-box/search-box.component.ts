import { Component, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { trigger, state, style, transition, animate, AUTO_STYLE } from '@angular/animations';
import { AppSearchInputComponent } from '../search-input/search-input.component';
import { mixinControlValueAccessor, IControlValueAccessor } from '../control-value-accesor.mixin';

export class AppSearchBoxBase {
  constructor(public _changeDetectorRef: ChangeDetectorRef) { }
}

/* tslint:disable-next-line */
export const _AppSearchBoxMixinBase = mixinControlValueAccessor(AppSearchBoxBase);

@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppSearchBoxComponent),
    multi: true,
  }],
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  //inputs: ['value'],
  animations: [
    trigger('inputState', [
      state('0', style({
        width: '0%',
        margin: '0px',
      })),
      state('1',  style({
        width: '100%',
        margin: AUTO_STYLE,
      })),
      transition('0 => 1', animate('200ms ease-in')),
      transition('1 => 0', animate('200ms ease-out')),
    ]),
  ],
})
export class AppSearchBoxComponent extends _AppSearchBoxMixinBase implements IControlValueAccessor {

  private _searchVisible = false;
  @ViewChild(AppSearchInputComponent, { static: true }) _searchInput: AppSearchInputComponent;

  get searchVisible(): boolean {
    return this._searchVisible;
  }

  @Input() backIcon = 'search';
  @Input() searchIcon = 'search';
  @Input() clearIcon = 'cancel';
  @Input() showUnderline = false;
  @Input() debounce = 400;
  @Input() alwaysVisible = false;
  @Input() placeholder: string;
  @Output() searchDebounce: EventEmitter<string> = new EventEmitter<string>();
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  @Output() clear: EventEmitter<void> = new EventEmitter<void>();
  @Output() blur: EventEmitter<void> = new EventEmitter<void>();

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  /**
   * Method executed when the search icon is clicked.
   */
  searchClicked(): void {
    if (!this.alwaysVisible && this._searchVisible) {
      this.value = '';
      this.handleClear();
    } else if (this.alwaysVisible || !this._searchVisible) {
      this._searchInput.focus();
    }
    this.toggleVisibility();
  }

  toggleVisibility(): void {
    this._searchVisible = !this._searchVisible;
    this._changeDetectorRef.markForCheck();
  }

  handleSearchDebounce(value: string): void {
    this.searchDebounce.emit(value);
  }

  handleSearch(value: string): void {
    this.search.emit(value);
  }

  handleClear(): void {
    this.clear.emit(undefined);
  }

  handleBlur(): void {
    this.blur.emit(undefined);
  }
}
