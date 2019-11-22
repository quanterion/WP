import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ViewerComponent } from './viewer.component';
import { BrowseComponent } from './browse.component';
import { FilesComponent } from './files.component';
import { LoginComponent } from './login.component';
import { ViewerRoutingModule } from './viewer-routing.module';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './auth.component';
import { ModelComponent } from './model.component';
import { DelDialogComponent } from './del-dialog/del-dialog.component';
import { AuthInterceptor } from 'app/shared';
import { ModelTreeComponent } from './model-tree.component';
import { MaterialModule } from 'app/shared/material.module';
import { MaterialViewComponent } from './material-view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ViewerProjectLinkComponent } from './viewer-project-link/viewer-project-link.component';
import { AccountPageComponent } from './account-page/account-page.component';
import { HeaderComponent } from './header/header.component';
import { RenameDialogComponent } from './rename-dialog/rename-dialog.component';
import { SharedModule } from 'app/shared/shared.module';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { AppDialogsModule } from 'app/dialogs/dialogs.module';
import { sentryErrorHandlers, initSentry } from 'app/sentry';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material';
import { UploadComponent } from 'app/shared/upload/upload.component';
import { environment } from 'environments/environment';

initSentry();

@NgModule({
  declarations: [
    ViewerComponent,
    BrowseComponent,
    FilesComponent,
    LoginComponent,
    AuthComponent,
    ModelComponent,
    DelDialogComponent,
    ModelTreeComponent,
    MaterialViewComponent,
    ViewerProjectLinkComponent,
    AccountPageComponent,
    HeaderComponent,
    RenameDialogComponent,
    UploadComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    environment.e2e ? NoopAnimationsModule : BrowserAnimationsModule,
    ViewerRoutingModule,
    FlexLayoutModule,
    MaterialModule,
    SharedModule,
    AppDialogsModule
  ],
  providers: [
    ...sentryErrorHandlers,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 }},
    DialogService,
  ],
  bootstrap: [ViewerComponent],
  entryComponents: [DelDialogComponent, ViewerProjectLinkComponent, RenameDialogComponent]
})
export class ViewerModule { }
