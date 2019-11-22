import {
  Component,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  EventEmitter
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FilesService,
  FileItem,
  AuthService,
  CatalogService,
  Catalog,
  roundFloat
} from "../../shared";
import { TdFileUploadComponent } from 'app/shared/file/file-upload/file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  CatalogFolderSelectorComponent,
  FolderSelectorConfig } from "../catalog-folder-selector/catalog-folder-selector.component";
import { MoveFilesResult } from "../../shared/files.service";
import { CatalogViewService } from '../catalog-view.service';
import { supportedModelExtensions } from 'modeler/webdesigner';
import { CatalogSyncDialogComponent } from './catalog-sync-dialog.component';
import { concatMap, takeUntil, filter, share, map, tap } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { ModelGetValue } from 'modeler/designer';
import { WpTimeAgoPipe } from 'app/shared/time-ago.pipe';
import { WpBytesPipe } from 'app/shared/bytes.pipe';
import { CatalogBatchDialogComponent } from './catalog-batch-dialog.component';
import { TdFileService } from 'app/shared/file/services/file.service';
import { FilePropertiesComponent, FilePropertiesDisplay } from '../file-properties-dialog/file-properties-dialog.component';

interface ViewFile extends FileItem {
  selected: boolean;
  value: any;
}

@Component({
  selector: "app-catalog-explorer",
  templateUrl: "./catalog-explorer.component.html",
  styleUrls: ["./catalog-explorer.component.css"]
})
export class CatalogExplorerComponent implements AfterViewInit, OnDestroy {

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  modelExtensionsFilter = supportedModelExtensions().map(e => '.' + e).join(', ');
  destroy$ = new EventEmitter<void>();

  constructor(
    private filesService: FilesService,
    public auth: AuthService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    route: ActivatedRoute,
    catalogView: CatalogViewService,
    private catalogService: CatalogService,
    private snackBar: MatSnackBar,
    private router: Router,
    private searchService: CatalogViewService,
    private fileService: TdFileService
  ) {
    combineLatest(catalogView.catalog, route.params).pipe(
      concatMap(([catalog, params]) => {
        this.catalog = catalog;
        this._folderId = params['folderId'] || catalog.modelFolderId;
        this.editable = !catalog.readOnly;
        return this._updateFiles();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
    this.searchService.result
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => this._updateFiles());
  }

  selectedFiles: ViewFile[] = [];

  rowClicked(event: MouseEvent, file: ViewFile) {
    let multi = event.ctrlKey || event.shiftKey;
    this.selectFile(file, !multi);
  }

  selectFile(file: ViewFile, single = true) {
    if (file.selected) {
      this.selectedFiles.splice(this.selectedFiles.findIndex(f => f === file), 1);
    }
    if (single) {
      for (let selectedFile of this.selectedFiles) {
        selectedFile.selected = false;
      }
      this.selectedFiles = [];
    }
    file.selected = !file.selected;
    this.files.data = this.files.data.slice();
    if (file.selected) {
      this.selectedFiles.push(file);
    }
  }

  displayedColumns = ['name', 'price', 'sku', 'value'];
  lastColumnPipe = new WpTimeAgoPipe();
  lastColumnText?: string;
  @ViewChild('sortForDataSource', { static: false }) sortForDataSource: MatSort;

  private catalog: Catalog;
  _folderId: number;
  editable = false;
  caption?: string;
  files = new MatTableDataSource<ViewFile>([]);

  fileTrackBy = (_: number, item: FileItem) => item.id;

  ngAfterViewInit() {
    this.files.sort = this.sortForDataSource;
  }

  get empty() {
    return this.files.data.length < 1;
  }

  private _updateFiles() {
    this.clearLastColumn();
    if (this.searchService.result.value) {
      this.displayFiles(undefined, this.searchService.result.value.files);
      return of(this.searchService.result.value.files);
    } else if (this._folderId) {
      let obs = this.filesService.getFile(this._folderId, true).pipe(share());
      obs.subscribe(folder => this.displayFiles(folder.parentId ? folder.name : undefined, folder.files));
      return obs.pipe(map(f => f.files));
    }
  }

  private displayFiles(caption: string | undefined, files: FileItem[]) {
    let fileList = files.map(f => { return { ...f, selected: false, value: undefined } });
    let selected = [];
    for (let oldFile of this.selectedFiles) {
      let newFile = fileList.find(f => f.id === oldFile.id);
      if (newFile) {
        selected.push(newFile);
        newFile.selected = true;
      }
    }
    this.caption = caption;
    this.selectedFiles = selected;
    this.files.data = fileList;
    // sortForDataSource exists after assigning non empty file list
    setTimeout(_ => this.files.sort = this.sortForDataSource);
  }

  get folderId() {
    return this._folderId;
  }

  getFileLink(file: FileItem) {
    if (file.folder) {
      return ["/catalog", this.catalog.id, "folder", file.id];
    } else {
      return ["/catalog", this.catalog.id, "model", file.id];
    }
  }

  @ViewChild(TdFileUploadComponent, { static: false }) fileUpload: TdFileUploadComponent;
  uploadFiles(fileInfo: File | FileList, fileId?: number) {
    let files = [];
    if (fileInfo instanceof FileList) {
      for (let i = 0; i < fileInfo.length; i++) {
        files.push(fileInfo.item(i));
      }
    } else if (fileInfo instanceof File) {
      files.push(fileInfo);
    }
    this.fileService.openUploadWindow(fileId || this.folderId, files).componentInstance.complete.subscribe(_ => this._updateFiles());
    this.fileUpload.cancel();
  }

  editPrice(item: FileItem) {
    event.stopPropagation();
    event.preventDefault();

    this.dialogService
      .openPrompt({
        message: `Enter new price`,
        value: (item.price || 0).toString()
      })
      .afterClosed()
      .subscribe(newValue => {
        let newPrice = Number.parseFloat(newValue);
        if (newValue && Number.isFinite(newPrice)) {
          this.filesService
            .setPrice(item, newPrice)
            .subscribe(_ => this._updateFiles());
        }
      });
  }

  editSku(item: FileItem) {
    event.stopPropagation();
    event.preventDefault();

    this.dialogService
      .openPrompt({
        message: `Enter SKU code`,
        value: item.sku
      })
      .afterClosed()
      .subscribe(newValue => {
        if (newValue) {
          this.filesService
            .setSku(item, newValue)
            .subscribe(_ => this._updateFiles());
        }
      });
  }

  removeSku(item: FileItem) {
    event.stopPropagation();
    event.preventDefault();
    this.filesService.setSku(item, '')
      .subscribe(_ => this._updateFiles());
  }

  removeFiles() {
    event.stopPropagation();
    event.preventDefault();
    let files = this.selectedFiles.slice();
    this.dialogService
      .openConfirm({
        message: `Are you sure to remove ${this.selectedFiles.length} item(s)?`
      })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.filesService.removeFiles(files)),
        tap(_ => this.selectedFiles = []),
        concatMap(_ => this._updateFiles()),
        concatMap(_ => this.snackBar
          .open('File(s) successfully removed', 'UNDO', {duration: 10000})
          .onAction()),
        concatMap(_ => this.filesService.restoreFiles(files)),
        concatMap(_ => this._updateFiles())
      ).subscribe();
  }

