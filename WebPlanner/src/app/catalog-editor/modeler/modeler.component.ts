import { Component, OnInit, ViewChild, OnDestroy, HostListener, NgZone,
  EventEmitter, TemplateRef } from "@angular/core";
import { trigger, style, transition, animate } from '@angular/animations';
import { AuthService, Catalog, CatalogProperty, CatalogMaterial, FileItem,
  CatalogService, FilesService } from 'app/shared';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, merge } from 'rxjs';

import { WebDesigner, supportedModelExtensions } from 'modeler/webdesigner';
import { MouseInfo, CameraAction } from "modeler/actions";
import { Entity, NavigationMode, ElasticParamView, SizeInfo } from 'modeler/designer';
import { materialPointer } from 'modeler/render/renderer';
import { RenderMode } from 'modeler/render/renderer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeshBundle } from "modeler/render/render-scene";
import { ModelHandler } from "modeler/model-handler";
import { ModelHistoryComponent } from "app/planner/model-history/model-history.component";
import { takeUntil, concatMap, share, map, tap, switchMap, debounceTime, filter } from "rxjs/operators";
import { combineLatest, of } from "rxjs";
import { ModelerPropertiesComponent } from "./modeler-properties.component";
import { CatalogPropertyComponent } from "../catalog-property/catalog-property.component";
import { EstimateService, PriceElement, PriceList } from "../../planner/estimate";
import { CatalogViewService } from "../catalog-view.service";
import { RotateDialogComponent } from "app/planner/rotate-dialog/rotate-dialog.component";
import { vec3, mat4 } from "modeler/geometry";
import { DialogService } from "app/dialogs/services/dialog.service";
import { DesignerErrorType } from "modeler/builder-designer";
import { TdFileInputComponent } from "app/shared/file/file-input/file-input.component";
import { BreakpointObserver } from "@angular/cdk/layout";
import { TdFileService } from "app/shared/file/services/file.service";
import { FilePropertiesComponent, FilePropertiesDisplay } from "../file-properties-dialog/file-properties-dialog.component";

class ModelerAction extends CameraAction {

  protected up(mouse: MouseInfo) {
    if (mouse.middle) {
      let ray = this.createRay(mouse);
      if (this.intersect(ray)) {
        let entity = <Entity>ray.entity;
        let animEntity;
        while (entity) {
          if (entity.anim) {
            animEntity = entity;
          }
          entity = entity.parent;
        }
        if (animEntity) {
          this.ds.animateEntity(animEntity);
        }
      }
    }
    if (mouse.right) {

    }
    super.up(mouse);
  }

  public takeEntity(e: Entity) {
    while (e.parent && e.parent.parent) {
      e = e.parent;
    }
    return e;
  }
}

@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.scss'],
  providers: [EstimateService],
  animations: [
    trigger("materialPanelAnimation", [
      transition(':enter', [
        style({transform: 'translateY(100%)'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(100%)'}))
      ]),
      transition('* => *', [
        style({transform: 'translateX(100%)'}),
        animate('200ms ease-out', style({transform: 'translateX(0%)'})),
      ]),
    ]),
    trigger("propertyPanelAnimation", [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(-100%)'}))
      ]),
      transition('* => *', [
        style({transform: 'translateX(-100%)'}),
        animate('300ms ease-out', style({transform: 'translateX(0%)'})),
      ]),
    ]),
    trigger("undoAnimation", [
      transition(':increment', [
        animate('200ms ease-out', style({transform: 'rotateZ(-360deg)'})),
      ]),
    ]),
    trigger("redoAnimation", [
      transition(':increment', [
        animate('200ms ease-out', style({transform: 'rotateZ(360deg)'})),
      ]),
    ])
  ]
})
export class ModelerComponent implements OnInit, OnDestroy {
  ds: WebDesigner;
  handler: ModelHandler;
  loadingIndicator$: Observable<boolean>;
  modelId: string;
  canvasImageData: string;
  fileItem: FileItem;
  folder$: Observable<FileItem[]>;
  readOnlyMode = true;
  accessForbidden = false;
  loading = true;
  editable = false;
  sizeInfo: SizeInfo;
  // source materials, before replacement
  modelMaterials: CatalogMaterial[] = [];
  usedMaterials: CatalogMaterial[] = [];
  hasAnimations = false;
  selectedMaterial: CatalogMaterial;
  selectedMaterialState;
  propertiesLoaded = false;
  editedProperty: CatalogProperty;
  newMaterialForProperty: CatalogMaterial;
  parametricList: ElasticParamView[];
  destroy$ = new EventEmitter<void>();
  modelExtensionsFilter = supportedModelExtensions().map(e => '.' + e).join(', ');
  params: ElasticParamView[] = [];

