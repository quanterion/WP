import { Injectable, Provider, SkipSelf, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

import { AppAlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { AppConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AppPromptDialogComponent } from '../prompt-dialog/prompt-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface IDialogConfig extends MatDialogConfig {
  title?: string;
  message: string;
}

export interface IPromptConfig extends IDialogConfig {
  value?: string;
}

@Injectable()
export class DialogService {

  constructor(private _dialogService: MatDialog, public snackBar: MatSnackBar) {}

  open<T>(component: ComponentType<T>, config?: MatDialogConfig): MatDialogRef<T> {
    return this._dialogService.open(component, config);
  }

  closeAll(): void {
    this._dialogService.closeAll();
  }

  openAlert(config: IDialogConfig): MatDialogRef<AppAlertDialogComponent> {
    let dialogConfig: MatDialogConfig = this._createConfig(config);
    let dialogRef: MatDialogRef<AppAlertDialogComponent> =
      this._dialogService.open(AppAlertDialogComponent, dialogConfig);
    let alertDialogComponent: AppAlertDialogComponent = dialogRef.componentInstance;
    alertDialogComponent.title = config.title;
    alertDialogComponent.message = config.message;
    return dialogRef;
  }

  openConfirm(config: IDialogConfig): MatDialogRef<AppConfirmDialogComponent> {
    let dialogConfig: MatDialogConfig = this._createConfig(config);
    let dialogRef: MatDialogRef<AppConfirmDialogComponent> =
      this._dialogService.open(AppConfirmDialogComponent, dialogConfig);
    let confirmDialogComponent: AppConfirmDialogComponent = dialogRef.componentInstance;
    confirmDialogComponent.title = config.title;
    confirmDialogComponent.message = config.message;
    return dialogRef;
  }

  openPrompt(config: IPromptConfig): MatDialogRef<AppPromptDialogComponent> {
    let dialogConfig: MatDialogConfig = this._createConfig(config);
    let dialogRef: MatDialogRef<AppPromptDialogComponent> =
      this._dialogService.open(AppPromptDialogComponent, dialogConfig);
    let promptDialogComponent: AppPromptDialogComponent = dialogRef.componentInstance;
    promptDialogComponent.title = config.title;
    promptDialogComponent.message = config.message;
    promptDialogComponent.value = config.value;
    return dialogRef;
  }

  private _createConfig(config: IDialogConfig): MatDialogConfig {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    Object.assign(dialogConfig, config);
    return dialogConfig;
  }

  showError(error: any) {
    if (error instanceof HttpErrorResponse) {
      this.snackBar.open(error.message);
    } else {
      this.snackBar.open(error.toString());
    }
  }
}

export function DIALOG_PROVIDER_FACTORY(
    parent: DialogService, dialog: MatDialog, snack: MatSnackBar): DialogService {
  return parent || new DialogService(dialog, snack);
}

export const DIALOG_PROVIDER: Provider = {
  // If there is already service available, use that. Otherwise, provide a new one.
  provide: DialogService,
  deps: [[new Optional(), new SkipSelf(), DialogService], MatDialog, MatSnackBar],
  useFactory: DIALOG_PROVIDER_FACTORY,
};
