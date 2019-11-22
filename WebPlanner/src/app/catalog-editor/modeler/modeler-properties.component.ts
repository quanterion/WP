import { Component, Input, EventEmitter, OnDestroy, Output, Inject } from '@angular/core';
import { WebDesigner } from 'modeler/webdesigner';
import { merge, of, Observable } from 'rxjs';
import { debounceTime, takeUntil, map, tap, concatMap } from 'rxjs/operators';
import { CatalogService, CatalogProperty, CatalogMaterialCache, FileItem, FilesService } from '../../shared';
import { SizeInfo, ElasticParamView, ModelUnits, ElasticParam, MountType, Entity, BuilderApplyInfo } from 'modeler/designer';
import { Property, ElementBill, PropertyVariant } from 'modeler/model-properties';
import { ModelHandler, EntityProperty } from 'modeler/model-handler';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { MatSelectChange } from '@angular/material/select';
import { PropertySelectorComponent } from '../property-selector/property-selector.component';
import { MathCalculator } from 'modeler/math-calculator';
import { pb } from 'modeler/pb/scene';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { glMatrix } from 'modeler/geometry';

@Component({
  selector: 'app-modeler-properties',
  templateUrl: './modeler-properties.component.html',
  styleUrls: ['./modeler-properties.component.scss']
})
export class ModelerPropertiesComponent implements OnDestroy {

  constructor(private catalogs: CatalogService, private files: FilesService,
    private dialog: DialogService) { }

  stop$ = new EventEmitter();
  ElementBill = ElementBill;

  ngOnDestroy(): void {
    this.stop$.next();
    this.stop$.complete();
  }

  @Input() file?: FileItem;
  @Output() fileChanged = new EventEmitter<FileItem>();
  @Input() editable = true;
  @Output() openPropertyEditor = new EventEmitter<CatalogProperty | number | null>();

  private _ds: WebDesigner;
  name: string;
  sizeInfo: SizeInfo;
  elastic = false;
  root = false;
  modelProperties: Observable<EntityProperty[]>;
  params: ElasticParamView[] = [];
  symmetry: number;
  type: string;
  layerName: string;
  mountType: MountType;
  elasticItemPosition: pb.Elastic.Position;
  elementBill: ElementBill;
  elementSku: string;
  elementDescription: string;
  elementPrice: number;
  paint: boolean;

  @Input()
  set ds(value: WebDesigner) {
    this.stop$.next();
    this._ds = value;
    if (value) {
      merge(value.selection.change, value.modelChange, value.serverSync).pipe(
        debounceTime(100),
        takeUntil(this.stop$)
      ).subscribe(_ => this.modelChanged());
      this.modelChanged();
    }
  }

  get ds() {
    return this._ds;
  }

  get selection() {
    let items = this.ds.selectedItems;
    if (items.length === 0) {
      items = [this.ds.root];
    }
    return items;
  }

  private propertyCache = new Map<number, CatalogProperty>();
  private propertyLoader = id => {
    let old = this.propertyCache.get(id);
    let prop = old ? of(old) : this.catalogs.getProperty(this.ds.root.catalog, id)
      .pipe(tap(cp => this.propertyCache.set(id, cp)));
    return prop.pipe(map(Property.fromProperty));
  }

