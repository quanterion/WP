import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
  DatePipe
} from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import {
  OverlayContainer,
  FullscreenOverlayContainer
} from '@angular/cdk/overlay';
import { Angulartics2Module } from 'angulartics2';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSnackBar, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { EmbedComponent } from './embed.component';
import { AuthService } from 'app/shared/auth.service';
import { CatalogService } from 'app/shared/catalog.service';
import { FilesService } from 'app/shared/files.service';
import {
  OrderService,
  AuthInterceptor
} from "app/shared";
import { MaterialModule } from 'app/shared/material.module';
import { ProjectEditorModule } from 'app/planner/planner.module';
import { EmbedService } from './embed.service';
import { ProjectEditorComponent } from 'app/planner/planner.component';
import { TranslationService } from "app/shared/translation.service";
import { WindowService } from 'app/shared/window.service';
import { AppDialogsModule } from 'app/dialogs/dialogs.module';
import { EmbedHomeComponent } from './embed-home/embed-home.component';
import { sentryErrorHandlers, initSentry } from 'app/sentry';

initSentry();

const routes: Route[] = [
  { path: '', pathMatch: 'full', component: EmbedHomeComponent },
  { path: 'editor', component: ProjectEditorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [EmbedComponent, EmbedHomeComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    FlexLayoutModule,
    RouterModule.forRoot(routes),
    FlexLayoutModule,
    MaterialModule,
    AppDialogsModule,
    ProjectEditorModule,
    Angulartics2Module.forRoot()
  ],
  providers: [
    ...sentryErrorHandlers,
    TranslationService,
    WindowService,
    EmbedService,
    CatalogService,
    FilesService,
    AuthService,
    OrderService,
    MatSnackBar,
    Location,
    DatePipe,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 }}
  ],
  bootstrap: [EmbedComponent]
})
export class EmbedModule {}
