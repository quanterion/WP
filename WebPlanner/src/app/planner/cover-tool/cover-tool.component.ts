import { Component, Output, EventEmitter, Optional, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CatalogService, Catalog, CatalogType, CatalogGroup, CatalogMaterial, MaterialType } from '../../shared';
import { Observable } from 'rxjs';
import { EmbedService } from 'embed/embed.service';
import { Subscription } from 'rxjs';
import { Designer, Mesh, Entity, BuilderApplyItem } from 'modeler/designer';
import { MatSelectChange } from '@angular/material/select';
import { ProjectHandler } from 'modeler/project-handler';
import { map, shareReplay, share, delay } from 'rxjs/operators';

@Component({
  selector: 'app-cover-tool',
  templateUrl: './cover-tool.component.html',
  styleUrls: ['./cover-tool.component.scss']
})
export class CoverToolComponent implements OnDestroy {
  ngOnDestroy(): void {
    if (this.undo) {
      this.undo();
    }
  }
  constructor(
    private hostElement: ElementRef,
    @Optional() private embed: EmbedService,
    private catalogService: CatalogService,
    private cd: ChangeDetectorRef
  ) {
    let filter = (c: Catalog) => c.type !== CatalogType.Model;
    this.catalogs = this.catalogService.getCatalogs()
      .pipe(map(list => list.filter(filter)), shareReplay());
    this.sharedCatalogs = this.catalogService.getSharedCatalogs()
      .pipe(map(list => list.filter(filter)), shareReplay());
  }

  @Output() close = new EventEmitter<void>();

  cataloId: number;
  modelGroupId?: number;
  catalogs: Observable<Catalog[]>;
  sharedCatalogs: Observable<Catalog[]>;
  group?: CatalogGroup = undefined;
  groupSub: Subscription;
  ds?: Designer;
  undo? (): void;
  targets: { e: Entity, mesh: Mesh}[];
  mode = 1;
  walls = false;
  room?: Entity;
  selectedId?: number;

  selectCatalog(c: Catalog) {
    this.cataloId = c.id;
    this.setGroup(c.materialGroupId);
  }

  selectGroup(id: number) {
    this.setGroup(id);
  }

  selectMaterial(material: CatalogMaterial) {
    this.cataloId = material.catalogId;
    this.selectedId = material.id;
    this.setGroup(material.groupId).pipe(delay(1)).subscribe(_ => {
      let index = this.group.materials.findIndex(m => m.id === material.id);
      let item = this.hostElement.nativeElement.querySelector(`app-cover-tool div.file-list div:nth-child(${index})`);
      if (item) {
        item.scrollIntoView();
      }
    });
  }

  edit(ds: Designer) {
    this.selectedId = undefined;
    if (this.undo) {
      this.undo();
      this.undo = undefined;
    }
    this.walls = false;
    this.ds = ds;
    if (ds.selection.mesh) {
      this.mode = 0;
    }
    if (ds.selected && ds.selected.data.wall) {
      this.mode = 2;
      this.walls = true;
      this.room = ProjectHandler.findRoom(ds.selected, ds.selection.mesh);
      if (this.room && ds.selected.parent && ds.selected.parent.children) {
        if (ds.selected.parent.children.filter(c => !!c.data.room).length > 1) {
          this.mode = 3;
        }
      }
    }
    this.setMode(this.mode);
    if (ds.selection.mesh && ds.selected) {
      let mesh = ds.selection.mesh;
      let catalog = mesh.catalog;
      let e = ds.selected;
      while (e && !catalog) {
        catalog = e.catalog;
        e = e.parent;
      }
      this.catalogService
        .findMaterial(catalog, mesh.material)
        .subscribe(m => this.selectMaterial(m));
    }
  }

  modeChanged(change: MatSelectChange) {
    this.setMode(change.value);
  }

  setMode(mode: number) {
    this.mode = mode;
    if (this.undo) {
      this.undo();
      this.undo = undefined;
    }
    let selection = this.ds.selection;
    this.targets = [];
    if (mode === 0) {
      if (selection.mesh) {
        let mesh = selection.mesh;
        this.targets = [{e: this.ds.selected, mesh}];
      }
    }
    if (mode === 1) {
      selection.items.forEach(e => {
        if (e.meshes) {
          this.targets.push(...e.meshes.map(mesh => ({e, mesh})));
        }
      });
    }
    if (mode === 2) {
      this.ds.root.forEach(e => {
        if (e.data.wall && e.meshes) {
          this.targets.push(...e.meshes.map(mesh => ({e, mesh})));
        }
      });
    }
    if (mode === 3) {
      this.targets = ProjectHandler.findRoomWallMeshes(this.room);
    }
    let mat = this.group && this.group.materials.find(m => m.id === this.selectedId);
    if (mat) {
      this.applyMaterial(mat);
    }
  }

  itemTrackBy = (index: number, item: CatalogGroup | CatalogMaterial) => item.id;

  get canBack() {
    return this.group;
  }

  goBack() {
    this.setGroup(this.group.groupId);
  }

  applyMaterial(newMaterial: CatalogMaterial) {
    if (this.undo) {
      this.undo();
    }
    let old = this.targets.map(t => {
      return {
        e: t.e,
        mesh: t.mesh,
        material: t.mesh.material,
        catalog: t.mesh.catalog
      }
    });
    this.targets.forEach(t => {
      t.mesh.material = newMaterial.name;
      t.mesh.catalog = newMaterial.catalogId;
      t.e.changed();
    });
    this.undo = () => {
      old.forEach(item => {
        item.mesh.material = item.material;
        item.mesh.catalog = item.catalog;
        item.e.changed();
      })
    }
  }

  materialClick(m: CatalogMaterial | CatalogGroup) {
    if (m.type) {
      this.setGroup(m.id);
    } else {
      this.selectedId = m.id;
      this.applyMaterial(m as CatalogMaterial);
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
      let result = group$.pipe(share());
      this.groupSub = result.subscribe(f => {
        this.group = f;
        this.cd.markForCheck();
      });
      return result;
    }
  }

  isGroup(m: CatalogMaterial) {
    return m.type === MaterialType.Group;
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

  apply() {
    if (this.ds && this.undo) {
      this.undo = undefined;
      let items: BuilderApplyItem[] = [];
      for (let target of this.targets) {
        let item = items.find(i => i.uid === target.e);
        if (!item) {
          item = {
            uid: target.e,
            paint: {
              material: target.mesh.material,
              catalog: target.mesh.catalog,
              faces: []}
          };
          items.push(item);
        }
        (item.paint as any).faces.push(target.e.meshes.indexOf(target.mesh));
      }
      this.ds.applyBatch('Painting', items);
      this.close.next();
    }
  }
}
