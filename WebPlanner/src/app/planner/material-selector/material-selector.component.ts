import {
  EventEmitter,
  Component,
  Inject,
  Optional,
  AfterViewInit
} from "@angular/core";
import { Observable } from 'rxjs';
import { Catalog, CatalogMaterial, CatalogService } from '../../shared';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

export enum MaterialViewMode {
  List,
  Grid
}

@Component({
  selector: 'app-material-selector',
  templateUrl: './material-selector.component.html',
  styleUrls: ['./material-selector.component.scss']
})
export class MaterialSelectorComponent implements AfterViewInit {
  constructor(
    private _catalogService: CatalogService,
    @Optional() @Inject(MAT_DIALOG_DATA) material: any
  ) {
    if (material && material.catalogId) {
      this.catalogId = material.catalogId;
    }
  }

  searchInputTerm = '';
  caption = 'Select material';
  addMaterials = true;
  catalogId: number;
  private firstLoadStarted = false;
  private _displayCatalogs = false;
  private _materialList: CatalogMaterial[] = [];
  myCatalogs: Catalog[] = [];
  sharedCatalogs: Catalog[] = [];
  select = new EventEmitter<CatalogMaterial>();
  viewMode: MaterialViewMode;

  ngAfterViewInit(): void {
    if (this.catalogId && !this.firstLoadStarted) {
      this.setCatalog(this.catalogId);
    }
  }

  get materialList() {
    return this._materialList;
  }

  set materialList(value) {
    this._materialList = value;
    this.firstLoadStarted = true;
  }

  set materials(value: Observable<CatalogMaterial[]>) {
    value.subscribe(list => (this.materialList = list));
  }

  set displayCatalogs(value: boolean) {
    this._displayCatalogs = value;
    if (value) {
      this._catalogService
        .getCatalogs()
        .subscribe(list => (this.myCatalogs = list));
      this._catalogService
        .getSharedCatalogs()
        .subscribe(list => (this.sharedCatalogs = list));
    }
  }

  get displayCatalogs() {
    return this._displayCatalogs;
  }

  selectCatalog(event: MatSelectChange) {
    this.setCatalog(event.value);
  }

  setCatalog(id: number) {
    this.catalogId = id;
    this.firstLoadStarted = true;
    this._catalogService.getMaterials(id).subscribe(list => {
      this.materialList = list;
    });
  }

  get filteredList() {
    if (this.searchInputTerm) {
      let normalizedTerm = this.searchInputTerm.toLocaleLowerCase();
      return this.materialList.filter(
        material =>
          material.name.toLocaleLowerCase().indexOf(normalizedTerm) >= 0
      );
    } else {
      return this.materialList;
    }
  }

  get canCreateMaterial() {
    if (!this.addMaterials || !this.catalogId) {
      return false;
    }
    if (this.displayCatalogs) {
      if (!this.myCatalogs) {
        return false;
      }
      let catalog = this.myCatalogs.find(c => c.id === this.catalogId);
      if (!catalog || catalog.readOnly) {
        return false;
      }
    }
    let normalizedTerm = (this.searchInputTerm || '').toLocaleLowerCase();
    return (
      this.catalogId &&
      this.searchInputTerm &&
      !this.materialList.find(
        m => m.name.toLocaleLowerCase() === normalizedTerm
      )
    );
  }

  createMaterial(name: string) {
    this._catalogService
      .addMaterial(this.catalogId, name)
      .subscribe(m => this.select.emit(m));
  }
}
