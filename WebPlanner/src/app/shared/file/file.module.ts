import { Type } from '@angular/core';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PortalModule } from '@angular/cdk/portal';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { TdFileSelectDirective } from './directives/file-select.directive';
import { TdFileDropDirective } from './directives/file-drop.directive';
import { TdFileUploadComponent } from './file-upload/file-upload.component';
import { TdFileInputComponent, TdFileInputLabelDirective } from './file-input/file-input.component';
import { TdFileService } from './services/file.service';
import { DownloadComponent } from './download/download.component';
import { MatProgressBarModule } from '@angular/material';
import { AppDialogsModule } from 'app/dialogs/dialogs.module';

const TD_FILE: Type<any>[] = [
  TdFileSelectDirective,
  TdFileDropDirective,
  TdFileUploadComponent,
  TdFileInputComponent,
  TdFileInputLabelDirective,
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    PortalModule,
    MatProgressBarModule,
    AppDialogsModule,
  ],
  declarations: [
    TD_FILE,
    DownloadComponent
  ],
  exports: [
    TD_FILE,
  ],
  providers: [
    TdFileService,
  ],
  entryComponents: [
    DownloadComponent
  ]
})
export class CovalentFileModule {}
