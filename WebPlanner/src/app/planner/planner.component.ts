import {
  Component,
  OnDestroy,
  Optional,
  HostListener,
  NgZone,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  ElementRef,
  ViewContainerRef,
  TemplateRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { Observable, combineLatest, Subscription } from 'rxjs';
import {
  AuthService,
  FilesService,
  FileItem,
  CatalogService,
  CatalogMaterial,
  createMaterial,
  OrderService,
  Catalog,
  dataURItoFile,
  FileOrderItem
} from '../shared';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebDesigner } from 'modeler/webdesigner';
import { DesignerErrorType, DesignerError } from 'modeler/builder-designer';
import { Entity, EntityRay, NavigationMode, BuilderApplyItem, Mesh } from 'modeler/designer';
import { EditorTool } from 'modeler/editor-tool';
import { MeasureTool } from 'modeler/measure-tool';
import { FloorProjectStatistics } from 'modeler/floorplanner';
import { RenderMode, materialPointer } from 'modeler/render/renderer';
import { glMatrix, vec3, mat4 } from 'modeler/geometry';
import { ProjectDetailsComponent, ProjectDetails } from './project-details/project-details.component';
import { EstimateService, PriceListInfo, PriceList } from './estimate';
import { EmbedService } from 'embed/embed.service';
import {
  MaterialSelectorComponent,
  MaterialViewMode
} from './material-selector/material-selector.component';
import { ProjectLinkComponent, ProjectLinkComponentData } from './project-link/project-link.component';
import { ProjectHandler, Bookmark, ProjectSelectionStatus } from 'modeler/project-handler';
import { WindowService } from '../shared/window.service';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';
import { DragDropTool } from 'modeler/move-tool';
import { getEventFullKey } from '../shared/keyboard';
import { CameraAction, MouseInfo } from 'modeler/actions';
import { MoveDialogComponent } from './move-dialog/move-dialog.component';
import { RotateDialogComponent } from './rotate-dialog/rotate-dialog.component';
import { ModelHistoryComponent } from './model-history/model-history.component';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { PrintDialogComponent, PrintData } from './print-dialog/print-dialog.component';
import { ImageMaker, ImageMakerParams } from './image-maker';
import { PlannerSettings, OrderSettings } from '../shared/auth.service';
import { RoofTool } from 'modeler/roof-tool';
import { CoverToolComponent } from './cover-tool/cover-tool.component';
import { ModelExplorerComponent } from './model-explorer/model-explorer.component';
import { CopyDialogComponent } from './copy-dialog/copy-dialog.component';
import { takeUntil, filter, concatMap, take, map, tap, catchError, debounceTime, delay } from 'rxjs/operators';
import { of, merge } from 'rxjs';
import { ProjectPhotoComponent, PhotoDataData } from './project-photo/project-photo.component';
import { SystemService } from 'app/shared/system.service';
import { AboutComponent } from './about/about.component';
import { DatePipe } from '@angular/common';
import { loadModelInsertInfo } from 'modeler/syncer';
import { ReplaceDialogComponent } from './replace-dialog/replace-dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { OrderEditorComponent } from './orders/order-editor/order-editor.component';
import { SpecificationDetails, SpecificationComponent } from './specification/specification.component';
import { NewOrderComponent } from './orders/new-order/new-order.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { TdFileService } from 'app/shared/file/services/file.service';
import { PlannerUI, HttpWrapper } from './planner.ui';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PrjojectEditorInterface } from './editor.script';

export class PlannerScriptInterface {
  constructor(private _planner: ProjectEditorComponent) {}

  get root() {
    return this._planner.ds.root;
  }

  get selected() {
    return this._planner.ds.selected;
  }

  get selectedItems() {
    return this._planner.ds.selectedItems;
  }

  findAll(filter: (e: Entity) => boolean) {
    let result = [];
    this.root.forAll(e => {
      if (filter(e)) {
        result.push(e);
      }
    });
    return result;
  }

  get embedded() {
    return this._planner.embedded;
  }

  get user() {
    let auth = this._planner.auth;
    return auth.isAuthenticated.value ? {
      id: auth.userId,
      name: auth.userName,
      roles: auth.roles,
      address: auth.address,
      phone: auth.phone,
      fullName: auth.fullName,
    } : undefined;
  }

  get project() {
    let file = this._planner.fileItem;
    let preview = file.preview &&
      `${this._planner.auth.host}/previews/${file.preview.substr(0, 2)}/${file.preview}`;
    return {
      id: file.id,
      name: file.name,
      url: this._planner.getViewLink(),
      preview
    }
  }

  get estimate() {
    return this._planner.estimate;
  }

  get ui() {
    return this._planner.ui;
  }

  private _editor: PrjojectEditorInterface

  get editor() {
    if (!this._editor) {
      this._editor = new PrjojectEditorInterface(this._planner.ds, this._planner.files);
    }
    return this._editor;
  }

  // TODO: used in xml, try to compute it
  order?: any;

  get date() {
    return this._planner.datePipe.transform(new Date(), 'dd.MM.yyyy');
  }

  onLoad?: () => void;
  onSelect?: (status: ProjectSelectionStatus) => void;

