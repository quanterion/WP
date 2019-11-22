import { Component, OnInit, Output, EventEmitter, Input, Optional,
  ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CatalogService, Catalog, FilesService, FileItem, CatalogType, AuthService, catalogSort } from '../../shared';
import { Observable } from 'rxjs';
import { EstimateService } from '../../planner/estimate';
import { EmbedService } from 'embed/embed.service';
import { concatMap, map, shareReplay, startWith, tap, take } from 'rxjs/operators';

@Component({
  selector: 'app-model-explorer',
  templateUrl: './model-explorer.component.html',
  styleUrls: ['./model-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelExplorerComponent implements OnInit {
  constructor(
    private hostElement: ElementRef,
    private auth: AuthService,
    @Optional() private embed: EmbedService,
    private catalogService: CatalogService,
    private filesService: FilesService,
    private cd: ChangeDetectorRef,
    @Optional() private estimate: EstimateService
  ) {}

  @Input() set customFolder(value: Observable<FileItem>) {
    if (value) {
      this.folder$ = value.pipe(startWith({ id: 0, name: '', folder: false }));
    }
  }

  catalogs$ = this.auth.isAuthenticated.pipe(
    concatMap(_ => this.catalogService.getAllCatalogs()),
    map(list => {
      list = list.filter(c => c.type !== CatalogType.Material);
      return {
        my: list.filter(c => c.ownerId === this.auth.userId).sort(catalogSort),
        all: list.filter(c => c.ownerId !== this.auth.userId).sort(catalogSort)
      }
    }),
    shareReplay()
  );

  ngOnInit() {

  }

  @Output() modelDrag = new EventEmitter<FileItem>();
  @Output() fileSelected = new EventEmitter<FileItem>();
  @Input() recentFolders: FileItem[];
  @Input() fileFilter?: (f: FileItem) => boolean;

  folder$?: Observable<FileItem>;
  activeFileId: number;

  selectCatalog(c: Catalog) {
    this.selectFolder(c.modelFolderId);
  }

  activateFile(id: number) {
    this.activeFileId = id;
    this.cd.markForCheck();
  }

  fileTrackBy = (_: number, item: FileItem) => item.id;

  back() {
    if (this.folder$) {
      this.folder$.pipe(take(1)).subscribe(f => this.selectFolder(f.parentId, f));
    }
  }

  fileClick(f: FileItem, folder: FileItem) {
    if (f.folder) {
      this.selectFolder(f.id);
    } else {
      this.addToRecent(folder);
      this.fileSelected.emit(f);
      this.modelDrag.emit(f);
    }
  }

  selectFolder(id?: number, initialData?: FileItem) {
    this.folder$ = undefined;
    if (id) {
      let folder$ = this.filesService.getFile(id, true);
      if (this.estimate && this.estimate.canFillPrices()) {
        folder$ = folder$.pipe(concatMap(
          folder => this.estimate.fillPrices(folder.files).pipe(
            startWith(undefined),
            map(filesWithPrice => {
              if (filesWithPrice) {
                folder.files = filesWithPrice;
              }
              folder.files = folder.files.filter(f => f.folder || !f.sku || f.price > 0);
              return folder;
            })
        )));
      }
      this.folder$ = folder$.pipe(
        map(f => {
          if (f.files && this.fileFilter) {
            f.files = f.files.filter(this.fileFilter);
          }
          return f;
        }),
        tap(f => {
          let index = f.files && f.files.findIndex(f => f.id === this.activeFileId);
          if (this.activeFileId && index >= 0) {
            setTimeout(() => {
              let item = this.hostElement.nativeElement.querySelector(`div.file-list div.file-item:nth-child(${index})`);
              if (item) {
                item.scrollIntoView();
              }
            }, 250);
          }
          this.cd.markForCheck();
        }),
        startWith(initialData || { id, name: '', folder: false }),
        shareReplay(1)
      );
    }
    this.cd.markForCheck();
  }

  reload() {
    if (this.folder$) {
      this.folder$.pipe(take(1)).subscribe(f => this.selectFolder(f.id, f));
    }
  }

  dragDropModel(f: FileItem, folder: FileItem) {
    if (!f.folder) {
      this.addToRecent(folder);
    }
    this.modelDrag.emit(f);
    return false;
  }

  addToRecent(folder?: FileItem) {
    if (this.recentFolders && folder) {
      let index = this.recentFolders.findIndex(f => f.id === folder.id);
      if (index >= 0) {
        this.recentFolders.splice(index, 1);
      }
      this.recentFolders.splice(0, 0, folder);
      this.cd.markForCheck();
    }
  }

  fileMouseUp(event: MouseEvent, f: FileItem) {
    if (!this.embed && event.button === 2) {
      let url = `/catalog/${f.catalogId}/model/${f.id}`;
      if (f.folder) {
        url = `/catalog/${f.catalogId}/folder/${f.id}`;
      }
      window.open(window.location.origin + url, '_blank');
    }
  }
}
