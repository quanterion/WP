import { Pipe, PipeTransform } from '@angular/core';

export function roundFloat(value: number, digits = 1) {
  let mul = 10;
  if (digits !== 1) {
    mul = Math.pow(10, digits);
  }
  return Math.round(value * mul) / mul;
}

@Pipe({ name: 'float' })
export class FloatPipe implements PipeTransform {
  transform(value?: number) {
    return typeof value === 'number' ? roundFloat(value) : '';
  }
}