  _initialized() {
    this._planner.cd.markForCheck();
  }
}

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  providers: [EstimateService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('propertyPanelAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('200ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)' }))
      ]),
      transition('* => *', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0%)' }))
      ])
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
    ]),
    trigger('pulseAnimation', [
      transition(':enter', [
        animate('500ms ease', keyframes([
          style({ transform: 'scale3d(0.01, 0.01, 0.01)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.75 }),
          style({ transform: 'scale3d(1, 1, 1)', offset: 1.0 }),
        ]) )
      ]),
      transition(':leave', [
        animate('500ms ease', keyframes([
          style({ transform: 'scale3d(1, 1, 1)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.75 }),
          style({ transform: 'scale3d(0.01, 0.01, 0.01)', offset: 1.0 }),
        ]) )
      ])
    ]),
  ]
})
export class ProjectEditorComponent implements OnInit, OnDestroy {
  ds: WebDesigner;
  modelId: string;
  rootId: string;
  loaded = false;
  loadingIndicator$: Observable<boolean>;
  canvasImageData: string;
  fileItem?: FileOrderItem;
  readOnlyMode = true;
  backupId?: string;
  editable = false;
  fileToken?: string;
  cameraParam?: string;
  activePriceId = 0;
  embedded = false;
  project: ProjectHandler;
  bookmarks$: Observable<Bookmark[]>;
  recentFolders: FileItem[] = [];
  settings = new PlannerSettings();
  orderSettings = new OrderSettings();
  status?: ProjectSelectionStatus;
  ui = new PlannerUI(this.dialog, this.matIconRegistry, this.sanitizer);

  handset = false;
  error?: DesignerError;
  DesignerErrorType = DesignerErrorType;
  showProperties = false
  paintMode = false;
  checkModels = true;
  estimateSub: Subscription;

  private destroy = new EventEmitter<void>();
  private scriptInterface = new PlannerScriptInterface(this);

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    public files: FilesService,
    public dialog: DialogService,
    private firm: OrderService,
    private catalogs: CatalogService,
    public snackBar: MatSnackBar,
    private system: SystemService,
    private window: WindowService,
    public estimate: EstimateService,
    public datePipe: DatePipe,
    public cd: ChangeDetectorRef,
    private vcr: ViewContainerRef,
    private breakpointObserver: BreakpointObserver,
    private tdFileService: TdFileService,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    @Optional() private embed: EmbedService
  ) {
    this.embedded = !!embed;
    this.auth.isAuthenticated
      .pipe(takeUntil(this.destroy))
      .subscribe(state => this.authChanged(state));
    if (embed) {
      embed.setInitParams(route.snapshot.queryParams);
    }
    this.auth
      .getAppSetting<PlannerSettings>('PlannerSettings')
      .pipe(takeUntil(this.destroy))
      .subscribe(value => this.applySettings(value));

    this.system.getScript('planner').pipe(
      tap(v => this.scriptLoaded(v)),
      takeUntil(this.destroy)
    ).subscribe();
    matIconRegistry.addSvgIconSet(
      sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/planner.svg')
    );
  }

  private scriptLoaded(script: string) {
    if (this.backupId) {
      return;
    }
    let activeThis = this;
    let self = {};
    let result = function(estimate, planner, http) {
      if (estimate && planner && http) {
        try {
          /* tslint:disable-next-line */
          return eval(script);
        } catch (e) {
          let message = e && e.toString();
          activeThis.snackBar.open('Ошибка исполнения скрипта. ' + message);
        }
      }
    }.call(self, this.estimate, this.scriptInterface, new HttpWrapper(this.http));
    if (result) {
      this.scriptInterface._initialized();
    }
  }

  private authChanged(value: boolean) {
    this.estimate.priceUrl = this.auth.embedded.priceUrl;
    if (this.embed) {
      this.estimate.priceUrlParams = this.embed.initParams;
    }
    if (value) {
      combineLatest(this.firm.getActivePrice(), this.firm.getPrices(-1))
        .pipe(takeUntil(this.destroy))
        .subscribe(([active, allPrices]) => {
          this.applyPriceList(active);
          // add active price list because active can be non-shared system price
          if (active && !allPrices.find(p => p.id === active.id)) {
            let activeInfo = {...active, data: undefined};
            allPrices.splice(0, 0, activeInfo);
          }
          this.prices = allPrices;
        });
    } else {
      let seller = this.route.snapshot.queryParams['seller'];
      if (seller) {
        this.firm.getActivePrice(true, seller).subscribe(price => {
          this.applyPriceList(price);
        });
      }
    }
  }

  private applySettings(value: PlannerSettings) {
    this.settings = value;
    this.estimate.showPrices = value.showPrices;
    if (this.ds) {
      this.ds.sounds = value.sounds;
      this.ds.options.navigator = value.navigatorCube;
    }
    this.cd.markForCheck();
  }

  private createDesigner(canvas3d: HTMLCanvasElement) {
    let ds = new WebDesigner(canvas3d, this.zone, this.auth, this.catalogs, this.snackBar, this.breakpointObserver);
    ds.serverError.pipe(takeUntil(this.destroy)).subscribe(error => {
      if (error.type === DesignerErrorType.InvalidAction) {
        this.snackBar.open(error.info || 'Invalid action');
        return;
      }
      this.error = error;
      this.cd.markForCheck();
      if (error.type === DesignerErrorType.Forbid && this.embedded) {
        this.embed.setLastProjectId(undefined);
        this.snackBar.open('Файл проекта недоступен.');
        this.newProject();
      }
    });
    ds.mouseEvent.pipe(takeUntil(this.destroy)).subscribe(move => {
      if (!move) {
        this.cd.markForCheck();
      }
    })
    this.project = new ProjectHandler(ds);
    this.bookmarks$ = this.project.bookmarks$();
    this.project.orbitCamera(true);
    this.loadingIndicator$ = ds.processing.pipe(debounceTime(250));
    ds.defaultAction = () => new EditorTool(ds);
    ds.modelChange.pipe(
      debounceTime(1000),
      takeUntil(this.destroy)
    ).subscribe(_ => {
        this.floors = this.project.floors;
        if (this.editable) {
          this.makeThumbnail();
        }
      });
    merge(ds.modelChange, ds.render.texturesLoaded)
      .pipe(debounceTime(1000)).subscribe(_ => this.computeEstimate())

    merge(
        ds.selection.change.pipe(map(_ => true)),
        ds.processing.pipe(map(v => !v)),
        ds.modelChange.pipe(map(_ => true))
    ).pipe(
      tap(_ => {
        this.status = undefined;
        this.cd.markForCheck();
      }),
      filter(v => v),
      debounceTime(100)
    ).subscribe(_ => {
      if (this.editable && ds.hasSelection) {
        this.status = this.project.status();
        if (this.scriptInterface.onSelect) {
          this.scriptInterface.onSelect(this.status);
        }
        this.cd.markForCheck();
      }
    });
    ds.render.dynamicVisibility = true;
    ds.sounds = this.settings.sounds;
    return ds;
  }

  @ViewChild('canvas3d', { static: true }) canvas3d: ElementRef;

  ngOnInit() {
    try {
      this.ds = this.createDesigner(this.canvas3d.nativeElement);
      let routeParams = combineLatest(this.route.params, this.route.queryParams, this.auth.isAuthenticated)
        .pipe(map(result => ({p: result[0], q: result[1], auth: result[2]})));
      if (this.embed) {
        routeParams.pipe(
          filter(v => v.auth),
          takeUntil(this.destroy)
        ).subscribe(par => {
            let projectLink = par.q['project'];
            if (projectLink) {
              this.cameraParam = par.q['camera'];
              let link = this.embed.decodeLink(decodeURIComponent(projectLink));
              if (link && link.id) {
                this.fileToken = link.token;
                this.loadProject(link.id);
                return;
              }
            }
            let projectId = this.embed.getLastProjectId();
            if (projectId) {
              this.embed.goToProject(projectId);
            } else {
              this.embed.setLastProjectId();
              this.snackBar.open('Проект недоступен для редактирования');
              this.router.navigate(['']);
            }
          });

      } else {
        routeParams.pipe(takeUntil(this.destroy)).subscribe(par => {
          this.cameraParam = par.q['camera'];
          this.fileToken = par.q['token'];
          let id = par.p['id'];
          let backup = par.q['backup'];
          if (id) {
            this.loadProject(id, par.q['root'], backup);
          }
        });
      }
      (this.canvas3d.nativeElement as HTMLCanvasElement).focus();
    } catch (error) {
      this.error = {
        type: DesignerErrorType.WebGL,
        info: error && error.message
      }
    }
    this.auth.getAppSetting<OrderSettings>('OrderSettings').subscribe(s => this.orderSettings = s);
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.handset = result.matches;
    });
  }

  floors: Entity[] = [];
  prices?: PriceListInfo[];

  private loadProject(id: string | number, rootId?: string, backupId?: string) {
    if (!this.ds) {
      // don't load project while component is being destroyed
      return;
    }
    this.error = undefined;
    this.loaded = false;
    this.readOnlyMode = true;
    this.prices = undefined;
    this.modelId = (id ||  '').toString();
    this.rootId = rootId;
    this.backupId = backupId;
    this.ds.disconnect();
    this.ds.loadModel(this.backupId || this.modelId, this.rootId, this.fileToken)
      .then(_ => this.projectLoaded());
    if (this.cameraParam) {
      this.ds.loadCamera(decodeURIComponent(this.cameraParam), true, false);
    }
    this.firm.getFileOrder(+id, this.fileToken)
      .pipe(takeUntil(this.destroy))
      .subscribe(
        file => {
          this.fileItem = file;
          this.readOnlyMode = !!file.readOnly || !!backupId;
          if (!file.catalogId && this.auth.isAdmin.value) {
            // allow edit templates by admins
            this.readOnlyMode = false;
          }
          this.setEditable(!this.readOnlyMode);
        },
        error => {
          let forbidden = (error instanceof HttpErrorResponse) && error.status === 403;
          this.error = {
            type: forbidden ? DesignerErrorType.Forbid : DesignerErrorType.Network,
            info: error instanceof HttpErrorResponse ? `${error.message}` : `${error}`
          };
          this.cd.markForCheck();
        }
      );
  }

  newProject() {
    if (this.embedded) {
      this.router.navigate(['']);
    } else {
      if (this.orderSettings && this.orderSettings.enabled) {
        this.dialog.open(NewOrderComponent);
      } else {
        this.dialog.open(NewProjectComponent, { data: false })
          .componentInstance.afterCreate.subscribe(f => this.router.navigate(['/project', f.id]));
      }
    }
  }

  private projectLoaded() {
    this.loaded = true;
    this.floors = this.project.floors;
    this.computeEstimate();

    if (!this.ds.undoName && !this.ds.redoName) {
      let room = this.ds.root.findChild(e => !!e.data.room, true);
      if (room) {
        room.selected = true;
      }
    }

    if (this.editable && this.fileItem && !this.fileItem.preview) {
      this.makeThumbnail();
    }
    if (this.embed) {
      this.embed.setLastProjectId(this.modelId);
    }
    if (this.scriptInterface.onLoad) {
      this.scriptInterface.onLoad();
    }
  }

  get isProjectArchived() {
    return this.fileItem && this.fileItem.readOnly === 'archived';
  }

  restoreFromArchive() {
    // TODO: display restore progres and success
    this.files.restoreFromArchive(this.fileItem.id).subscribe(
      _ => this.loadProject(this.fileItem.id)
    );
  }

  get selected() {
    return this.ds && this.ds.selected;
  }

  selectEntity(e: Entity) {
    this.ds.selected = e;
  }

  get hasSelection() {
    return this.ds.hasSelection;
  }

  get commands() {
    return this.ds.activeAction.commands;
  }

  selectMaterial(material?: CatalogMaterial) {
    let dialogRef = this.dialog.open(MaterialSelectorComponent, {
      width: '50%',
      height: '60%',
      data: material
    });
    let selector = dialogRef.componentInstance;
    selector.viewMode = MaterialViewMode.Grid;
    selector.displayCatalogs = true;
    selector.select.subscribe(_ => dialogRef.close());
    return selector.select;
  }

  ngOnDestroy() {
    this.destroy.emit();
    this.destroy.complete();
    this.ds.destroy();
    this.project = undefined;
    this.ds = undefined;
  }

  viewAll() {
    this.ds.animateCamera();
    this.ds.zoomToFit(true, false);
  }

  rotateCamera(axis, global = false) {
    let ds = this.ds;
    let rotAxis = global ? axis : ds.camera.NtoGlobal(axis);

    let camera = ds.camera;
    let center = camera.lastRotationCenter;

    if (!center) {
      center = ds.box.center;
      let ray = new EntityRay();

      // find center point on the screen to rotate about
      ray.pos = camera.translation;
      ray.dir = camera.NtoGlobal(vec3.axis_z);
      let zLimits = { near: 0, far: 1000 };
      camera.calcZPlanes(zLimits);

      // we rotate around certain point only if model is close enough to us
      if (camera.perspective && zLimits.near * 2 < ds.box.diagonal) {
        ds.root.intersect(ray);
        if (ray.intersected) {
          center = ray.intersectPos;
        }
      }
      camera.lastRotationCenter = center;
    }

    ds.animateCamera();
    ds.camera.rotate(center, rotAxis, Math.PI / 4);
  }

  cameraRotUp() {
    this.rotateCamera([1, 0, 0]);
  }

  cameraRotDown() {
    this.rotateCamera([-1, 0, 0]);
  }

  cameraRotLeft() {
    this.rotateCamera([0, 1, 0], true);
  }

  cameraRotRight() {
    this.rotateCamera([0, -1, 0], true);
  }

  addWalls(floor?: Entity) {
    if (floor) {
      this.ds.selected = floor;
    }
    if (this.project.findFloorPlan() && this.ds.action instanceof EditorTool) {
      this.ds.action.addFloorWalls();
    }
  }

  splitWall() {
    if (this.ds.action instanceof EditorTool) {
      this.ds.action.splitWall();
    }
  }

  hiddenEntities = false;

  hideSelection() {
    let selection = this.ds.selection.items;
    selection.forEach(e => e.visible = false);
    this.ds.selection.clear();
    this.hiddenEntities = true;
  }

  restoreVisibility() {
    this.hiddenEntities = false;
    this.ds.root.forEach(e => e.visible = true);
  }

  toggleVisibility(item: Entity) {
    item.visible = !item.visible;
    item.selected = false;
  }

  get actionHint() {
    if (this.ds.action) {
      return this.ds.activeAction.hint;
    }
  }

  get isDefaultAction() {
    return this.ds && this.ds.activeAction instanceof EditorTool;
  }

  cancelAction() {
    this.ds.activeAction.cancel();
  }

  get actionCursor() {
    return this.ds && this.ds.activeAction.cursor;
  }

  computeEstimate() {
    if (this.ds && this.ds.root) {
      if (this.estimateSub) {
        this.estimateSub.unsubscribe();
      }
      this.estimateSub = this.estimate.compute(this.ds.root, this.ds.render.materials)
        .pipe(takeUntil(this.destroy))
        .subscribe(_ => {
          this.cd.markForCheck();
          this.checkProjectModels();
        });
    }
  }

  private checkProjectModels() {
    if (this.ds.processing.value || !this.editable) return;
    if (!this.checkModels || this!.settings.updateChangedModels) return;
    this.checkModels = false;
    if (this.estimate.missingModels.length > 0) {
      let modelNames = new Set(this.estimate.missingModels.map(m => m.name));
      this.files.findModelsByName(Array.from(modelNames)).pipe(
        filter(files => files.length > 0),
        concatMap(files => {
          return this.snackBar
            .open('Используемые модели были перемещены в каталогах. Обновить ссылки?', 'ОБНОВИТЬ', {duration: 7000})
            .onAction().pipe(map(_ => files));
        }),
        concatMap(files => {
          let changes: BuilderApplyItem[] = [];
          for (let model of this.estimate.missingModels) {
            let file = files.find(f => f.name === model.name);
            if (file) {
              changes.push({
                uid: model,
                data: {
                  model: {
                    id: file.id.toString(),
                    sku: file.sku
                  }
                }
              });
            }
          }
          return of(this.ds.applyBatch('Обновление ссылок на модели', changes)).pipe(map(_ => changes.length));
        })
      ).subscribe(_ => this.snackBar.open('Ссылки на модели успешно обновлены!'));
    } else if (this.fileItem) {
      let models = new Set<number>();
       this.ds.root.forAll(e => {
        if (e.data.model && e.data.model.id) {
          models.add(Number(e.data.model.id));
        }
       });
      this.files.getFiles(Array.from(models), false).pipe(
        map(files => files.filter(f => f.modifiedAt > this.fileItem.modifiedAt)),
        filter(files => files.length > 0),
        concatMap(files => {
          return this.dialog.openConfirm({
            message: files.length + ' моделей обновлено в каталогах. Обновить их в проекте?'
          }).afterClosed().pipe(map(v => v ? files : undefined));
        }),
        filter(v => !!v),
        concatMap(files => {
          let changes: BuilderApplyItem[] = [];
          this.ds.root.forAll(e => {
            if (e.data.model) {
              let file = files.find(f => f.id === Number(e.data.model.id));
              if (file) {
                changes.push({
                  uid: e,
                  replace: {
                    insertModelId: file.id.toString(),
                    modelName: file.name,
                    sku: file.sku
                  }
                });
              }
            }
          });
          // we need to replace items inside containers first
          changes.reverse();
          let result = this.ds.applyBatch('Обновление моделей в проекте', changes,
            undefined, undefined, files.map(f => f.id.toString()));
          return of(result).pipe(map(_ => changes.length));
        })
      ).subscribe(count => this.snackBar.open(count + ' моделей успешно обновлено в проекте!'));
    }
  }

  makeThumbnail(manual = false) {
    if (!this.editable && !this.auth.admin) {
      return;
    }
    if (this.rootId && !manual) {
      return;
    }
    let camera: Float64Array;
    if (!manual) {
      camera = mat4.transformation(
        mat4.create(),
        vec3.origin,
        vec3.axisz,
        vec3.axisy
      );
      mat4.rotateY(camera, camera, glMatrix.toRadian(20));
      mat4.rotateX(camera, camera, glMatrix.toRadian(-40));
    }
    this.ds.render.texturesLoaded.pipe(
      filter(v => v),
      concatMap(_ => this.ds.render.takePicture({
        size: manual ? 512 : 256,
        mode: RenderMode.Shaded,
        camera,
        perspective: true,
        drawings: false,
        fit: true,
        effects: false,
        invalidate: true
      })),
      concatMap(thumb => {
        if (manual) {
          let blob = dataURItoFile(thumb);
          return this.files.updateCustomThumbnail(this.modelId, blob, undefined, this.fileToken);
        }
        return this.files.updateThumbnail(this.modelId, thumb, this.fileToken);
      }),
      take(1),
      takeUntil(this.destroy)
    ).subscribe(_ => {
      if (manual) {
        this.snackBar.open('Thumbnail updated');
      }
    });
  }

  modelDrag(file: FileItem) {
    if (!this.ds.render.gl) {
      return;
    }
    let tool = new DragDropTool(this.ds, file.id.toString(),
      file.name, file.sku, file.insertInfo);
    tool.openDoors = this.settings.doorAnimation;
    this.ds.action = tool;
  }

  materialDrag(m: CatalogMaterial) {

  }

  moveSelection() {
    this.dialog
      .open(MoveDialogComponent)
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe((newValue: number[]) => {
        let shift = vec3.fromValues(
          newValue[0] || 0,
          newValue[1] || 0,
          newValue[2] || 0
        );
        if (!vec3.empty(shift)) {
          let dir = this.ds.selectedItems[0].NtoGlobal(shift);
          this.ds.applyToSelection('Move selection', e => {
            let localDir = e.parent.NtoLocal(dir);
            e.translate(localDir);
            return { matrix: e.matrix };
          });
        }
      });
  }

  rotateSelection() {
    this.dialog
      .open(RotateDialogComponent)
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(data => {
        if (data.angle) {
          this.ds.rotateSelection(data.angle, vec3.fromAxis(data.axis));
        }
      });
  }

  removeSelection() {
    if (this.editable) {
      this.project.removeSelection();
    }
  }

  shortcuts = new Map<string, (event) => void>([
    ['q', _ => this.moveSelection()],
    ['w', _ => this.rotateSelection()],
    ['r', _ => this.switchRenderMode()],
    ['n', _ => this.switchNavigationMode()],
    ['z', _ => this.viewAll()],
    ['delete', _ => this.removeSelection()],
    [
      'escape',
      _ => {
        if (this.ds.action) {
          this.ds.action.escape();
        }
      }
    ],
    ['control.a', _ => this.project.selectAll()],
    ['control.z', _ => this.ds.undo()],
    ['control.y', _ => this.ds.redo()],
    ['control.shift.u', _ => this.displaySpector()],
    ['arrowup', _ => this.moveCameraForward(50)],
    ['arrowdown', _ => this.moveCameraForward(-50)],
    ['arrowleft', _ => this.rotateCameraAround(1)],
    ['arrowright', _ => this.rotateCameraAround(-1)],
    ['shift.arrowup', _ => this.moveCameraForward(300)],
    ['shift.arrowdown', _ => this.moveCameraForward(-300)]
  ]);

  @HostListener('keydown', ['$event'])
  hotkeys(event: KeyboardEvent) {
    let input = event.target && event.target['tagName'] === 'INPUT';
    if (input || event.defaultPrevented) {
      return;
    }
    let shortcut = getEventFullKey(event);
    let action = this.shortcuts.get(shortcut);
    if (action) {
      action(event);
      event.preventDefault();
      return false;
    }
  }

  private moveCameraForward(delta: number) {
    if (this.ds.action instanceof CameraAction) {
      this.ds.action.moveCameraForward(undefined, delta);
    }
  }

  private rotateCameraAround(speed: number) {
    if (this.ds.camera.mode !== NavigationMode.Ortho) {
      this.ds.animateCamera();
      let yAxis = vec3.fromValues(0.0, 1.0, 0.0);
      this.ds.camera.globalRotate(
        this.ds.camera.translation,
        yAxis,
        glMatrix.toRadian(speed)
      );
    }
  }

  private switchRenderMode() {
    if (this.ds.render.mode === RenderMode.HiddenEdgesVisible) {
      this.ds.render.mode = RenderMode.ShadedWithEdges;
    } else {
      this.ds.render.mode = RenderMode.HiddenEdgesVisible;
    }
  }

  private switchNavigationMode() {
    if (this.ds.camera.mode === NavigationMode.Ortho) {
      this.project.orbitCamera();
    } else {
      this.project.orthoCamera();
    }
  }

  measureDistance() {
    this.ds.action = new MeasureTool(this.ds, this.createImageMaker());
  }

  takePhoto() {
    let data = of(0).pipe().pipe(
      delay(250),
      concatMap(_ => this.ds.render.takePicture({
        width: this.ds.canvas.width,
        height: this.ds.canvas.height,
        taa: true,
        fit: false,
        background: true
      })),
      map(image => ({ image, name: this.fileItem.name } as PhotoDataData))
    );
    this.dialog.open(ProjectPhotoComponent, { data });
  }

  public getViewLink(token?: string) {
    let origin = window.location.origin;
    if (this.embed && this.embed.linkOrigin) {
      origin = this.embed.linkOrigin;
    }
    let link = `${origin}/project/${this.modelId}`;
    let separator = '?';
    let addParam = (key, value) => {
      link += separator + key + '=' + encodeURIComponent(value);
      separator = '&';
    }
    if (this.embed) {
      link = `${origin}/editor`;
      let project = this.embed.encodeLink({id: Number(this.modelId), token});
      addParam('project', project);
    } else if (token) {
      addParam('token', token);
    }
    if (this.auth.hasRole('seller')) {
      addParam('seller', this.auth.userId);
    }
    addParam('camera', this.ds.saveCamera());
    return link;
  }

  generateViewLink() {
    this.files.generateFileTokens(this.modelId, this.fileToken).subscribe(tokens => {
      let data: ProjectLinkComponentData = {
        id: this.fileItem.id,
        name: this.fileItem.name,
        url: this.getViewLink(this.fileItem.shared ? undefined : tokens.read),
        editableUrl: undefined as string,
        scriptInterface: this.scriptInterface,
        email: (this.fileItem.client && this.fileItem.client.email) || ''
      };
      if (tokens.write) {
        data.editableUrl = this.getViewLink(tokens.write);
      }
      this.dialog.open(ProjectLinkComponent, { data, width: '75%'});
    });
  }

  saveDefaultCamera() {
    this.ds.execute({
      type: 'set-key',
      key: 'camera',
      value: this.ds.saveCamera()
    }).then(_ => this.snackBar.open('Положение камеры успешно сохранено'));
  }

  displayModelStatistics() {
    this.dialog.open(ModelHistoryComponent, { data: this.project });
  }

  createImageMaker() {
    let hiddenArray: Entity[] = [];
    this.ds.root.forAll(e => {
      if (e.visible && e.data.model && !this.estimate.contains(e)) {
        let wallElem = e.parent && e.parent.data.wall;
        if (!wallElem) {
          hiddenArray.push(e);
        }
      }
    });
    return new ImageMaker(this.ds, hiddenArray);
  }

  print() {
    let imageMaker = this.createImageMaker();
    let user = {
      id: this.auth.userId,
      name: this.auth.fullName,
      address: this.auth.address,
      phone: this.auth.phone,
      email: this.auth.email
    };
    this.firm.getOrder(this.fileItem.id, this.fileToken).subscribe(order => {
      let data: PrintData = {
        readOnly: this.readOnlyMode,
        embedded: !!this.embedded,
        user,
        client: order && order.client,
        order,
        specification: this.estimate.gatherElements(true),
        totalPrice: Math.round(this.estimate.price),

        currentDate: (format = 'dd.MM.yyyy') => this.datePipe.transform(new Date(), format),
        renderImage: (params?: ImageMakerParams) =>
          imageMaker.renderImage(params),

        planner: this.scriptInterface,
        http: new HttpWrapper(this.http),
        estimate: this.estimate
      }
      let config = { data, minWidth: '30%', minHeight: '40%' };
      this.dialog.open(PrintDialogComponent, config);
    });
  }

  editClient() {
    this.firm.getOrder(this.fileItem.id).pipe(
      concatMap(order => {
        order = order || { id: this.fileItem.id, status: '' };
        let config = { minWidth: '50%', data: order };
        return this.dialog.open(OrderEditorComponent, config).afterClosed();
      }),
      filter(v => v),
      concatMap(order => this.firm.setOrder(order.id, order)),
    ).subscribe(order => {
      this.fileItem.client = order.client;
      this.fileItem.status = order.status;
      this.cd.markForCheck();
    });
  }

  cloneProject() {
    let nameTest = new RegExp('(.*) - копия(\\((\\d*)\\)|)');
    let matches = nameTest.exec(this.fileItem.name);
    let copyCounter = '';
    let name = this.fileItem.name;
    if (matches && matches.length === 4) {
      let index = 2;
      if (!Number.isNaN(Number.parseInt(matches[3], 10))) {
        index = Number.parseInt(matches[3], 10) + 1;
      }
      copyCounter = `(${index})`;
      name = matches[1];
    }

    this.dialog
      .openPrompt({
        message: `Создать копию проекта`,
        value: `${name} - копия${copyCounter}`
      })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(copyName => this.files.createProject(copyName, {
          flushModelId: this.fileItem.id.toString(),
          type: 'load',
          file: this.fileItem.id
        })),
        concatMap(newProject => {
          let order = {
            id: newProject.id,
            status: this.fileItem.status,
            client: this.fileItem.client
          }
          if (order.client) {
            return this.firm.setOrder(newProject.id, order);
          }
          return of(order);
        }),
        map(order => order.id),
      ).subscribe(
        id => {
          if (!this.embed) {
            this.router.navigate(['/project', id]);
          } else {
            this.embed.goToProject(id);
          }
        },
        e => alert(e)
      );
  }

  specification() {
    let data: SpecificationDetails = {
      file: { ...this.fileItem },
      estimate: this.estimate,
      order: this.firm.getOrder(this.fileItem.id),
      orderUrl: this.auth.embedded.orderUrl,
      orderUrlParams: this.route.snapshot.queryParams,
      scriptInterface: this.scriptInterface
    };
    this.dialog.open(SpecificationComponent, { data });
  }

  projectDetails(tab: number) {
    let data: ProjectDetails = {
      file: { ...this.fileItem },
      revision: this.ds.lastSyncRevision.toString(),
      tab: tab || 0,
      shared: this.fileItem.shared,
      readOnly: !this.editable,
      estimate: this.estimate,
      download: this.settings.allowExport,
      backups: this.files.getProjectBackups(this.fileItem.id),
      order: this.firm.getOrder(this.fileItem.id),
      statistics: new FloorProjectStatistics(this.ds.root),
      print: () => this.print(),
      orderUrl: this.auth.embedded.orderUrl,
      orderUrlParams: this.route.snapshot.queryParams,
      scriptInterface: this.scriptInterface
    };
    this.dialog
      .open(ProjectDetailsComponent, { data })
      .afterClosed()
      .subscribe(action => {
        if (action === 'order') {
          this.setEditable(false);
        } else if (action === 'clone') {
          this.cloneProject();
        } else if (action === 'remove') {
          this.removeProject();
        } else if (action === 'archive') {
          this.archiveProject();
        } if (action === 'backup') {
          this.files.backupProject(this.fileItem.id).subscribe(_ =>
            this.snackBar.open('Резервная копия успешно создана')
          );
        } else {
          if (data.shared === '!') {
            data.shared = undefined;
          }
          if (data.shared !== this.fileItem.shared) {
            this.files.share(this.fileItem, data.shared).subscribe(_ => {
              this.fileItem.shared = data.shared;
            });
          }
          if (data.file.name !== this.fileItem.name) {
            this.files
              .renameFile(this.fileItem, data.file.name)
              .subscribe(_ => {
                this.fileItem.name = data.file.name;
                this.cd.markForCheck();
              });
          }
        }
      });
  }

  removeProject() {
    this.dialog
      .openConfirm({
        message: `Удалить проект ${this.fileItem.name}? Все изменения будут потеряны!`
      })
      .afterClosed()
      .subscribe(accept => {
        if (accept) {
          this.files
            .removeFile(this.fileItem)
            .subscribe(_ => {
              if (this.embed) {
                this.embed.setLastProjectId(undefined);
                this.router.navigate(['']);
              } else if (this.fileItem.catalogId) {
                this.router.navigate(['/projects'])
              } else {
                this.router.navigate(['/admin', 'templates'])
              }
            });
        }
      });
  }

  archiveProject() {
    this.dialog
      .openConfirm({
        message: `Архивировать проект ${this.fileItem.name}?`
      })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.files.archiveProject(this.fileItem.id))
      ).subscribe(_ => this.router.navigate(['/projects']));
  }

  renameProject() {
    this.dialog
      .openPrompt({
        message: `Название проекта`,
        value: this.fileItem.name
      })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(v => this.files.renameFile(this.fileItem, v))
      ).subscribe(file => (this.fileItem.name = file.name));
  }

  usePriceList(event: MatSelectChange) {
    this.loadPriceList(event.value);
  }

  @ViewChild(ModelExplorerComponent, { static: false }) modelExplorer: ModelExplorerComponent;

  private loadPriceList(id: number) {
    if (id > 0) {
      this.firm.getPrice(id).subscribe(priceList => {
        this.applyPriceList(priceList);
      });
    } else {
      this.applyPriceList(undefined);
    }
  }

  private applyPriceList(priceList?: PriceList) {
    if (priceList) {
      this.activePriceId = priceList.id;
      this.estimate.priceList = priceList;
    } else {
      this.activePriceId = 0;
      this.estimate.priceList = undefined;
    }
    this.computeEstimate();
    if (this.modelExplorer) {
      this.modelExplorer.reload();
    }
  }

  private loadScript(src) {
    return new Promise(function(resolve, reject) {
      let s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  private displaySpector() {
    this.loadScript('/external/spector.bundle.js').then(_ => {
      window.setTimeout(_ => {
        console.log('Init SPECTOR');
        let spector = new window['SPECTOR'].Spector();
        spector.displayUI();
        let canvas3d = document.getElementById('canvas3d');
        spector.onCaptureStarted.add(_ => {
          console.log('SPECTOR capture started');
          this.ds.invalidate();
          window.setTimeout(_ => this.ds.invalidate(), 100);
        });
        // spector.onCapture.add(_ => (this.loading = false));
        spector.captureCanvas(canvas3d);
        this.ds.invalidate();
      }, 0);
    });
  }

  get isDragDrop() {
    return this.ds.action instanceof DragDropTool;
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

  addRoof() {
    this.auth.getAppSettingRaw('materials').subscribe(materials => {
      let material = materials.roof || createMaterial('Roof');
      this.ds.action = new RoofTool(this.ds, material);
    })
  }

  setEditable(value: boolean) {
    this.editable = value;
    this.readOnlyMode = !value;
    this.ds.editable = value;
    this.ds.invalidate();
    if (value) {
      this.checkProjectModels();
    }
    this.cd.markForCheck();
  }

  startEditing() {
    this.files.isFileLocked(this.modelId).pipe(
      concatMap(locked => {
        if (locked) {
          return this.dialog.openConfirm({
            message: 'Проект заблокирован для редактирования. Разблокировать?'
          }).afterClosed().pipe(
            concatMap(v => v ? this.files.lock(this.modelId, false) : of(false))
          )
        }
        return of(true)
      }),
      filter(v => !!v)
    ).subscribe(_ => this.setEditable(true));
  }

  linkQueryParams(back = false) {
    return this.project && this.project.linkQueryParams(back);
  }

  downloadFile(format) {
    let root = this.ds.selected && this.ds.selected.uidStr;
    this.tdFileService.openDownloadDialog(this.fileItem, format, root);
  }

  contextMenuPosition = { x: '0px', y: '0px' };

  contextMenu(event: MouseEvent, trigger: MatMenuTrigger) {
    event.preventDefault();
    if (!this.ds.activeAction.moving) {
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      trigger.openMenu();
    }
  }

  canvasDrop(event: DragEvent) {
    let materialData = event.dataTransfer.getData('material');
    if (materialData) {
      let material = JSON.parse(materialData) as CatalogMaterial;
      let mouse = new MouseInfo(event)
      let ray = this.ds.action.createRay(mouse);
      if (this.ds.action.intersect(ray) && ray.entity) {
        let e = ray.entity as Entity;
        let model = e.findParent(p => !!p.data.model);
        let paintEntity = e.findParent(p => (p.data.model && !p.data.model.sku) || p.data.paint);
        if (!model && ray.mesh) {
          // paint meshes outside models (walls, floors, rooms)
          this.ds.apply("Painting", {
            uid: ray.entity,
            paint: {
              material: material.name,
              catalog: material.catalogId,
              faces: [ray.entity.meshes.indexOf(ray.mesh)]
            }
          });
          return;
        } else if (paintEntity && ray.mesh) {
          // apply material map to models without sku or with paint flag
          let props = paintEntity.data.propInfo && paintEntity.data.propInfo.props;
          if (!props) {
            let materials = paintEntity.data.propInfo && paintEntity.data.propInfo.materials;
            let revision = (paintEntity.data.propInfo && paintEntity.data.propInfo.revision) || 0;
            revision++;
            materials = materials || [];
            materials.push({
              old: (ray.mesh as Mesh).material,
              new: materialPointer(material.catalogId, material.name)
            });
            this.ds.apply("Painting", {
              uid: paintEntity,
              data: {
                propInfo: {
                  materials,
                  revision
                }
              }
            });
            return;
          }
        }
      }
      this.snackBar.open('Невозможно покрасить указанный элемент');
    }
  }

  popupPos() {
    let pos = this.ds.selection.pos;
    let sel = this.ds.selected;
    if (pos && sel) {
      let screen = this.ds.toScreen(sel.toGlobal(pos));
      let region = 100;
      let width = this.ds.canvas.width;
      let height = this.ds.canvas.height;
      if (screen && screen.x > -region && screen.y > -region
          && screen.x < width + region && screen.y < height + region ) {
        screen.x = Math.min(screen.x, this.ds.canvas.width - 100);
        screen.x = Math.max(screen.x, 40);
        screen.y = Math.min(screen.y, this.ds.canvas.height - 80);
        screen.y = Math.max(screen.y, 0);
        return {
          left: screen.x + 'px',
          top: screen.y + 'px'
        }
      }
    }
    return { 'visibility': 'hidden' };
  }

  @ViewChild(CoverToolComponent, { static: false }) coverTool: CoverToolComponent;

  enablePaintMode() {
    this.paintMode = true;
    this.offers = undefined;
    this.status = undefined;
    this.cd.markForCheck();
    setTimeout(_ => {
      if (this.coverTool) {
        this.coverTool.edit(this.ds);
      }
    }, 1);
  }

  selectModel(catalogOrFolder?: Catalog | number, activeFileId?: number,
      type?: string): Observable<FileItem> {
    let dialogRef = this.dialog.open(ModelExplorerComponent, {
      viewContainerRef: this.vcr,
      width: "50%",
      height: "60%"
    });
    let selector = dialogRef.componentInstance;
    if (type !== undefined && this.settings.replaceByType) {
      selector.fileFilter = (f: FileItem) => {
        if (f.insertInfo) {
          let info = loadModelInsertInfo(f.insertInfo);
          if (info) {
            return info.type === type;
          }
        }
        return true;
      }
    }
    selector.recentFolders = this.recentFolders;
    if (catalogOrFolder) {
      if (typeof catalogOrFolder === 'number') {
        selector.selectFolder(catalogOrFolder);
      } else {
        selector.selectCatalog(catalogOrFolder);
      }
    }
    if (activeFileId) {
      selector.activateFile(activeFileId);
    }
    return selector.fileSelected.pipe(tap(_ => dialogRef.close()));
  }

  bulkReplace() {
    let dialogRef = this.dialog.open(ReplaceDialogComponent, {
      viewContainerRef: this.vcr,
      width: "50%",
      height: "60%",
      data: this.project
    });
    let selector = dialogRef.componentInstance;
    selector.selectModel = this.selectModel.bind(this);
  }

  replaceSelection() {
    let originals = this.ds.selectedItems;
    let original = originals[0];
    let catalogOrFolder$ = of(undefined);
    let modelId: number;
    if (original.data.model && original.data.model.id) {
      modelId = Number(original.data.model.id);
      catalogOrFolder$ = this.files.getFile(modelId).pipe(
        map(file => file.parentId),
        catchError(_ => this.catalogs.getCatalog(original.catalog))
      );
    } else if (original.catalog) {
      catalogOrFolder$ = this.catalogs.getCatalog(original.catalog);
    }
    let ds = this.ds;
    catalogOrFolder$.pipe(
      catchError(_ => of(undefined)),
      concatMap(data => this.selectModel(data, modelId, original.type))
    ).subscribe(f => {
      this.project.replaceModels(originals, f).then(data => {
        if (data && data.modelId) {
          let model = ds.entityMap[data.modelId];
          model.selected = true;
        }
      });
    });
  }

  symmetryEntity() {
    this.ds.applyToSelection("Symmetry", e => ({symmetry: true })).then(_ => {
      if (this.ds.selected) {
        this.ds.selection.pos = this.ds.selected.sizeBox.center;
      }
    });
  }

  advancedCopy() {
    let axis = this.project.getElasticAxis(this.ds.selected);
    this.dialog
      .open(CopyDialogComponent, {data: axis})
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(v => this.project.advancedCopy(v));
  }

  removeAuxLines() {
    this.project.removeAuxLines(this.project.selectedFloorPlan);
  }

  addBookmark(list: Bookmark[]) {
    this.dialog
      .openPrompt({message: `Название закладки`})
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(name => {
        list.push({ id: this.ds.undoOperationId.toString(), name});
        this.project.setBookMarks(list);
      });
  }

  currentBookmark() {
    let id = this.ds.undoOperationId;
    return id && id.toString();
  }

  goToBookmark(bookmark: Bookmark) {
    this.ds.execute({type: 'goto', id: bookmark.id.toString()}).then(_ => {
      this.snackBar.open('Проект обновлен');
    });
  }

  removeBookmark(list: Bookmark[], bookmark: Bookmark, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    let index = list.indexOf(bookmark);
    list.splice(index, 1);
    this.project.setBookMarks(list);
  }

  restoreBackup() {
    this.files
      .restoreProject(this.fileItem.id, this.backupId)
      .subscribe(_ => this.router.navigate(['/project', this.fileItem.id]));
  }

  toogleCollisionCheck() {
    this.ds.options.collisions = !this.ds.options.collisions;
  }

  about() {
    this.dialog.open(AboutComponent);
  }

  offers: number[];

  showOffers() {
    if (this.selected) {
      this.paintMode = false;
      this.status = undefined;
      this.offers = this.selected.data.model.offers;
    }
  }

  hasHiddenLayers() {
    return this.ds.layers.some(l => !l.visible);
  }

  showAllLayers() {
    for (let layer of this.ds.layers) {
      layer.visible = true;
    }
  }

  toggleFullScreen() {
    this.window.toggleFullScreen(this.vcr.element.nativeElement);
  }

  modelExplorerActivate(value: number) {
    if (value === 0 && this.modelExplorer) {
      this.modelExplorer.selectFolder(undefined);
    }
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
}
