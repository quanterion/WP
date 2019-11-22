import { Injectable } from '@angular/core';
import { coerceHexaColor, isValidColor } from './color-picker';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable()
export class AppColorPickerService {
  /**
   * Array of all used colors
   */
  private _colors: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  /**
   * Add new color to used colors
   * @param color string
   */
  addColor(color: string): void {
    if (!color || !isValidColor(color)) {
      return;
    }

    color = coerceHexaColor(color);

    const colors = this._colors.getValue();
    if (!colors.find(_color => _color === color)) {
      colors.push(color);
      this._colors.next(colors);
    }
  }

  /**
   * Return Observable of colors
   */
  getColors(): Observable<string[]> {
    return this._colors.asObservable();
  }
}
