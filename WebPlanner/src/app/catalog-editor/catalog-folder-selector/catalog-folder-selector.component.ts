import { Component, OnInit, Inject, Optional } from "@angular/core";
import { CatalogService, Catalog } from '../../shared/catalog.service';
import { FilesService, FileItem } from '../../shared/files.service';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { filter } from "rxjs/operators";
import { DialogService } from "app/dialogs/services/dialog.service";

export interface FolderSelectorConfig {
  initialFolder?: number,
  disabledItems?: number[]
}

@Component({
  selector: 'app-catalog-folder-selector',
  templateUrl: './catalog-folder-selector.component.html',
  styleUrls: ['./catalog-folder-selector.component.scss']
})
export class CatalogFolderSelectorComponent implements OnInit {

  constructor(
    private catalogService: CatalogService,
    private filesService: FilesService,
    private dialogRef: MatDialogRef<CatalogFolderSelectorComponent>,
    private dialog: DialogService,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: FolderSelectorConfig
  ) {
    this.catalogService.getCatalogs()
      .subscribe(list => this.catalogs = list);
    this.updateFolderName();
  }

  ngOnInit() {
    this.dialogRef.updateSize('40vw', '70vh');
    if (this.data && this.data.initialFolder) {
      this.folderId = this.data.initialFolder;
      this.files = this.filesService.getChildren(this.folderId);
      this.updateFolderName();
    }
  }

  catalogs: Catalog[];
  files: Observable<FileItem[]>;
  currentName: string;
  folderId?: number;
  selectedCatalog: Catalog;
  selectedFolderId: number;

  selectCatalog(c: Catalog) {
    this.selectedCatalog = c;
  }

  selectFolder(f: FileItem) {
    if (this.canSelectFile(f)) {
      this.selectedFolderId = f.id;
    }
  }

  canSelectFile(f: FileItem) {
    let disabled = this.data && this.data.disabledItems
      && this.data.disabledItems.indexOf(f.id) > 0;
    return f.folder && !disabled;
  }

  private clearSelection() {
    this.selectedCatalog = undefined;
    this.selectedFolderId = undefined;
  }

  openCatalog(c: Catalog) {
    this.clearSelection();
    this.folderId = c.modelFolderId;
    this.currentName = c.name;
    this.files = this.filesService.getChildren(c.modelFolderId);
  }

  levelUp() {
    this.clearSelection();
    this.filesService.getFile(this.folderId).subscribe(f => {
      this.folderId = f.parentId;
      if (this.folderId) {
        this.files = this.filesService.getChildren(this.folderId);
      }
      this.updateFolderName();
    })
  }

  private updateFolderName() {
    if (this.folderId) {
        this.filesService.getFile(this.folderId).subscribe(f => {
          if (f.parentId) {
            this.currentName = f.name
          } else if (this.catalogs) {
            let catalog = this.catalogs.find(c => c.id === f.catalogId);
            if (catalog) {
              this.currentName = catalog.name
            }
          }
        });
        this.files = this.filesService.getChildren(this.folderId);
      } else {
        this.currentName = 'Catalogs';
      }
  }

  openFolder(f: FileItem) {
    if (this.canSelectFile(f)) {
      this.clearSelection();
      this.currentName = f.name;
      this.folderId = f.id;
      this.files = this.filesService.getChildren(this.folderId);
    }
  }

  createNewFolder() {
    if (this.folderId) {
      this.dialog.openPrompt({ message: 'Enter new folder name' })
      .afterClosed().pipe(filter(v => v)).subscribe(name => {
        this.filesService.addFolder(this.folderId, name).subscribe(f => {
          this.files = this.filesService.getChildren(this.folderId);
          this.selectedFolderId = f.id;
        })
      })
    }
  }

  moveClick() {
    let result: number;
    if (this.selectedCatalog) {
      result = this.selectedCatalog.modelFolderId;
    } else if (this.selectedFolderId) {
      result = this.selectedFolderId;
    } else {
      result = this.folderId;
    }
    this.dialogRef.close(result);
  }

}
