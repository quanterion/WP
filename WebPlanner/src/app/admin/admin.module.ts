import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectEditorModule } from 'app/planner/planner.module';
import { AppDialogsModule } from 'app/dialogs/dialogs.module';
import { SharedModule } from 'app/shared/shared.module';

import { AdminComponent } from './admin.component';
import { AdminUserComponent } from './admin-user/admin-user.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminFirmsComponent } from './admin-firms/admin-firms.component';
import { AdminMaterialsComponent } from './admin-materials/admin-materials.component';
import { AdminStatusComponent } from './admin-status/admin-status.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminStyleEditorComponent } from './admin-style-editor/admin-style-editor.component';
import { AdminScriptEditorComponent } from './admin-script-editor/admin-script-editor.component';
import { AdminPriceListsComponent } from './admin-pricelists/admin-pricelists.component';
import { ProjectsComponent } from 'app/planner/projects/projects.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { AdminTemplatesComponent } from './admin-templates/admin-templates.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { AdminContentComponent } from './admin-content/admin-content.component';
import { AdminRolesComponent } from './admin-roles/admin-roles.component';

const routes: Routes = [
  {
    path: '', component: AdminComponent,
    children: [
      { path: '', redirectTo: 'settings', pathMatch: 'full' },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'style', component: AdminStyleEditorComponent },
      { path: 'script', component: AdminScriptEditorComponent },
      { path: 'prices', component: AdminPriceListsComponent },
      { path: 'status', component: AdminStatusComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'users/roles', component: AdminRolesComponent },
      { path: 'firms', component: AdminFirmsComponent },
      { path: 'materials', component: AdminMaterialsComponent },
      { path: 'user/:userId', component: AdminUserComponent },
      { path: 'projecttemplates', component: ProjectsComponent, data: { view: 3 } },
      { path: 'templates', component: AdminTemplatesComponent },
      { path: 'content', component: AdminContentComponent }
    ]
  }];

@NgModule({
  declarations: [
    AdminComponent,
    AdminUserComponent,
    AdminUsersComponent,
    AdminFirmsComponent,
    AdminMaterialsComponent,
    AdminStyleEditorComponent,
    AdminScriptEditorComponent,
    AdminPriceListsComponent,
    AdminStatusComponent,
    AdminSettingsComponent,
    CodeEditorComponent,
    AdminTemplatesComponent,
    FormBuilderComponent,
    AdminContentComponent,
    AdminRolesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    ProjectEditorModule,
    AppDialogsModule
  ],
  exports: [

  ],
  entryComponents: [

  ]
})
export class AdminModule { }
