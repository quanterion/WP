import { Component } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, concatMap, filter } from 'rxjs/operators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DelDialogComponent } from './del-dialog/del-dialog.component';
import { Catalog, FileItem, FilesService, CatalogService, CatalogType } from 'app/shared';
import { RenameDialogComponent } from './rename-dialog/rename-dialog.component';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent {

  addCatalog = false;
  catalogs$: Observable<Catalog[]>;
  files$: Observable<FileItem>;
  info$: Observable<{ catalogs: Catalog[], folder: FileItem, selectedId: number }>;
  fileLoading = false;
  uploadProgress: number;
  uploadingMode = false;

  constructor(private files: FilesService, private catalogs: CatalogService,
    private route: ActivatedRoute, private router: Router,
    private dialog: MatDialog, private snackBar: MatSnackBar) {
    this.updateInfo();
  }

  private updateInfo() {
    this.info$ = combineLatest(this.catalogs.getCatalogs(), this.route.queryParams,
      (catalogs, params) => ({ catalogs, params })).pipe(
        concatMap(result => {
          let catalog = result.catalogs.find(c => c.id.toString() === result.params["catalog"]);
          if (catalog) {
            return this.files.getFile(catalog.modelFolderId, true)
              .pipe(map(folder => ({ catalogs: result.catalogs, folder, selectedId: catalog.id })))
          } else if (result.catalogs.length > 0) {
            return this.files.getFile(result.catalogs[0].modelFolderId, true)
              .pipe(map(folder => ({ catalogs: result.catalogs, folder, selectedId: result.catalogs[0].id })))
          }
          return of({ catalogs: undefined as Catalog[], folder: undefined as FileItem, selectedId: undefined as number });
        }));
  }

  openCatalog(id: number) {
    this.router.navigate([], { queryParams: { catalog: id } });
  }

  openModel(id: number) {
    this.router.navigate(['/model', id]);
  }

  addNewCatalog(name: string) {
    this.catalogs.addCatalog({ name, type: CatalogType.Model, shared: '*' }).subscribe(c => {
      this.openCatalog(c.id);
      this.updateInfo();
    });
    this.addCatalog = false;
  }

  removeCatalog(event: MouseEvent, id: number) {
    event.stopPropagation();
    this.catalogs.removeCatalog(id).subscribe(_ => this.updateInfo());
  }

  delFile(event: MouseEvent, file: FileItem) {
    event.stopPropagation();
    this.files.removeFile(file).subscribe(_ => this.updateInfo());
  }


  openDialogDelFile(event: MouseEvent, file: FileItem) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DelDialogComponent, { data: "file " + file.name });
    dialogRef.afterClosed().pipe(
      filter(v => v),
      concatMap(_ => this.files.removeFile(file))
    ).subscribe(_ => this.updateInfo());
  }

  openDialogDelCatalog(event: MouseEvent, catalogs: Catalog[], catalog: Catalog) {
    event.stopPropagation();
    this.dialog
      .open(DelDialogComponent, { data: "catalog " + catalog.name })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.catalogs.removeCatalog(catalog.id))
      ).subscribe(_ => {
        let nextCatalog = catalogs.find(c => c !== catalog);
        if (nextCatalog) {
          this.openCatalog(nextCatalog.id);
        } else {
          this.router.navigate([]);
        }
        this.updateInfo();
      });
  }

  openRenameCatalogDialog(event: MouseEvent, catalog: Catalog) {
    event.stopPropagation();
    this.dialog
      .open(RenameDialogComponent, { data: catalog.name })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(name => this.catalogs.editCatalog(catalog.id, { name }))
      ).subscribe(_ => this.updateInfo());
  }

  openRenameFileDialog(event: MouseEvent, file: FileItem) {
    event.stopPropagation();
    this.dialog
      .open(RenameDialogComponent, { data: file.name })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(newName => this.files.renameFile(file, newName))
      ).subscribe(_ => this.updateInfo());
  }

  hideUploadMode() {
    this.uploadingMode = false;
  }

}
