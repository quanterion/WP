import { Component, Input, Renderer2, ElementRef, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class AppMessageComponent {

  private _color: string;

  @Input() label: string;
  @Input() icon = 'info_outline';
  @Input()
  set color(color: string) {
    this._renderer.removeClass(this._elementRef.nativeElement, 'mat-' + this._color);
    this._renderer.addClass(this._elementRef.nativeElement, 'mat-' + color);
    this._color = color;
    this._changeDetectorRef.markForCheck();
  }
  get color(): string {
    return this._color;
  }

  constructor(private _renderer: Renderer2,
              private _changeDetectorRef: ChangeDetectorRef,
              private _elementRef: ElementRef) {
    this._renderer.addClass(this._elementRef.nativeElement, 'app-message');
  }
}