  _catalogs$: Observable<Catalog[]>;
  _nestedCatalogs$: Observable<Catalog[]>;

  constructor(
    private zone: NgZone,
    public auth: AuthService,
    private _router: Router,
    private route: ActivatedRoute,
    private catalogs: CatalogService,
    private dialog: DialogService,
    private fileService: FilesService,
    private snackBar: MatSnackBar,
    public catalogView: CatalogViewService,
    public estimate: EstimateService,
    private breakpointObserver: BreakpointObserver,
    private tdFileService: TdFileService
  ) {
    this.folder$ = this.route.params.pipe(
      concatMap(params => this.fileService.getFile(params['id'])),
      concatMap(file => this.fileService.getFile(file.parentId, true)),
      map(folder => folder.files)
    );
  }

  private _updateFileItem() {
    let obs = this.fileService.getFile(Number(this.modelId)).pipe(share());
    obs.subscribe(
      res => {
        this.fileItem = res;
        this.readOnlyMode = !!this.fileItem.readOnly;
        this.editable = !this.readOnlyMode;
        this.ds.editable = this.editable;
      },
      _ => {
        this.accessForbidden = true;
        this.loading = false;
      }
    );
    return obs;
  }

  ngOnInit() {
    let canvas3d = <HTMLCanvasElement>document.getElementById('canvas3d');
    let ds = new WebDesigner(canvas3d, this.zone, this.auth, this.catalogs, this.snackBar, this.breakpointObserver);
    this.loadingIndicator$ = ds.processing.pipe(debounceTime(250));
    ds.serverError.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error.type === DesignerErrorType.InvalidAction) {
        this.snackBar.open(error.info || 'Invalid action');
      }
    });
    this.handler = new ModelHandler(ds);
    this.ds = ds;
    ds.options.navigator = true;
    ds.render.lightDisplayColor = [1, 1, 0];
    ds.render.overDrawLights = true;
    ds.modelChange.pipe(
      debounceTime(100),
      takeUntil(this.destroy$)
    ).subscribe(_ => this.modelChanged());
    this.orbitCamera();
    ds.defaultAction = () => new ModelerAction(ds);
    this.ds.render.materialChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => this._updateMaterialList());
    combineLatest(this.route.params, this.auth.isAuthenticated).pipe(
      concatMap(result => {
        let id = result[0]['id'];
        if (id) {
          this.selectedMaterial = undefined;
          this.editedProperty = undefined;
          this.modelId = id.toString();
          ds.loadModel(this.modelId).then(_ => this.modelChanged());
          return this._updateFileItem();
        }
        return of(undefined);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
    merge(this.catalogView.activePriceList, ds.render.texturesLoaded, ds.modelChange, ds.serverSync)
    .pipe(
      tap(param => {
        if (param instanceof PriceList) {
          this.estimate.priceList = param;
        }
      }),
      debounceTime(100),
      switchMap(_ => {
        if (this.ds && this.ds.root) {
          return this.estimate.compute(this.ds.root, this.ds.render.materials, this.fileItem);
        }
        return of(undefined);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.ds.destroy();
    this.ds = undefined;
  }

  downloadFile(format?: string) {
    this.tdFileService.openDownloadDialog(this.fileItem, format, undefined, true);
  }

  startEditing() {
    this.editable = true;
    this.readOnlyMode = false;
    this.ds.editable = true;
    this.ds.invalidate();
  }

  private _updateMaterialList() {
    this.usedMaterials = this.ds.usedMaterials();
  }

  selectMaterial(m: CatalogMaterial) {
    this.selectedMaterial = m;
    this.selectedMaterialState = m.id;
  }

  materialParamChanged(_: CatalogMaterial) {
    this.ds.invalidate();
  }

  private modelChanged() {
    if (!this.ds.root) {
      return;
    }
    this.sizeInfo = this.ds.root.getSizeInfo();
    this._updateMaterialList();
    this.hasAnimations = false;
    this.ds.root.forAll(e => {
      if (e.anim) {
        this.hasAnimations = true;
      }
    });
  }

  uploadTexture(m: CatalogMaterial, file: File) {
    if (!this.editable) return;
    this.catalogs.uploadTexture(m, file).subscribe(response => {
      m.texture = response.texture;
      m.sizex = response.sizex;
      m.sizey = response.sizey;
      this.ds.invalidate();
      this._updateMaterialList();
    });
  }

  private getMeshBundleFromMouse(event: MouseEvent): MeshBundle {
    let mouseInfo = new MouseInfo();
    mouseInfo.set(event);
    let ray = this.ds.action.createRay(mouseInfo);
    this.ds.intersect(ray);
    if (ray.intersected && ray.mesh) {
      let material = ray.mesh.material;
      let catalogId = undefined;
      let entity = <Entity>ray.entity;
      while (entity) {
        if (entity.catalog) {
          catalogId = entity.catalog;
          break;
        }
        entity = entity.parent;
      }
      entity = <Entity>ray.entity;
      while (entity) {
        if (entity.materialMap && entity.materialMap[material]) {
          material = entity.materialMap[material];
          break;
        }
        entity = entity.parent;
      }
      if (catalogId && material) {
        let pointer = materialPointer(catalogId, material);
        return this.ds.render.scene.materials[pointer];
      }
    }
  }

  @ViewChild(TdFileInputComponent, { static: false }) fileUpload: TdFileInputComponent;
  uploadNewModel() {
    this.fileUpload.inputElement.click();
    this.fileUpload.clear();
  }

  dropTexture(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    let transfer = event.dataTransfer;
    if (transfer.files.length !== 1) return;
    let file = transfer.files[0];
    let ext = file.name.split('.').pop().toLocaleLowerCase();
    if (supportedModelExtensions().includes(ext)) {
      this.replaceModel(file);
    } else {
      let bundle = this.getMeshBundleFromMouse(event);
      if (bundle) {
        this.uploadTexture(bundle.renderMaterial, file);
      }
    }
  }

  onDragOver(event: Event): void {
    let transfer: DataTransfer = (<DragEvent>event).dataTransfer;
    transfer.dropEffect = 'copy';
    event.preventDefault();
  }

  canvasMouseup(event: MouseEvent) {
    if (this.ds.action) {
      if (!this.ds.action.moving && event.button === 2) {
        this.selectMaterialByMouse(event);
      }
    }
  }

  canvasDoubleClick(event: MouseEvent) {
    this.selectMaterialByMouse(event);
  }

  private selectMaterialByMouse(event: MouseEvent) {
    let bundle = this.getMeshBundleFromMouse(event);
    if (bundle && bundle.renderMaterial) {
      this.selectMaterial(bundle.renderMaterial);
    }
  }

  get hasSelection() {
    return this.ds && this.ds.selection.items.length > 0;
  }

  @ViewChild(CatalogPropertyComponent, { static: false }) catalogPropertyEditor?: CatalogPropertyComponent;

  catalogPropertyAnimationDone() {
    if (this.newMaterialForProperty && this.catalogPropertyEditor) {
      this.catalogPropertyEditor.addMaterialParameter(this.newMaterialForProperty);
    }
    this.newMaterialForProperty = undefined;
    this.ds.invalidate();
  }

  activatePropertyEditor(p: CatalogProperty | number | undefined, addMaterial?: CatalogMaterial) {
    if (p === null) {
      this.editedProperty = undefined;
      return;
    }
    if (p === undefined) {
      p = {
        name: "",
        description: "",
        id: null,
        catalogId: this.fileItem.catalogId,
        data: null
      };
    }
    if (typeof p === 'number') {
      this.catalogs.getProperty(this.fileItem.catalogId, p)
        .subscribe(prop => this.activatePropertyEditor(prop, addMaterial))
      return;
    }
    this.catalogs.findModelMaterials(this.fileItem.catalogId, this.fileItem.id)
      .subscribe(list => this.modelMaterials = list);
    this.editedProperty = p;
    let items = this.ds.hasSelection ? this.ds.selectedItems : [this.ds.root];
    this.parametricList = ModelHandler.gatherParams(items);
    this.ds.invalidate();
    this.newMaterialForProperty = addMaterial;
  }

  addMaterialProperty(m: CatalogMaterial, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.catalogPropertyEditor) {
      this.catalogPropertyEditor.addMaterialParameter(m);
    } else {
      this.activatePropertyEditor(undefined, m);
    }
  }

  @ViewChild(ModelerPropertiesComponent, { static: false }) propertyEditor: ModelerPropertiesComponent;

  addOrSaveProperty(p: CatalogProperty) {
    if (p === null) {
      this.editedProperty = null;
    } else {
      this.propertyEditor.addOrSaveProperty(p);
    }
  }

  viewAll() {
    this.ds.animateCamera();
    this.ds.zoomToFit();
  }

  shadeMode(mode: string) {
    this.ds.render.mode = RenderMode[mode];
  }

  orthoCamera() {
    this.handler.orthoCamera();
  }

  orbitCamera() {
    this.handler.orbitCamera(true);
  }

  walkCamera() {
    this.handler.walkCamera();
  }

  showFileProperties() {
    let data: FilePropertiesDisplay = { files: [this.fileItem]};
    this.dialog.open(FilePropertiesComponent, { data }).afterClosed().subscribe(ok => {
      if (ok) {
        this._updateFileItem();
      }
    });
  }

  replaceModel(file: File) {
    this.fileUpload.clear();
    let dialogRef = this.tdFileService.openUploadWindow(this.fileItem.id, [file], true);
    dialogRef.componentInstance.complete.subscribe(_ => {
      this._updateFileItem();
      this.ds.syncModel().then(_ => {
        this.modelChanged();
        this.viewAll();
      });
      setTimeout(() => dialogRef.close(), 3000);
    });
  }

  closeMaterialEditor() {
    this.selectedMaterial = undefined;
    this.selectedMaterialState = 'off';
  }

  backToCatalog() {
    this.catalogs.getCatalog(this.fileItem.catalogId).subscribe(c => {
      if (c.modelFolderId === this.fileItem.parentId) {
        this._router.navigate(['/catalog', this.fileItem.catalogId]);
      } else {
        this._router.navigate(['/catalog', this.fileItem.catalogId, 'folder', this.fileItem.parentId]);
      }
    })
  }

  @HostListener('document:keydown', ['$event'])
  hotkeys(event: KeyboardEvent) {
    let input = event.target && event.target['tagName'] === 'INPUT';
    if (input) {
      return;
    }
    if (event.keyCode === 81) {
      if (this.ds.render.mode === RenderMode.HiddenEdgesVisible) {
        this.ds.render.mode = RenderMode.ShadedWithEdges;
      } else {
        this.ds.render.mode = RenderMode.HiddenEdgesVisible;
      }
    } else if (event.keyCode === 87) {
      if (this.ds.camera.mode === NavigationMode.Ortho) {
        this.orbitCamera();
      } else {
        this.orthoCamera();
      }
    } else if (event.keyCode === 65) {
      this.viewAll();
    } else if (event.keyCode === 46) {
      this.ds.removeSelection();
    } else if (event.keyCode === 27) {
      if (this.ds.action) {
        this.ds.action.escape();
      }
    }
  }

  undoRunCount = 0;
  redoRunCount = 0;

  undo() {
    this.undoRunCount++;
    this.ds.undo();
  }

  redo() {
    this.redoRunCount++;
    this.ds.redo();
  }

  displayModelStatistics() {
    this.dialog.open(ModelHistoryComponent, { data: this.handler });
  }

  animate() {
    if (!this.handler.animateAll()) {
      this.snackBar.open('No animations in model', undefined, {duration: 3000});
    }
  }

  rebuild() {
    let elem = this.ds.selected || this.ds.root;
    this.ds.apply("Rebuild", { uid: elem, builder: "update"});
  }

  @ViewChild('compressResultTemplate', { static: true }) compressResultTemplate?: TemplateRef<any>;
  compressResult: any;

  compress() {
    this.ds.execute({ type: 'compress', name: 'Draco-compress' })
      .then(data => {
        this.compressResult = data;
        this.snackBar.openFromTemplate(this.compressResultTemplate)
      });
  }

  get catalogs$() {
    if (!this._catalogs$) {
      this._catalogs$ = this.catalogs.getCatalogs().pipe(share());
    }
    return this._catalogs$;
  }

  get nestedCatalogs$() {
    if (!this._nestedCatalogs$) {
      this._nestedCatalogs$ = this.catalogs
        .getCatalog(this.fileItem.catalogId).pipe(
          concatMap(c => this.catalogs.getNestedCatalogs(c.parentCatalogId || c.id)),
          share()
        );
    }
    return this._nestedCatalogs$;
  }

  modelIdValue() {
    return parseInt(this.modelId || '0', 10);
  }

  fileChanged(file: FileItem) {
    this.fileItem = {...file};
  }

  selectPriceElement(elem: PriceElement) {
    this.ds.selection.clear();
    if (elem.entities[0] !== this.ds.root) {
      elem.entities.forEach(e => e.selected = true);
    }
  }

  rotateModel() {
    this.dialog
      .open(RotateDialogComponent)
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(data => {
        if (data.angle) {
          let axis = vec3.fromAxis(data.axis);
          if (this.ds.root.children.length > 0) {
            this.ds.selection.clear();
            this.ds.root.children.forEach(c => c.selected = true);
            this.ds.rotateSelection(data.angle, axis);
            this.ds.selection.clear();
          } else {
            let transform = mat4.fromRotation(mat4.create(), data.angle * Math.PI / 180, axis);
            this.ds.apply('Rotate', { uid: '[root]', mesh: { transform }});
          }
        }
      });
  }
}
