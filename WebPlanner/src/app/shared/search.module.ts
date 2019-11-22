import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppSearchInputComponent } from './search-input/search-input.component';
import { AppSearchBoxComponent } from './search-box/search-box.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  declarations: [
    AppSearchInputComponent,
    AppSearchBoxComponent,
  ],
  exports: [
    AppSearchInputComponent,
    AppSearchBoxComponent,
  ],
})
export class SearchModule {

}
