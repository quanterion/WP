import { Type } from '@angular/core';
import { NgModule, } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AppAlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { AppConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AppPromptDialogComponent } from './prompt-dialog/prompt-dialog.component';
import { DIALOG_PROVIDER } from './services/dialog.service';
import { AppMessageComponent } from './message/message.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppJobProgressBarComponent } from './job-progress-bar/job-progress-bar.component';

const APP_DIALOGS: Type<any>[] = [
  AppAlertDialogComponent,
  AppConfirmDialogComponent,
  AppPromptDialogComponent,
  AppMessageComponent,
  AppJobProgressBarComponent
];

const APP_DIALOGS_ENTRY_COMPONENTS: Type<any>[] = [
  AppAlertDialogComponent,
  AppConfirmDialogComponent,
  AppPromptDialogComponent
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  declarations: [
    APP_DIALOGS,
  ],
  exports: [
    APP_DIALOGS,
    MatDialogModule,
  ],
  providers: [
    DIALOG_PROVIDER,
  ],
  entryComponents: [
    APP_DIALOGS_ENTRY_COMPONENTS,
  ],
})
export class AppDialogsModule {

}
