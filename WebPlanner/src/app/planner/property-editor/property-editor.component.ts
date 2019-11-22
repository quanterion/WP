import { Component, OnDestroy, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { WebDesigner } from 'modeler/webdesigner';
import { Property, PropertyVariant } from 'modeler/model-properties';
import {
  CatalogMaterial,
  CatalogService,
  CatalogProperty,
  createMaterial,
  CatalogMaterialCache,
  roundFloat
} from 'app/shared';
import { FloorBuilder } from 'modeler/floorplanner';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Entity, SizeInfo, BuilderApplyInfo, ElasticParamView } from "modeler/designer";
import { Subscription, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';
import { MaterialSelectorComponent, MaterialViewMode } from '../material-selector/material-selector.component';
import { ProjectHandler } from 'modeler/project-handler';
import { glMatrix, Contour, vec3 } from 'modeler/geometry';
import { contourArea } from 'modeler/geometry/geom_algorithms';
import { MathCalculator } from 'modeler/math-calculator';
import { RoofType } from 'modeler/roof-tool';
import { pb } from 'modeler/pb/scene';
import { map, merge, auditTime, tap} from 'rxjs/operators';
import { ModelHandler, EntityProperty } from 'modeler/model-handler';
import { EstimateService } from '../estimate';

@Component({
  selector: "app-property-editor",
  templateUrl: "./property-editor.component.html",
  styleUrls: ["./property-editor.component.scss"]
})
export class PropertyEditorComponent implements OnDestroy {
  constructor(
    private catalogService: CatalogService,
    private dialogs: MatDialog,
    private cd: ChangeDetectorRef,
    private estimate: EstimateService,
  ) {}

  price: number
  RoofType = RoofType;
  modelProperties: Observable<EntityProperty[]>;
  modelpropertyExpanded = new Set<number>();
  modelpropertyExpanded$ = new BehaviorSubject(null);
  sizeInfo: SizeInfo;
  verticalPos = 0;
  params: ElasticParamView[] = [];
  alignItem = false;
  positionItem = false;
  wall?: {
    thickness: number;
    height: number;
    baseline: number;
  };
  room?: {
    area?: string;
    perimeter?: string;
    height: number;
  };
  roof?: any;
  material?: CatalogMaterial;
  changeSub: Subscription;

  ds: WebDesigner;
  private _handler: ProjectHandler;
  @Input()
  set handler(value: ProjectHandler) {
    if (this.changeSub) {
      this.changeSub.unsubscribe();
      this.changeSub = undefined;
    }
    this.ds = undefined;
    if (value) {
      this.ds = value.ds;
      let onChange = value.ds.modelChange.pipe(
        merge(value.ds.selection.change),
        merge(value.ds.serverSync),
        merge(value.ds.serverError),
        auditTime(150)
      );
      this.changeSub = onChange.subscribe(() => this.updateProperties());
    }
    this.updateProperties();
    this._handler = value;
  }

  private _rootId?: string;

  @Output()close = new EventEmitter();

  @Input()
  set rootId(value: string | undefined) {
    this._rootId = value;
    this.updateProperties();
  }

  get rootId() {
    return this._rootId;
  }

  get handler() {
    return this._handler;
  }

  ngOnDestroy() {
    this.ds = undefined;
  }

  get selected() {
    let result: Entity;
    if (this.ds) {
      result = this.ds.selected;
      if (!result && this.rootId) {
        result = this.ds.root;
      }
    }
    return result;
  }

  get selectedItems() {
    let items = this.ds.selectedItems;
    if (items.length === 0 && this.rootId && this.ds.root) {
      items = [this.ds.root];
    }
    return items;
  }

  get type() {
    let s = this.selected;
    if (s) {
      if (s.data.floor) {
        return 2;
      }
      if (s.data.wall) {
        return 3;
      }
      if (s.data.room) {
        return 4;
      }
    }
    return this.ds.hasSelection ? 1 : 0;
  }

  get count() {
    return this.ds ? this.ds.selection.items.length : 0;
  }

  get name() {
    let s = this.selected;
    return s ? s.name : "";
  }

  get description() {
    let s = this.selected;
    return s ? s.data.model && s.data.model.description : "";
  }

  private propertyCache = new Map<number, CatalogProperty>();
  private propertyLoader = id => {
    let old = this.propertyCache.get(id);
    let prop = old ? of(old) : this.catalogService.getProperty(this.ds.root.catalog, id)
      .pipe(tap(cp => {
        this.propertyCache.set(id, cp);
        this.cd.markForCheck();
      }));
    return prop.pipe(map(Property.fromProperty));
  }

  isPropertyOpened(p: EntityProperty) {
    return (p.elements.length > 0) && this.modelpropertyExpanded.has(p.id);
  }

  toggleProperty(p: EntityProperty) {
    if (this.modelpropertyExpanded.has(p.id)) {
      this.modelpropertyExpanded.delete(p.id);
    } else {
      this.modelpropertyExpanded.add(p.id)
    }
    this.modelpropertyExpanded$.next(null);
  }

  private setMaterialProperty(
    catalog: number,
    name: string,
    defaultName = "Default"
  ) {
    this.catalogService
      .findMaterial(catalog, name)
      .subscribe(
        m => (this.material = m),
        _ => (this.material = createMaterial(defaultName))
      );
  }

  private materialCache = new CatalogMaterialCache(this.catalogService);

  private loadMaterials(props: EntityProperty[]) {
    let materials = ModelHandler.gatherMaterialsFromProperties(props);
    this.materialCache.add(materials).subscribe(_ => this.cd.markForCheck());
  }

  findMaterial(property: EntityProperty, variant?: PropertyVariant) {
    return this.materialCache.get(property.findMaterial(variant));
  }

  findValueMaterial(property: EntityProperty, value: number) {
    let variant = property.find(value);
    return variant && this.materialCache.get(property.findMaterial(variant));
  }

  private updateProperties() {
    this.modelProperties = undefined;
    this.sizeInfo = undefined;
    this.wall = undefined;
    this.material = undefined;
    this.room = undefined;
    this.roof = undefined;
    this.params = [];
    this.alignItem = false;
    this.positionItem = false;
    this.verticalPos = undefined;
    this.price = 0;
    if (this.ds) {
      let modelProps = ModelHandler.gatherProperties(this.ds.selectedItems, this.propertyLoader).pipe(
        tap(list => this.loadMaterials(list)));
      this.modelProperties = combineLatest(modelProps, this.modelpropertyExpanded$).pipe(map(r => r[0]));
      this.params = ProjectHandler.gatherParams(this.ds.selection.items);
      this.updateSizeInfo();

      let selected = this.selected;
      let selection = this.ds.selection.items;
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

      if (selected) {
        let priceElem = this.estimate.findElement(selected);
        if (priceElem) {
          this.price = priceElem.fullPrice;
        }
        if (selected.data) {
          this.updateRoomElementProperties(selected);
        }
        this.roof = selected.data.roof;
        if (selected.elastic) {
          let pos = selected.elastic.position;
          let Pos = pb.Elastic.Position;
          this.alignItem = pos >= Pos.Left && pos <= Pos.Front;
          this.positionItem = pos >= Pos.Vertical && pos <= Pos.FSplitter;
        }
      }

      this.verticalPos = getter(e => e && !e.isContainerItem && e.data.model && e.toGlobal(e.sizeBox.min)[1]);
      if (Number.isFinite(this.verticalPos)) {
        this.verticalPos = roundFloat(this.verticalPos);
      } else {
        this.verticalPos = undefined;
      }
    }
    this.cd.markForCheck();
  }

  private updateSizeInfo() {
    for (let e of this.selectedItems) {
      if (e.data) {
        if (e.data.wall || e.data.floor || e.data.ceiling || e.data.room || e.data.roof) {
          this.sizeInfo = undefined;
          break;
        }
      }
      let curInfo = e.getSizeInfo();
      if (e.data.propInfo && e.data.propInfo.size) {
        let size = e.data.propInfo.size;
        if (size['#width']) {
          curInfo.xe = false;
        }
        if (size['#height']) {
          curInfo.ye = false;
        }
        if (size['#depth']) {
          curInfo.ze = false;
        }
      }
      this.sizeInfo = this.sizeInfo || curInfo;
      if (!glMatrix.equalsd(curInfo.x, this.sizeInfo.x)) {
        this.sizeInfo.x = undefined;
      }
      if (!glMatrix.equalsd(curInfo.y, this.sizeInfo.y)) {
        this.sizeInfo.y = undefined;
      }
      if (!glMatrix.equalsd(curInfo.z, this.sizeInfo.z)) {
        this.sizeInfo.z = undefined;
      }
      this.sizeInfo.xe = this.sizeInfo.xe && curInfo.xe;
      this.sizeInfo.ye = this.sizeInfo.ye && curInfo.ye;
      this.sizeInfo.ze = this.sizeInfo.ze && curInfo.ze;
      if (this.sizeInfo.position !== curInfo.position) {
        this.sizeInfo.position = pb.Elastic.Position.None;
      }
    }
  }

  apply(name: string, mapper: (e: Entity) => BuilderApplyInfo) {
    let idMapper = (e: Entity) => ({uid: e, ...mapper(e)});
    this.ds.applyBatch(name, this.selectedItems.map(idMapper));
  }

  private updateRoomElementProperties(entity: Entity) {
    if (!entity.parent) return;
    if (entity.data.wall) {
      let wall = entity.data.wall;
      let floorData = entity.parent.data.floor;
      this.wall = {
        thickness: wall.thickness || floorData.wallThickness,
        height: wall.height || floorData.wallHeight,
        baseline: wall.baseline || 0
      };
      if (wall.material && wall.catalog) {
        this.setMaterialProperty(wall.catalog, wall.material, "Wall");
      } else {
        this.setMaterialProperty(
          floorData.wallCatalog,
          floorData.wallMaterial,
          "Wall"
        );
      }
    } else if (entity.data.room) {
      let height = entity.parent.data.floor.wallHeight;
      let room = entity.data.room;
      let contour = new Contour();
      contour.load(room.contour);
      let area = this.ds.floatToStr(contourArea(contour) * 1e-6);
      let perimeter = this.ds.floatToStr(contour.length * 1e-3);
      this.room = { height, area, perimeter };
      if (room.material) {
        this.setMaterialProperty(room.catalog, room.material, "Room");
      } else {
        let floorData = entity.parent.data.floor;
        this.setMaterialProperty(
          floorData.floorCatalog,
          floorData.floorMaterial,
          "Room"
        );
      }
    } else if (entity.data.ceiling) {
      let height = entity.parent.data.floor.wallHeight;
      this.room = { height };
      let ceiling = entity.data.ceiling;
      if (ceiling.material) {
        this.setMaterialProperty(ceiling.catalog, ceiling.material, "Ceiling");
      } else {
        let floorData = entity.parent.data.floor;
        this.setMaterialProperty(
          floorData.ceilingCatalog || floorData.floorCatalog,
          floorData.ceilingMaterial || floorData.floorMaterial,
          "Ceiling"
        );
      }
    } else if (entity.data.roof) {
      this.setMaterialProperty(entity.catalog, entity.data.roof.material || 'Roof', "Room");
    }
  }

  resizeModel(axis: string, value: string | number, param?: ElasticParamView) {
    let newSize = {};
    let min = param ? -MathCalculator.MAX_RANGE : 1;
    let floatValue = MathCalculator.calculateRange(value, min);
    newSize[axis] = floatValue;
    let entities = param ? param.entitites : this.selectedItems;
    let items = entities.map(e => {
      if (e.data.roof) {
        let roof = e.data.roof;
        switch (axis) {
          case '#width': roof.length = floatValue; break;
          case '#height': roof.height = floatValue; break;
          case '#depth': roof.width = floatValue; break;
        }
        return {uid: e, data: { roof }, updateRoof: true}
      }
      return {uid: e, size: newSize}
    });
    this.ds.applyBatch("Resize model", items);
  }

  moveModel(axis: number, oldValue: number, value: string | number) {
    let floatValue = MathCalculator.calculateRange(value);
    let dir = vec3.create();
    dir[axis] = floatValue - oldValue;
    let items = this.selectedItems.map(e => {
      let localDir = e.NtoLocal(dir);
      e.translate(localDir);
      return {uid: e, matrix: e.matrix};
    });
    this.ds.applyBatch("Move model", items);
  }

  private _updateFloorParameter(
    newValue: string,
    apply: (floor: FloorBuilder, value: number, wall?: number) => any,
    min?: number,
    max?: number
  ) {
    let floorElem = this.selected;
    let floorRoot = floorElem.findParent(p => !!p.data.floor);
    if (!floorRoot) {
      throw new Error("Selected element is outside floorplan");
    }
    let floor = new FloorBuilder(floorRoot);
    floor.init();
    let value = MathCalculator.calculate(newValue);
    if (min) {
      value = Math.max(value, min);
    }
    if (max) {
      value = Math.min(value, max);
    }
    let wallId = floorElem.data.wall ? floorElem.data.wall.id : undefined;
    if (value !== undefined && apply(floor, value, wallId) !== false) {
      floor.updateMap(floor.map);
      let command = floor.buildFloor();
      this.ds.apply("Update wall parameter", command);
    }
  }

  public setWallThickness(newValue: string) {
    this._updateFloorParameter(newValue, (floor, value, wall) => {
      floor.setWallThickness(wall, value);
    }, 1, 2000);
  }

  public setWallHeight(newValue: string) {
    this._updateFloorParameter(newValue, (floor, value, wall) => {
      if (wall) {
        floor.setWallHeight(wall, value);
      } else {
        floor.wallHeight = value;
      }
    }, 1, 10000);
  }

  public get wallBaseline() {
    return this.wall.baseline.toString();
  }

  public set wallBaseline(baseline: string) {
    this._updateFloorParameter(baseline, (floor, value, wall) => {
      floor.setWallBaseline(wall, value);
    });
  }

  selectMaterial(material?: CatalogMaterial) {
    let usedMaterial = material || this.material;
    let dialogRef = this.dialogs.open(MaterialSelectorComponent, {
      width: "50%",
      height: "60%",
      data: usedMaterial
    });
    let selector = dialogRef.componentInstance;
    if (usedMaterial) {
      selector.setCatalog(usedMaterial.catalogId);
    }
    selector.viewMode = MaterialViewMode.Grid;
    selector.displayCatalogs = true;
    selector.select.subscribe(_ => dialogRef.close());
    return selector.select;
  }

  changeFloor(floor: Entity, change: (floor: FloorBuilder) => void) {
    let builder = new FloorBuilder(floor);
    builder.init();
    change(builder);
    builder.updateMap(builder.map);
    let command = builder.buildFloor();
    this.ds.apply("Change wall material", command);
  }

  chooseMaterial() {
    this.selectMaterial().subscribe((mat: CatalogMaterial) => {
      let entity = this.selected;
      if (entity.data.wall) {
        this.changeFloor(entity.parent, f =>
          f.changeWallMaterial(entity.data.wall.id, mat.name, mat.catalogId)
        );
      }
      if (entity.data.room) {
        this.changeFloor(entity.parent, f =>
          f.changeRoomMaterial(entity.data.room.id, mat.name, mat.catalogId)
        );
      }
      if (entity.data.ceiling) {
        this.changeFloor(entity.parent, f =>
          f.changeCeilingMaterial(
            entity.data.ceiling.id,
            mat.name,
            mat.catalogId
          )
        );
      }
      if (entity.data.roof) {
        let roof = {...this.roof, material: mat.name};
        this.ds.applyToSelection('Change roof material',
          e => ({catalog: mat.catalogId, data: {roof}, updateRoof: true}));
      }
    });
  }

  propertyValueChanged(p: Property, event: MatSelectChange, e?: Entity) {
    let items = e ? [e] : this.ds.selectedItems;
    if (event.value) {
      ModelHandler.applyProperty(this.ds, p.id, event.value,
        items, this.propertyLoader).subscribe();
    }
  }

  renameSelection(newName: string) {
    this.apply("Rename", e => ({ name: newName }));
  }

  clearSelection() {
    this.ds.selection.clear();
  }

  applyRoofType(event: MatSelectChange) {
    let roof = {...this.roof, type: event.value};
    this.ds.applyToSelection('Change roof type', e => ({data: {roof}, updateRoof: true}));
  }

  resizeRoof(axis: number, value: string) {
    let floatValue = MathCalculator.calculateRange(value);
    if (!floatValue || floatValue < 5) return;
    let roof = {...this.roof};
    switch (axis) {
      case 0: roof.length = floatValue; break;
      case 1: roof.width = floatValue; break;
      case 2: roof.height = floatValue; break;
      case 3: roof.thickness = floatValue; break;
      case 4: roof.offset = floatValue; break;
    }
    this.ds.applyToSelection('Change roof type', e => ({data: {roof}, updateRoof: true}));
  }

  rotateRoof() {
    this.ds.applyToSelection('Rotate roof', e => {
      let roof = {...e.data.roof};
      let l = roof.length;
      let w = roof.width;
      roof.width = l;
      roof.length = w;
      let offset = Math.min(l, w) * 0.5;
      let center = vec3.fromValues(offset, 0, offset);
      let sign = l > w ? 1 : -1;
      e.rotate(e.toParent(center), e.parent.NtoLocal(vec3.axisy), sign * Math.PI / 2);
      return {
        matrix: e.matrix,
        data: {roof},
        updateRoof: true
      }
    });
  }

  fieldAppearance(writeable: boolean) {
    return writeable ? 'outline' : 'fill';
  }

  paramTrackBy = (_: number, item: ElasticParamView) => item.name;

  propertyTrackBy = (_: number, item: EntityProperty) => item.id;
}
