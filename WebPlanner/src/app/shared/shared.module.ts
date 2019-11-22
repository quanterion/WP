import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PriceListsComponent } from './price-lists/price-lists.component';
import { PricelistDetailComponent } from './pricelist-detail/pricelist-detail.component';
import { ThumbnailPipe, BumpThumbnailPipe, BumpmapPipe, TexturePipe } from './catalog.service';
import { PreviewPipe } from './files.service';
import { FloatPipe } from './units.service';
import { WpTimeAgoPipe } from './time-ago.pipe';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatProgressBar } from '@angular/material/progress-bar';
import { WaitDirective } from './wait.directive';
import { SearchModule } from './search.module';
import { WpBytesPipe } from './bytes.pipe';
import { CovalentFileModule } from './file/file.module';
import { CovalentDynamicFormsModule } from './dynamic-forms/dynamic-forms.module';

@NgModule({
  declarations: [
    // pipes
    ThumbnailPipe,
    BumpThumbnailPipe,
    BumpmapPipe,
    TexturePipe,
    PreviewPipe,
    FloatPipe,
    WpTimeAgoPipe,
    WpBytesPipe,
    PriceListsComponent,
    PricelistDetailComponent,
    WaitDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    CovalentDynamicFormsModule,
    CovalentFileModule,
    SearchModule,
    RouterModule
  ],
  exports: [
    ThumbnailPipe,
    BumpThumbnailPipe,
    BumpmapPipe,
    TexturePipe,
    PreviewPipe,
    FloatPipe,
    WpTimeAgoPipe,
    WpBytesPipe,
    WaitDirective,
    PriceListsComponent,
    PricelistDetailComponent,
    MaterialModule,
    CovalentDynamicFormsModule,
    CovalentFileModule,
    FlexLayoutModule,
    SearchModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    MatProgressBar,
    PricelistDetailComponent,
  ]
})
export class SharedModule { }