  changeFileShare() {
    event.stopPropagation();
    event.preventDefault();
    this.filesService.share(this.selectedFiles[0], this.selectedFiles[0].shared ? undefined : '*')
      .subscribe(_ => this._updateFiles());
  }

  addFolder() {
    this.dialogService
      .openPrompt({
        message: `Enter folder name`
      })
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(name => {
        this.filesService
          .addFolder(this.folderId, name)
          .subscribe(_ => this._updateFiles());
      });
  }

  canGoToParentFolder() {
    return this.catalog && this.catalog.modelFolderId !== this.folderId;
  }

  goToParentFolder() {
    this.selectedFiles = [];
    this.filesService.getFile(this._folderId).subscribe(folder => {
      if (folder.parentId) {
        if (folder.parentId !== this.catalog.modelFolderId) {
          this.router.navigate(['/catalog', this.catalog.id, 'folder', folder.parentId]);
        } else {
          this.router.navigate(['/catalog', this.catalog.id, 'models']);
        }
      }
    });
  }

  moveFiles() {
    let config: FolderSelectorConfig = {
      initialFolder: this._folderId,
      disabledItems: this.selectedFiles.map(f => f.id)
    }
    this.dialog.open(CatalogFolderSelectorComponent, { data: config })
      .afterClosed().pipe(filter(v => v)).subscribe(folderId => {
      this.filesService.moveFiles(this.selectedFiles
        .map(f => f.id), folderId).subscribe(result => {
          this._updateFiles();
          this.showMoveFilesResult(result)
      })
    });
  }

