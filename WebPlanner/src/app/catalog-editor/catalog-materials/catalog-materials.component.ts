import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  AuthService,
  CatalogService,
  CatalogMaterial,
  CatalogGroup,
  MaterialType,
  copyMaterial
} from '../../shared';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from "@angular/material/snack-bar";
import { CatalogViewService } from '../catalog-view.service';
import { filter, concatMap, finalize } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { DialogService } from 'app/dialogs/services/dialog.service';

@Component({
  selector: 'app-catalog-materials',
  templateUrl: './catalog-materials.component.html',
  styleUrls: ['./catalog-materials.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CatalogMaterialsComponent implements OnInit {
  private _catalogId: number;
  group: CatalogGroup;
  groups: CatalogMaterial[] = [];
  materials: CatalogMaterial[] = [];
  displayedColumns = ['name'];
  loading = false;
  material: CatalogMaterial;
  selectedMaterialId: number = undefined;
  materialTracker = (_, material: CatalogMaterial) => material.id;

  constructor(
    private catalogService: CatalogService,
    private dialogService: DialogService,
    authService: AuthService,
    private snackBar: MatSnackBar,
    private searchService: CatalogViewService,
    private router: Router,
    route: ActivatedRoute
  ) {
    combineLatest(
      route.parent.params,
      route.queryParams,
      authService.isAuthenticated,
      this.searchService.result,
      (p, q) => ({p, q})).subscribe(data => {
        let groupId = Number(data.q["group"] || 0);
        let catalogId = Number(data.p["id"]);
        let sameGroup = this.group &&
          (this.group.id === groupId ||
          (!groupId && this.group.catalogId === catalogId && !this.group.groupId));
        this.assignSelection(data.q);
        if (!sameGroup) {
          this._catalogId = catalogId;
          this._updateMaterials(groupId);
        }
    });
  }

  private assignSelection(queryParams) {
    let mid = Number(queryParams["mid"]);
    if (this.group) {
      this.material = this.group.materials.find(m => m.id === mid);
    }
    this.selectedMaterialId = mid;
  }

  ngOnInit() {}

  private _updateMaterials(groupId: number) {
    if (this.searchService.result.value) {
      this.setGroup({
        name: 'Поиск',
        type: MaterialType.Group,
        catalogId: this._catalogId,
        materials: this.searchService.result.value.materials,
        readOnly: true
      });
    } else if (this._catalogId) {
      this.loading = true;
      this.catalogService
        .getGroup(this._catalogId, groupId)
        .pipe(finalize(() => this.loading = false))
        .subscribe(res => this.setGroup(res));
    }
  }

  private setGroup(group: CatalogGroup) {
    this.group = group;
    let compare = (a, b) => a.name.localeCompare(b.name);
    this.groups = group.materials.filter(m => m.type === MaterialType.Group).sort(compare);
    this.materials = group.materials.filter(m => m.type !== MaterialType.Group).sort(compare);
    this.material = group.materials.find(m => m.id === this.selectedMaterialId);
  }

  selectMaterial(m: CatalogMaterial) {
    this.router.navigate([], { queryParams: {mid: m.id}, queryParamsHandling: 'merge' });
  }

  selectGroup(group: number) {
    this.router.navigate([], { queryParams: {group}, queryParamsHandling: 'merge' });
  }

  uploadTexture(m: CatalogMaterial, file: File) {
    this.catalogService.uploadTexture(m, file).subscribe(response => {
      m.texture = response.texture;
      m.sizex = response.sizex;
      m.sizey = response.sizey;
    });
  }

  addNewMaterial() {
    this.dialogService
      .openPrompt({
        message: 'Enter the name of a new material',
        title: 'New material'
      })
      .afterClosed()
      .subscribe((newValue: string) => {
        if (newValue) {
          this.catalogService
            .addMaterial(this._catalogId, newValue, this.group.id)
            .subscribe(m => {
              let list = this.group.materials;
              list.push(m);
              this.setGroup(this.group);
              this.router.navigate([], {
                queryParams: {group: m.groupId, mid: m.id},
                queryParamsHandling: 'merge'
              });
            },
            error => this.snackBar.open(`Failed to add new material. ${error}`));
        }
      });
  }

  removeMaterialDialog(m: CatalogMaterial | CatalogGroup, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.dialogService
      .openConfirm({
        message: `Are you sure to remove material ${m.name}?`
      })
      .afterClosed()
      .subscribe(accept => {
        if (accept) {
          this.catalogService.removeMaterial(m).subscribe(
            _ => this.doRemoveMaterial(m),
            error =>  this.snackBar.open(`Failed to remove material ${m.name}. ${error.toString() || error}`));
        }
      });
  }

  private doRemoveMaterial(m: CatalogMaterial | CatalogGroup) {
    let list = this.group.materials;
    list = list.filter(item => item !== m),
    this.group.materials = list;
    this.setGroup(this.group);
    if (m === this.material) {
      this.router.navigate([]);
    }
  }

  addGroup() {
    this.dialogService
      .openPrompt({
        message: `Enter group name`
      })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(name => this.catalogService.addGroup(this.group.catalogId, name, this.group.id))
      ).subscribe(newGroup => {
        this.router.navigate([], {
          queryParams: { group: newGroup.id},
          queryParamsHandling: 'merge'
        });
      });
  }

  dragOver(event: DragEvent) {
    if (this.group && !this.group.readOnly) {
      event.preventDefault();
    }
  }

  dragStart(event: DragEvent, material: CatalogMaterial | CatalogGroup, texture: boolean) {
    let data = {
      material,
      texture
    }
    event.dataTransfer.setData('material', JSON.stringify(data));
  }

  materialMove(event: DragEvent, groupId: number) {
    let data = JSON.parse(event.dataTransfer.getData('material'));
    if (data && data.material) {
      let material = data.material as CatalogMaterial;
      material.groupId = groupId;
      if (material.groupId !== material.id) {
        this.catalogService.updateMaterial(material).subscribe(_ => {
          this.group.materials = this.group.materials.filter(m => m.id !== material.id);
          this.setGroup(this.group);
          if (material.type) {
            this.snackBar.open('Группа успешно перемещена');
          } else {
            this.snackBar.open('Материал успешно перемещён');
          }
        });
      }
    }
  }

  materialAssign(event: DragEvent, dest: CatalogMaterial) {
    event.preventDefault();

    if (event.dataTransfer.files.length > 0) {
      let file = event.dataTransfer.files[0];
      this.uploadTexture(dest, file);
      return;
    }

    let data = JSON.parse(event.dataTransfer.getData('material') || null);
    if (data && data.material && !data.material.type) {
      let material = data.material as CatalogMaterial;
      let old = copyMaterial(dest);
      if (data.texture) {
        dest.texture = material.texture;
      } else {
        material.id = dest.id;
        material.name = dest.name;
        Object.assign(dest, material);
      }
      this.catalogService.updateMaterial(dest).subscribe(_ => {
        this.snackBar.open('Материал успешно изменён', 'ОТМЕНА').onAction().subscribe(_ => {
          Object.assign(dest, old);
          this.catalogService.updateMaterial(dest).subscribe();
        });
      });
    }
  }
}
