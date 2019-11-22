import { Injectable, LOCALE_ID, Inject } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private english = true;
  constructor(@Inject(LOCALE_ID) locale: string) {
    this.english = locale === 'en-US';
  }

  _(value: string) {
    if (!this.english) {
        value = data[value];
    }
    return value;
  }
}

let data = {
    "mm": "мм"
}