  showCurrentFolderProperties() {
    this.filesService.getFile(this._folderId).subscribe(f => {
      let data: FilePropertiesDisplay = { files: [f] };
      this.dialog.open(FilePropertiesComponent, { data }).afterClosed().subscribe(newProp => {
        if (newProp && newProp.name) {
          this.caption = newProp.name;
        }
      })
    });
  }

  showFileProperties(event: MouseEvent, file?: FileItem, activeField?: 'price' | 'sku') {
    if (!this.editable) {
      return;
    }
    event.stopPropagation();
    let data: FilePropertiesDisplay = {
      files: file ? [file] : this.selectedFiles,
      activeField
    };
    this.dialog.open(FilePropertiesComponent, { data }).afterClosed().subscribe(ok => {
      if (ok) {
        this._updateFiles();
      }
    });
  }

  private showMoveFilesResult(moveResult: MoveFilesResult) {
    if (moveResult.error) {
      let message = 'Failed to move files.';
      if (moveResult.error === 'recursion') {
        message += ' Can not move file inside itself.';
      } else if (moveResult.error === 'permission') {
        message += ' Access denied.';
      }
      this.snackBar.open(message, undefined, { duration: 5000 });
      return;
    }
    let folder = moveResult.folder;
    this.catalogService.getCatalog(folder.catalogId).subscribe(catalog => {
      let destName = catalog.modelFolderId === folder.id ? catalog.name : folder.name;
      let materialInfo = moveResult.materials.length > 0 ?
        ` ${moveResult.materials.length} material(s) added` : '';
      this.snackBar.open(`File(s) successfully moved to ${destName}` + materialInfo,
        'OPEN', { duration: 7000 }).onAction().subscribe(_ => {
          if (catalog.modelFolderId === folder.id) {
            this.router.navigate(['/catalog', folder.catalogId, 'models']);
          } else {
            this.router.navigate(['/catalog', folder.catalogId, 'folder', folder.id]);
          }
        });
    });
  }

  renameFile(f: FileItem) {
    if (!this.editable) {
      return;
    }
    this.dialogService
      .openPrompt({
        message: 'Enter file name',
        value: f.name
      })
      .afterClosed().pipe(filter(v => v)).subscribe(newName => {
        this.filesService
          .renameFile(f, newName)
          .subscribe(_ => this._updateFiles());
      });
  }

  uploadThumbnailOrModel(file: FileItem, upload: File) {
    let ext = upload.name.split('.').pop().toLocaleLowerCase();
    if (supportedModelExtensions().includes(ext)) {
      this.uploadFiles(upload, file.id);
    } else {
      this.filesService.updateCustomThumbnail(file.id, upload).subscribe(_ => {
        this._updateFiles();
      })
    }
  }

  syncContent() {
    let data = { catalogId: this.catalog.id, folderId: this.folderId };
    this.dialog.open(CatalogSyncDialogComponent, { data })
      .afterClosed().subscribe(_ => this._updateFiles());
  }

  batchEditor() {
    let data = { catalogId: this.catalog.id, folderId: this.folderId };
    this.dialog.open(CatalogBatchDialogComponent, { data })
      .afterClosed().subscribe(_ => this._updateFiles());
  }

  fileLinkClicked(event: MouseEvent) {
    if (event.button === 0) {
      this.searchService.clear();
    }
  }

  lastColumnValue(file: ViewFile) {
    let value = this.lastColumnText ? file.value : file.modifiedAt;
    if (value !== undefined) {
      return this.lastColumnPipe.transform(value);
    }
  }

  clearLastColumn() {
    this.lastColumnText = undefined;
    this.lastColumnPipe = new WpTimeAgoPipe();
    for (let file of this.files.data) {
      file.value = undefined;
    }
    this.files.data = [...this.files.data];
  }

  setValueColumn(event: MouseEvent) {
    let target = event.target as HTMLElement;
    let value = Number(target.getAttribute('data-value'));

    if (!value) {
      this.clearLastColumn();
      return;
    }

    let arg = Number(target.getAttribute('data-arg'));
    this.lastColumnPipe = {
      transform: value => value
    };
    if (value === ModelGetValue.Storage) {
      this.lastColumnPipe = new WpBytesPipe();
    }
    this.lastColumnText = target.innerText;
    this.filesService.getModelValues(this._folderId, value, arg).subscribe(values => {
      let files = this.files.data;
      for (let pair of values) {
        let file = files.find(f => f.id === pair.id);
        if (file) {
          file.value = pair.value;
          if (typeof file.value === 'number') {
            file.value = roundFloat(file.value, 2);
          }
        }
      }
      this.files.data = [...files];
    });
  }
}
