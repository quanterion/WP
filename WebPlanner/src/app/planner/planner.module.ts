import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShareModule } from '@ngx-share/core';

import { ProjectEditorComponent } from './planner.component';
import { Navigator3dComponent } from './navigator-3d/navigator-3d.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { PropertyEditorComponent } from './property-editor/property-editor.component';
import { LightEditorComponent } from './light-editor/light-editor.component';
import { MaterialSelectorComponent } from './material-selector/material-selector.component';
import { PrintDialogComponent } from './print-dialog/print-dialog.component';
import { ModelExplorerComponent } from './model-explorer/model-explorer.component';
import { MaterialExplorerComponent } from './material-explorer/material-explorer.component';
import { ProjectLinkComponent } from './project-link/project-link.component';
import { MoveDialogComponent } from './move-dialog/move-dialog.component';
import { RotateDialogComponent } from './rotate-dialog/rotate-dialog.component';
import { ModelHistoryComponent } from './model-history/model-history.component';
import { CopyDialogComponent } from './copy-dialog/copy-dialog.component';
import { CoverToolComponent } from './cover-tool/cover-tool.component';
import { ProjectPhotoComponent } from './project-photo/project-photo.component';
import { AboutComponent } from './about/about.component';
import { CKEditorComponent } from 'app/ckeditor/ckeditor.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectThumbnailComponent } from './projects/project-thumbnail.component';
import { ProjectsComponent } from './projects/projects.component';
import { NewOrderComponent } from './orders/new-order/new-order.component';
import { SharedModule } from 'app/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'app/shared/material.module';
import { AppDialogsModule } from 'app/dialogs/dialogs.module';
import { OfferToolComponent } from './offer-tool/offer-tool.component';
import { OrderSenderComponent } from './order-sender/order-sender.component';
import { ClientEditorComponent } from './orders/client-editor/client-editor.component';
import { OrderEditorComponent } from './orders/order-editor/order-editor.component';
import { ReplaceDialogComponent } from './replace-dialog/replace-dialog.component';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { SpecificationComponent } from './specification/specification.component';
import { UICollectionComponent } from './planner.ui';

@NgModule({
  declarations: [
    ModelExplorerComponent,
    MaterialExplorerComponent,
    Navigator3dComponent,
    CoverToolComponent,
    OfferToolComponent,
    ProjectDetailsComponent,
    SpecificationComponent,
    PropertyEditorComponent,
    LightEditorComponent,
    ProjectEditorComponent,
    MaterialSelectorComponent,
    ProjectLinkComponent,
    MoveDialogComponent,
    RotateDialogComponent,
    ModelHistoryComponent,
    PrintDialogComponent,
    CopyDialogComponent,
    ReplaceDialogComponent,
    ProjectPhotoComponent,
    NewProjectComponent,
    ProjectThumbnailComponent,
    UICollectionComponent,
    ProjectsComponent,
    NewOrderComponent,
    OrderEditorComponent,
    AboutComponent,
    CKEditorComponent,
    OrderSenderComponent,
    ClientEditorComponent,
    ProjectTreeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ShareModule,
    AppDialogsModule
  ],
  exports: [
    ProjectEditorComponent,
    ProjectsComponent,
    NewProjectComponent,
    LightEditorComponent
  ],
  entryComponents: [
    MaterialSelectorComponent,
    ProjectLinkComponent,
    MoveDialogComponent,
    RotateDialogComponent,
    CopyDialogComponent,
    ReplaceDialogComponent,
    ModelHistoryComponent,
    ProjectDetailsComponent,
    SpecificationComponent,
    PrintDialogComponent,
    ProjectPhotoComponent,
    NewProjectComponent,
    ProjectThumbnailComponent,
    ProjectsComponent,
    NewOrderComponent,
    OrderEditorComponent,
    ModelExplorerComponent,
    OrderSenderComponent,
    AboutComponent
  ]
})
export class ProjectEditorModule {}
