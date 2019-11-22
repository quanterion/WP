import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CatalogService, CatalogProperty, CatalogMaterial } from '../../shared';
import {
  Parameter,
  ParameterType,
  Property,
  PropertyVariant
} from 'modeler/model-properties';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { MaterialSelectorComponent } from '../../planner/material-selector/material-selector.component';
import { NgModel } from "@angular/forms";
import { SizeInfo, ElasticParamView } from 'modeler/designer';
import { filter } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-catalog-property',
  templateUrl: './catalog-property.component.html',
  styleUrls: ['./catalog-property.component.css']
})
export class CatalogPropertyComponent implements OnInit {
  constructor(
    private catalogService: CatalogService,
    private dialog: DialogService,
    private _materialDialogs: MatDialog,
  ) {

  }

  ParameterType = ParameterType;
  _property: CatalogProperty;
  modelProperty = new Property();
  materialCache: CatalogMaterial[] = [];

  @Input() set property(value: CatalogProperty) {
    this._property = value;
    let data = {}
    if (value.data) {
      data = JSON.parse(value.data) || {};
    }
    this.modelProperty = Property.fromJson(data);
    this.modelProperty.id = value.id;
    this.modelProperty.name = value.name;
    this.modelProperty.description = value.description;
    if (this.modelProperty.variants.length < 1) {
      this.modelProperty.addVariant('Вариант1');
    }
    this._updateMaterialCache();
  }

  get property() { return this._property };

  @Input() sourceMaterials: CatalogMaterial[];

  @Input() sizeInfo: SizeInfo;
  @Input() parametricList: ElasticParamView[];

  @Output() save = new EventEmitter<CatalogProperty>();
  @Output() editMaterial = new EventEmitter<CatalogMaterial>();

  @Input() closable = false;

  private _updateMaterialCache() {
    let usedMaterials = new Set<string>();
    let paramIndex = 0;
    for (let param of this.modelProperty.params) {
      if (param.type === ParameterType.Material) {
        usedMaterials.add(`${this.property.catalogId}\n${param.value}`);
        for (let variant of this.modelProperty.variants) {
          usedMaterials.add(`${this.property.catalogId}\n${variant.values[paramIndex]}`);
        }
      }
      paramIndex++;
    }
    this.catalogService
      .findMaterials(Array.from(usedMaterials))
      .subscribe(list => (this.materialCache = list));
  }

  findMaterial(value: string) {
    return this.materialCache.find(m => m.name === value);
  }

  private addMaterialToCache(material: CatalogMaterial) {
    this.materialCache = this.materialCache.filter(m => m.name !== material.name);
    this.materialCache.push(material);
  }

  get paramList() {
    return this.modelProperty.params;
  }

  addVariant() {
    if (this.modelProperty.params.length > 0) {
      let param = this.modelProperty.params[0];
      if (param.type === ParameterType.Material) {
        this.selectMaterial('Choose material')
        .pipe(filter(m => !!m))
        .subscribe(m => {
          this.addMaterialToCache(m)
          this.modelProperty.addVariant(m.name).values[0] = m.name;
        });
        return;
      }
    }
    this.dialog
      .openPrompt({
        message: 'Enter a new variant name',
        value: ''
      })
      .afterClosed()
      .subscribe((newValue: string) => {
        if (newValue) {
          this.modelProperty.addVariant(newValue);
        }
      });
  }

  selectMaterial(caption: string, source = false) {
    let dialogRef = this._materialDialogs.open(MaterialSelectorComponent, {
      width: '50%',
      height: '60%',
      data: { catalogId: this.property.catalogId }
    });
    let selector = dialogRef.componentInstance;
    selector.caption = caption;
    if (source && this.sourceMaterials) {
      selector.materialList = this.sourceMaterials;
    } else {
      selector.catalogId = this.property.catalogId;
      selector.materials = this.catalogService.getMaterials(this.property.catalogId);
    }
    selector.addMaterials = !source;
    selector.select.subscribe(_ => dialogRef.close());
    return selector.select;
  }

  addMaterialParameter(material: CatalogMaterial) {
    if (this.modelProperty.variants.length === 1 && this.modelProperty.params.length === 0) {
      this.modelProperty.variants[0].name = material.name;
    }
    this.modelProperty.addParameter(ParameterType.Material, material.name);
    this.addMaterialToCache(material);
  }

  addParameter(type: ParameterType, value?: string | number, variantValue?: string | number) {
    let pt = ParameterType;
    if (type === pt.Material) {
      this.selectMaterial(
        'Choose material',
        true
      ).pipe(filter(m => !!m))
      .subscribe(m => this.addMaterialParameter(m));
    } else {
      if (type === pt.Width) {
        variantValue = this.sizeInfo ? this.sizeInfo.x : 1000;
      } else if (type === pt.Height) {
        variantValue = this.sizeInfo ? this.sizeInfo.y : 1000;
      } else if (type === pt.Depth) {
        variantValue = this.sizeInfo ? this.sizeInfo.z : 1000;
      } else if (type === pt.Position) {
        variantValue = this.sizeInfo ? this.sizeInfo.position : undefined;
      }
      this.modelProperty.addParameter(type, value, variantValue);
    }
  }

  chooseParamMaterial(param: Parameter) {
    this.selectMaterial('Choose material', true)
      .subscribe((material: CatalogMaterial) => {
        if (material) {
          param.value = material.name;
          this.addMaterialToCache(material)
        }
      });
  }

  chooseVariantMaterial(variant: PropertyVariant, paramIndex: number) {
    this.selectMaterial('Choose material', false)
      .subscribe((material: CatalogMaterial) => {
        if (material) {
          variant.values[paramIndex] = material.name;
          this.addMaterialToCache(material)
        }
      });
  }

  paramContextMenu(event: MouseEvent, param: Parameter, value: string) {
    if (param.type === ParameterType.Material) {
      event.preventDefault();
      let material = this.findMaterial(value);
      if (material) {
        this.editMaterial.next(material);
      }
    }
  }

  removeVariant(index: number) {
    this.modelProperty.variants.splice(index, 1);
  }

  removeParameter(index: number) {
    this.modelProperty.deleteParameter(index);
  }

  @ViewChild('name', { static: true }) nameModel: NgModel;

  saveChanges() {
    if (!this.nameModel.valid) {
      this.nameModel.control.markAsTouched();
      return;
    }
    let property = { ...this._property }
    property.name = this.modelProperty.name;
    property.description = this.modelProperty.description;
    property.data = JSON.stringify(this.modelProperty.toJson());
    let request = property.id ?
      this.catalogService.setProperty(property) :
      this.catalogService.addProperty(property.catalogId, property.name, property.data);
    request.subscribe(
        p => {
          Object.assign(this._property, property);
          this._property.id = p.id;
          this.save.next(this._property);
        },
        error =>
          this.dialog.openAlert({
            message: `Error saving property. ${error}`
          })
      );
  }

  cancel() {
    this.property = this._property;
    this.save.next(null);
  }

  variantDropped(event: CdkDragDrop<string[]>, propVariants: PropertyVariant[]) {
    moveItemInArray(propVariants, event.previousIndex, event.currentIndex);
  }

  ngOnInit() {}

  uploadTexture(value: string, file: File) {
    let material = this.findMaterial(value);
    if (material) {
      this.catalogService.uploadTexture(material, file).subscribe(response => {
        material.texture = response.texture;
        material.sizex = response.sizex;
        material.sizey = response.sizey;
        this.addMaterialToCache(response)
      });
    }
  }
}
