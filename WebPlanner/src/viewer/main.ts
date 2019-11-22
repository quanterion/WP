import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ViewerModule } from './viewer.module';
import { environment } from 'environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(ViewerModule)
  .catch(err => console.log(err));
