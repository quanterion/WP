import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { CatalogListComponent } from './catalog-list/catalog-list.component';
import { CatalogComponent } from './catalog/catalog.component';
import { CatalogExplorerComponent } from './catalog-explorer/catalog-explorer.component';
import { CatalogSyncDialogComponent } from './catalog-explorer/catalog-sync-dialog.component';
import { CatalogBatchDialogComponent } from './catalog-explorer/catalog-batch-dialog.component';
import { CatalogMaterialsComponent } from './catalog-materials/catalog-materials.component';
import { CatalogPropertiesComponent } from './catalog-properties/catalog-properties.component';
import { CatalogPropertyComponent } from './catalog-property/catalog-property.component';
import { PropertySelectorComponent } from './property-selector/property-selector.component';
import { MaterialComponent } from './material/material.component';
import { ModelerComponent } from './modeler/modeler.component';
import { ModelerTreeComponent } from './modeler/modeler-tree.component';
import { ModelerPropertiesComponent } from './modeler/modeler-properties.component';
import { NestedCatalogsComponent } from './nested-catalogs/nested-catalogs.component';
import { CatalogFolderSelectorComponent } from './catalog-folder-selector/catalog-folder-selector.component';
import { Routes, RouterModule } from '@angular/router';
import { ProjectEditorModule } from 'app/planner/planner.module';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppDialogsModule } from 'app/dialogs/dialogs.module';
import { CatalogInfoComponent } from './catalog-info/catalog-info.component';
import { UploadIndicatorComponent } from './upload-indicator/upload-indicator.component';
import { FilePropertiesComponent } from './file-properties-dialog/file-properties-dialog.component';
import { CatalogArchiveDialogComponent } from './archiving/catalog-archive-dialog.component';

const routes: Routes = [
  {
    path: 'list',
    component: CatalogListComponent,
  },
  {
    path: ':id',
    component: CatalogComponent,
    children: [
      { path: '', redirectTo: 'models', pathMatch: 'full' },
      { path: 'models', component: CatalogExplorerComponent },
      { path: 'folder/:folderId', component: CatalogExplorerComponent },
      { path: 'model/:id', component: ModelerComponent },
      { path: 'materials', component: CatalogMaterialsComponent },
      { path: 'properties', component: CatalogPropertiesComponent },
      { path: 'fragments', component: NestedCatalogsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    CatalogListComponent,
    CatalogComponent,
    CatalogExplorerComponent,
    CatalogSyncDialogComponent,
    CatalogArchiveDialogComponent,
    CatalogBatchDialogComponent,
    CatalogMaterialsComponent,
    CatalogPropertiesComponent,
    CatalogPropertyComponent,
    PropertySelectorComponent,
    MaterialComponent,
    ModelerComponent,
    ModelerTreeComponent,
    ModelerPropertiesComponent,
    NestedCatalogsComponent,
    CatalogFolderSelectorComponent,
    CatalogInfoComponent,
    UploadIndicatorComponent,
    FilePropertiesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AppDialogsModule,
    ProjectEditorModule,
    DragDropModule
  ],
  providers: [DialogService],
  entryComponents: [
    PropertySelectorComponent,
    CatalogFolderSelectorComponent,
    CatalogSyncDialogComponent,
    CatalogArchiveDialogComponent,
    CatalogBatchDialogComponent,
    CatalogInfoComponent,
    UploadIndicatorComponent,
    FilePropertiesComponent
  ]
})
export class CatalogEditorModule { }