  modelChanged() {
    if (!this.ds) {
      return;
    }

    this.root = this.ds.selectedItems.length < 1;
    let selection = this.selection;
    let getter = <T>(prop: (e: Entity) => T) => {
      let first = prop(selection[0]);
      for (let k = 1; k < selection.length; ++k) {
        let value = prop(selection[k]);
        if (typeof first === 'number') {
          if (typeof value !== 'number' || !glMatrix.equals(first, value, 0.1)) {
            return undefined;
          }
        } else if (value !== first) {
          return undefined;
        }
      }
      return first;
    }

    this.name = (this.root ? this.file && this.file.name : getter(e => e.name)) || '';
    this.modelProperties = ModelHandler.gatherProperties(selection, this.propertyLoader)
      .pipe(tap(list => this.loadMaterials(list)));
    this.sizeInfo = selection.length === 1 ? selection[0].getSizeInfo() : undefined;
    if (this.sizeInfo && this.sizeInfo.x < 0) {
      this.sizeInfo = undefined;
    }
    this.elastic = this.sizeInfo && (this.sizeInfo.xe || this.sizeInfo.ye || this.sizeInfo.ze);
    this.mountType = getter(e => e.data.mountType || 0);
    this.symmetry = getter(e => e.data.symmetry || 0);
    this.type = getter(e => e.type) || '';
    this.layerName = getter(e => e.layer && e.layer.name) || '';
    this.params = ModelHandler.gatherParams(selection);
    this.paint = getter(e => !!e.data.paint);
    this.elasticItemPosition = getter(e => e.elastic && e.elastic.position) || 0;
    this.elementBill = getter(e => e.data.model && e.data.model.bill) || 0;
    this.elementSku = getter(e => e.data.model && e.data.model.sku) || '';
    this.elementDescription = getter(e => e.data.model && e.data.model.description) || '';
    this.elementPrice = getter(e => e.data.model && e.data.model.price) || 0;
  }

  apply(name: string, mapper: (e: Entity) => BuilderApplyInfo) {
    let idMapper = (e: Entity) => ({uid: e, ...mapper(e)});
    this.ds.applyBatch(name, this.selection.map(idMapper));
  }

  applyInfo(name: string, data: BuilderApplyInfo) {
    this.apply(name, _ => data);
  }

  setName(name: string) {
    if (this.ds.hasSelection) {
      this.applyInfo('Rename', { name });
    } else {
      this.name = name;
      this.file.name = name;
      this.files.renameFile(this.file, name)
        .subscribe(_ => this.fileChanged.emit(this.file));
    }
  }

  get modelUnits() {
    if (this.ds && this.ds.root) {
      let data = this.ds.root.data;
      if (data && data.import) {
        return data.import.units;
      }
    }
  }

  set modelUnits(value: string) {
    let importData = this.ds.root.data.import;
    let scale = ModelUnits[importData.units];
    importData.units = value;
    let newScale = ModelUnits[value];
    this.ds.apply('Update properties', {
      uid: this.ds.root,
      data: { import: importData },
      scale: newScale / scale }
    ).then(_ => this.ds.zoomToFit());
  }

  setLayerName(name: string) {
    this.applyInfo('Change layer', { layer: name });
  }

  setMountType(value: string) {
    let type = parseInt(value, 10);
    this.applyInfo('Update properties', { data: { mountType: type } });
  }

  setType(value: string) {
    this.applyInfo('Update properties', { type: value });
  }

  setElasticItemPosition(value) {
    let position = parseInt(value || '0', 10);
    this.applyInfo('Update properties', { elastic: { position } });
  }

  setPaint(event: MatSlideToggleChange) {
    this.applyInfo('Update properties', { data: { paint: event.checked } });
  }

  setContainer(event: MatSlideToggleChange) {
    this.applyInfo('Update properties', { elastic: { container: event.checked } });
  }

  setElementBill(bill: ElementBill) {
    this.applyInfo('Update properties', { data: { model: { bill }, merge: true } });
  }

  setElementSku(sku: string) {
    this.applyInfo('Update properties', { data: { model: { sku }, merge: true } });
  }

  setElementDescription(description: string) {
    this.applyInfo('Update properties', { data: { model: { description }, merge: true } });
  }

  setElementPrice(value: string) {
    let price = MathCalculator.calculateRange(value, 0);
    this.applyInfo('Update properties', { data: { model: { price }, merge: true } });
  }

  paramTrackBy = (_, item: ElasticParam) => item.name;

  fieldAppearance(writeable: boolean) {
    return writeable ? 'outline' : 'standard';
  }

  resizeModel(axis: string, value: string | number, param?: ElasticParamView) {
    let newSize = {};
    let min = param ? -MathCalculator.MAX_RANGE : 1;
    newSize[axis] = MathCalculator.calculateRange(value, min);
    if (param) {
      this.ds.applyBatch(name, param.entitites.map(e => {
        return {uid: e, size: newSize};
      }));
    } else {
      this.applyInfo('Resize model', {size: newSize});
    }
  }

