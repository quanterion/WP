import 'hammerjs';

import { environment } from 'environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import {
  OverlayContainer,
  FullscreenOverlayContainer
} from '@angular/cdk/overlay';

import { Angulartics2Module } from 'angulartics2';
import { AppComponent } from './app.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { ProjectsComponent } from './planner/projects/projects.component';
import { LoginComponent } from './login/login.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { RegisterComponent } from './register/register.component';
import { HomepageComponent } from './homepage/homepage.component';
import { AuthInterceptor } from "./shared";
import { AdminGuard, AuthStatusGuard } from './guards';
import { ProjectEditorModule } from './planner/planner.module';
import { FeatureInfoComponent } from './homepage/feature-info/feature-info.component';
import { ChangelogInfoComponent } from './homepage/changelog-info/changelog-info.component';
import { CreditsInfoComponent } from './homepage/credits-info/credits-info.component';
import { LandingComponent } from './homepage/landing/landing.component';
import { StoreHomeComponent } from './store-home/store-home.component';
import { SubscribeDialogComponent } from './homepage/subscribe-dialog/subscribe-dialog.component';
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ArticlesComponent } from './homepage/articles/articles.component';
import { ProjectEditorComponent } from './planner/planner.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DatePipe } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { AppDialogsModule } from './dialogs/dialogs.module';
import { sentryErrorHandlers, initSentry } from './sentry';

initSentry();

const routes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'home', component: HomepageComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingComponent },
      { path: 'features', component: FeatureInfoComponent },
      { path: 'credits', component: CreditsInfoComponent },
      { path: 'changelog', component: ChangelogInfoComponent },
      { path: 'articles', component: ArticlesComponent }
    ]
  },
  { path: 'gallery', component: ProjectsComponent, data: { view: 1 } },
  { path: 'projects', component: ProjectsComponent, data: { view: 2 } },
  {
    path: 'project/:id',
    component: ProjectEditorComponent,
    canActivate: [AuthStatusGuard]
  },
  {
    path: 'catalog',
    loadChildren: () => import('./catalog-editor/catalog-editor.module').then(m => m.CatalogEditorModule),
    canActivate: [AuthStatusGuard],
    canActivateChild: [AuthStatusGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [AdminGuard] },
  { path: '**', component: NotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    ExplorerComponent,
    RegisterComponent,
    LoginComponent,
    HomepageComponent,
    FeatureInfoComponent,
    ChangelogInfoComponent,
    CreditsInfoComponent,
    LandingComponent,
    StoreHomeComponent,
    SubscribeDialogComponent,
    ArticlesComponent
  ],
  entryComponents: [
    LoginComponent,
    SubscribeDialogComponent,
  ],
  imports: [
    BrowserModule,
    environment.e2e ? NoopAnimationsModule : BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    Angulartics2Module.forRoot({ developerMode: !environment.production }),
    SharedModule,
    AppDialogsModule,
    ProjectEditorModule
  ],
  providers: [
    ...sentryErrorHandlers,
    DatePipe,
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 }}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
