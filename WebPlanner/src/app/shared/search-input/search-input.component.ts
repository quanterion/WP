import { Component, ViewChild, OnInit, Input, Output, EventEmitter, Optional,
         ChangeDetectionStrategy, ChangeDetectorRef, forwardRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Dir } from '@angular/cdk/bidi';
import { MatInput } from '@angular/material/input';
import { debounceTime, skip } from 'rxjs/operators';
import { mixinControlValueAccessor, IControlValueAccessor } from '../control-value-accesor.mixin';

export class AppSearchInputBase {
  constructor(public _changeDetectorRef: ChangeDetectorRef) { }
}

/* tslint:disable-next-line */
export const _AppSearchInputMixinBase = mixinControlValueAccessor(AppSearchInputBase);

@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppSearchInputComponent),
    multi: true,
  }],
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  //inputs: ['value'],
  animations: [
    trigger('searchState', [
      state('hide-left', style({
        transform: 'translateX(-150%)',
        display: 'none',
      })),
      state('hide-right', style({
        transform: 'translateX(150%)',
        display: 'none',
      })),
      state('show',  style({
        transform: 'translateX(0%)',
        display: 'block',
      })),
      transition('* => show', animate('200ms ease-in')),
      transition('show => *', animate('200ms ease-out')),
    ]),
  ],
})
export class AppSearchInputComponent extends _AppSearchInputMixinBase implements IControlValueAccessor, OnInit {

  @ViewChild(MatInput, { static: true }) _input: MatInput;

  @Input() showUnderline = false;
  @Input() debounce = 400;
  @Input() placeholder: string;
  @Input() clearIcon = 'cancel';
  @Output() searchDebounce: EventEmitter<string> = new EventEmitter<string>();
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  @Output() clear: EventEmitter<void> = new EventEmitter<void>();
  @Output() blur: EventEmitter<void> = new EventEmitter<void>();

  get isRTL(): boolean {
    if (this._dir) {
      return this._dir.dir === 'rtl';
    }
    return false;
  }

  constructor(@Optional() private _dir: Dir,
              _changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  ngOnInit(): void {
    this._input.ngControl.valueChanges.pipe(
      debounceTime(this.debounce),
      skip(1), // skip first change when value is set to undefined
    ).subscribe((value: string) => {
      this._searchTermChanged(value);
    });
  }

  /**
   * Method to focus to underlying input.
   */
  focus(): void {
    this._input.focus();
  }

  handleBlur(): void {
    this.blur.emit(undefined);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  handleSearch(event: Event): void {
    this.stopPropagation(event);
    this.search.emit(this.value);
  }

  /**
   * Method to clear the underlying input.
   */
  clearSearch(): void {
    this.value = '';
    this._changeDetectorRef.markForCheck();
    this.clear.emit(undefined);
  }

  private _searchTermChanged(value: string): void {
    this.searchDebounce.emit(value);
  }

}
