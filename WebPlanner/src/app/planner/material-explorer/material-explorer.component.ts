import { Component, OnInit, Output, EventEmitter, Optional, ChangeDetectorRef } from '@angular/core';
import { CatalogService, Catalog, CatalogType, CatalogGroup, CatalogMaterial, MaterialType, AuthService, catalogSort } from '../../shared';
import { Observable } from 'rxjs';
import { EmbedService } from 'embed/embed.service';
import { Subscription } from 'rxjs';
import { map, shareReplay, concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-material-explorer',
  templateUrl: './material-explorer.component.html',
  styleUrls: ['./material-explorer.component.scss']
})
export class MaterialExplorerComponent implements OnInit {
  constructor(
    @Optional() private embed: EmbedService,
    private catalogService: CatalogService,
    private cd: ChangeDetectorRef,
    private auth: AuthService
  ) { }

  catalogs$ = this.auth.isAuthenticated.pipe(
    concatMap(_ => this.catalogService.getAllCatalogs()),
    map(list => {
      list = list.filter(c => c.type !== CatalogType.Model);
      return {
        my: list.filter(c => c.ownerId === this.auth.userId).sort(catalogSort),
        all: list.filter(c => c.ownerId !== this.auth.userId).sort(catalogSort)
      }
    }),
    shareReplay()
  );

  @Output() materialDrag = new EventEmitter<CatalogMaterial>();
  @Output() materialSelected = new EventEmitter<CatalogMaterial>();

  cataloId: number;
  modelGroupId?: number;
  group?: CatalogGroup = undefined;
  groupSub: Subscription;

  selectCatalog(c: Catalog) {
    this.cataloId = c.id;
    this.setGroup(c.materialGroupId);
  }

  selectGroup(id: number) {
    this.setGroup(id);
  }

  ngOnInit() {}

  itemTrackBy = (index: number, item: CatalogGroup | CatalogMaterial) => item.id;

  get canBack() {
    return this.group;
  }

  goBack() {
    this.setGroup(this.group.groupId);
  }

  materialClick(m: CatalogMaterial | CatalogGroup) {
    if (m.type) {
      this.setGroup(m.id);
    } else {
      this.materialSelected.emit(m as CatalogMaterial);
      this.materialDrag.emit(m as CatalogMaterial);
    }
  }

  get groupMode() {
    return this.group !== undefined;
  }

  setGroup(id?: number) {
    if (this.groupSub) {
      this.groupSub.unsubscribe();
      this.groupSub = undefined;
    }
    this.group = undefined;
    if (id) {
      this.group = null;
      let group$ = this.catalogService.getGroup(this.cataloId, id);
      this.groupSub = group$.subscribe(f => {
        this.group = f;
        this.cd.markForCheck();
      });
    }
  }

  dragStart(event: DragEvent, m: CatalogMaterial) {
    if (m.type === MaterialType.Material) {
      event.dataTransfer.setData('material', JSON.stringify(m));
    } else {
      event.preventDefault();
    }
  }

  itemMouseUp(event: MouseEvent, item: CatalogGroup | CatalogMaterial) {
    if (this.embed) {
      return;
    }
    if (event.button === 2) {
      let url = `/catalog/${item.catalogId}/materials?mid=${item.id}&group=${item.groupId}`;
      if (item.type) {
        url = `/catalog/${item.catalogId}/materials?group=${item.id}`;
      }
      window.open(window.location.origin + url, '_blank');
    }
  }
}
