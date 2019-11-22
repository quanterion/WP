import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wpTimeAgo',
})
export class WpTimeAgoPipe implements PipeTransform {
  transform(time: any, reference?: any): string {
    // Convert time to date object if not already
    time = new Date(time);
    let ref = new Date(reference);

    // If not a valid timestamp, return 'Invalid Date'
    if (!time.getTime()) {
      return 'Invalid Date';
    }

    // For unit testing, we need to be able to declare a static start time
    // for calculations, or else speed of tests can bork.
    let startTime = isNaN(ref.getTime()) ? Date.now() : ref.getTime();
    let diff = Math.floor((startTime - time.getTime()) / 1000);

    if (diff < 2) {
      return '1 секунду назад';
    }
    if (diff < 60) {
      return Math.floor(diff) + ' секунд назад';
    }
    // Minutes
    diff = diff / 60;
    if (diff < 2) {
      return '1 минуту назад';
    }
    if (diff < 60) {
      return Math.floor(diff) + ' минут назад';
    }
    // Hours
    diff = diff / 60;
    if (diff < 2) {
      return '1 час назад';
    }
    if (diff < 24) {
      return Math.floor(diff) + ' часов назад';
    }
    return time.toLocaleDateString();
  }
}
