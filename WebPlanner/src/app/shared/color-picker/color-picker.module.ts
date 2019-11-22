import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AppColorPickerService } from './color-picker.service';

import { AppColorPickerComponent } from './color-picker.component';
import { AppColorPickerSelectorComponent } from './color-picker-selector.component';
import { AppColorPickerCollectionComponent } from './color-picker-collection.component';
import {
  AppConnectedColorPickerDirective,
  AppColorPickerOriginDirective,
  AppColorPickerOptionDirective,
  AppColorPickerTriggerDirective
} from './color-picker.directives';

@NgModule({
  imports: [
    CommonModule,
    PortalModule,
    OverlayModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [
    AppColorPickerComponent,
    AppConnectedColorPickerDirective,
    AppColorPickerSelectorComponent,
    AppColorPickerOriginDirective,
    AppColorPickerOptionDirective,
    AppColorPickerCollectionComponent,
    AppColorPickerTriggerDirective
  ],
  exports: [
    AppColorPickerComponent,
    AppConnectedColorPickerDirective,
    AppColorPickerOriginDirective,
    AppColorPickerCollectionComponent,
    AppColorPickerTriggerDirective
  ],
  providers: [AppColorPickerService],
})
export class AppColorPickerModule { }