  applyElastic(axis: string, value: boolean) {
    let elastic: any = {};
    elastic['elastic' + axis] = value;
    this.applyInfo('Resize model', {elastic});
  }

  setSymmetry(value: string) {
    let symmetry = value ? parseInt(value, 10) : null;
    this.applyInfo('Update properties', {data: {symmetry}});
  }

  symmetryModel() {
    this.applyInfo("symmetry", {symmetry: true});
  }

  removeProperty(event: MouseEvent, p: Property) {
    event.stopPropagation();
    event.preventDefault();

    this.dialog
      .openConfirm({
        message: `Are you sure to remove property ${p.name}?`
      })
      .afterClosed()
      .subscribe(accept => {
        if (accept) {
          this.closePropertyEditor();
          ModelHandler.removeProperty(this.ds, p.id, this.selection,
            this.propertyLoader).subscribe();
        }
      });
  }

  editProperty(event: MouseEvent, p: Property) {
    event.stopPropagation();
    event.preventDefault();
    this.activatePropertyEditor(p.id);
  }

  private activatePropertyEditor(p: CatalogProperty | number) {
    this.openPropertyEditor.next(p);
  }

  addPropertyDialog() {
    let dialogRef = this.dialog.open(PropertySelectorComponent, {
      width: '50%',
      height: '70%'
     });
    let selector = dialogRef.componentInstance;
    selector.properties = this.catalogs.getCatalogProperties(
      this.ds.root.catalog
    );
    selector.select.subscribe(prop => {
      dialogRef.close();
      if (prop) {
        this.addProperty(prop);
      } else if (prop === null) {
        this.createNewProperty();
      }
    });
  }

  createNewProperty() {
    this.activatePropertyEditor(undefined);
    this.ds.invalidate();
  }

  private closePropertyEditor() {
    this.openPropertyEditor.next(null)
    this.ds.invalidate();
  }

  propertyValueChanged(p: Property, event: MatSelectChange) {
    p.value = event.value;
    ModelHandler.applyProperty(this.ds, p.id, event.value, this.selection,
      this.propertyLoader).subscribe();
  }

  addProperty(prop: CatalogProperty) {
    this.catalogs
      .getProperty(this.ds.root.catalog, prop.id)
      .subscribe(prop => {
        let newProp = Property.fromProperty(prop);
        ModelHandler.addProperty(this.ds, newProp, this.selection,
          this.propertyLoader).subscribe();
      });
  }

  addOrSaveProperty(property?: CatalogProperty) {
    if (property) {
      this.propertyCache.set(property.id, property);
    }
    if (property) {
      this.addProperty(property);
    } else {
      this.modelChanged();
    }
    this.closePropertyEditor();
  }

  selectPropertyElements(p: EntityProperty) {
    this.ds.selection.clear();
    p.elements.forEach(el => {
      if (el.e.parent) {
        el.e.selected = true;
      }
    });
  }

  private materialCache = new CatalogMaterialCache(this.catalogs);

  private loadMaterials(props: EntityProperty[]) {
    let materials = ModelHandler.gatherMaterialsFromProperties(props);
    this.materialCache.add(materials);
  }

  findMaterial(property: EntityProperty, variant?: PropertyVariant) {
    return this.materialCache.get(property.findMaterial(variant));
  }

  updateThumbnail() {
    if (!this.editable) return;
    this.ds.render.takePicture({
      width: 110,
      height: 110,
      drawings: false,
      fit: true,
      taa: true,
      invalidate: true
    }).pipe(
      concatMap(thumb => this.files.updateThumbnail(this.file.id.toString(), thumb)),
      tap(result => this.file.preview = result.preview)
    ).subscribe(_ => this.fileChanged.emit(this.file));
  }

  uploadThumbnail(thumbnail: File) {
    this.files.updateCustomThumbnail(this.file.id, thumbnail).subscribe(result => {
      this.file.preview = result.preview
      this.fileChanged.emit(this.file);
    })
  }

  addParameter() {
    alert('Not implemented yet');
  }

}
