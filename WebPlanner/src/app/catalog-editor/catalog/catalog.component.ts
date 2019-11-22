import { Component, ViewChild } from '@angular/core';
import { Catalog, AuthService } from '../../shared';
import { Observable } from 'rxjs';
import { CatalogViewService } from '../catalog-view.service';
import { filter, concatMap, take } from 'rxjs/operators';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { TdFileInputComponent } from 'app/shared/file/file-input/file-input.component';
import { CatalogInfoComponent } from '../catalog-info/catalog-info.component';
import { CatalogArchiveDialogComponent } from '../archiving/catalog-archive-dialog.component';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  providers: [CatalogViewService]
})
export class CatalogComponent {

  catalog$: Observable<Catalog>;

  constructor(private dialogService: DialogService, public view: CatalogViewService,
    public auth: AuthService
  ) {
    this.catalog$ = this.view.catalog;
  }

  editCatalog() {
    this.catalog$.pipe(
      take(1),
      concatMap(data => this.dialogService
        .open(CatalogInfoComponent, { data: { ...data }}).afterClosed()),
      filter(v => v)
    ).subscribe(c => this.view.edit(c));
  }

  get search() {
    return this.view.result.value;
  }

  uploadThumbnail(preview: File) {
    this.view.uploadThumbnail(preview);
  }

  @ViewChild(TdFileInputComponent, { static: false }) fileUpload: TdFileInputComponent;
  startUploadThumbnail() {
    this.fileUpload.inputElement.click();
    this.fileUpload.clear();
  }

  removeThumbnail() {
    this.view.removeThumbnail();
  }

  showArchiveDialog() {
    this.catalog$.pipe(
      take(1),
      concatMap(catalog => this.dialogService
        .open(CatalogArchiveDialogComponent, { data: catalog.id }).afterClosed()),
    ).subscribe(_ => this.view.updateCatalog());
  }
}
