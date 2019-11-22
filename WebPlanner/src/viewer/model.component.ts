import { Component, ViewChild, ElementRef, NgZone, EventEmitter, OnDestroy, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilesService, FileItem, AuthService, CatalogService, CatalogMaterial, dataURItoFile } from 'app/shared';
import { concatMap, takeUntil, tap, filter, map, take, debounceTime } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { WebDesigner } from 'modeler/webdesigner';
import { CameraAction, MouseInfo } from 'modeler/actions';
import { trigger, transition, style, animate } from '@angular/animations';
import { ModelHandler } from 'modeler/model-handler';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewerProjectLinkComponent } from './viewer-project-link/viewer-project-link.component';
import { mat4, vec3, glMatrix } from 'modeler/geometry';
import { RenderMode, materialPointer } from 'modeler/render/renderer';
import { MeshBundle } from 'modeler/render/render-scene';
import { Entity, NavigationMode } from 'modeler/designer';
import { Location } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MeasureTool } from 'modeler/measure-tool';
import { TdFileService } from 'app/shared/file/services/file.service';

class DefaultTool extends CameraAction {
  takeEntity(e: Entity) {
    return e;
  }
}

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css'],
  animations: [
    trigger("materialPanelAnimation", [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('200ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)' }))
      ]),
      transition('* => *', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0%)' })),
      ]),
    ])
  ]
})
export class ModelComponent implements AfterContentInit, OnDestroy {
  file$: Observable<FileItem>;
  designer: WebDesigner;
  editable = false;
  destroy$ = new EventEmitter<void>();
  fullView$: Observable<boolean>;
  usedMaterials: CatalogMaterial[] = [];
  selectedMaterial: CatalogMaterial;
  selectedMaterialState;
  handler: ModelHandler;
  hasAnimations = false;
  modelId: string;
  showMaterialEditor = true;
  showTree = true;
  loadingIndicator$: Observable<boolean>;
  fileItem: FileItem;

  constructor(private route: ActivatedRoute, private router: Router, private file: FilesService, private zone: NgZone,
    public auth: AuthService, private catalogs: CatalogService, private snackBar: MatSnackBar,
    private _materialDialogs: MatDialog, private location: Location, private breakpointObserver: BreakpointObserver,
    private tdFileService: TdFileService) {
    this.file$ = combineLatest(route.params, auth.isAuthenticated, route.queryParams).pipe(
      filter(p => !p[2]['compact']),
      concatMap(p => file.getFile(Number(p[0]['id']))),
      tap(f => {
        this.editable = !f.readOnly;
        this.fileItem = f;
      }
    ));
    this.fullView$ = route.queryParams.pipe(map(p => !p['compact']));
  }

  @ViewChild('modelcanvas', { read: ElementRef, static: true }) canvas: ElementRef;

  ngAfterContentInit() {
    this.designer = new WebDesigner(this.canvas.nativeElement as HTMLCanvasElement, this.zone, this.auth,
      this.catalogs, this.snackBar, this.breakpointObserver);
    this.loadingIndicator$ = this.designer.processing.pipe(debounceTime(250));
    this.designer.defaultAction = () => new DefaultTool(this.designer);
    this.designer.options.navigator = true;
    combineLatest(this.route.params, this.auth.isAuthenticated).pipe(
      concatMap(result => {
        let id = result[0]['id'];
        if (id) {
          this.designer.loadModel(id).then(_ => {
            this.makeThumbnail();
            this.modelChanged();
          })
          this.modelId = id.toString();
          this.route.queryParams.subscribe(p => {
            let cameraParam = p["camera"];
            if (cameraParam) {
              this.designer.loadCamera(cameraParam, true, false);
            }
          });
        }
        return of(undefined);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
    this.designer.render.materialChange.
      subscribe(_ => {
        this._updateMaterialList();
        this.makeThumbnail();
      });
    this.designer.render.textures.loading$.
      subscribe(_ => {
        this.makeThumbnail();
      });
    this.handler = new ModelHandler(this.designer);
    this.designer.modelChange.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(_ => {
      this.makeThumbnail();
    });
  }

  goToPreviousPage() {
    this.location.back();
  }

  getFullScreen() {
    this.router.navigate([], { queryParams: { compact: true }, queryParamsHandling: "merge" });
  }

  selectMaterial(m: CatalogMaterial) {
    this.selectedMaterial = m;
    this.selectedMaterialState = m.id;
  }

  uploadTexture(m: CatalogMaterial, file: File) {
    if (!this.editable) return;
    this.catalogs.uploadTexture(m, file).subscribe(response => {
      m.texture = response.texture;
      m.sizex = response.sizex;
      m.sizey = response.sizey;
      this.designer.invalidate();
      this._updateMaterialList();
    });
  }

  private _updateMaterialList() {
    this.usedMaterials = this.designer.usedMaterials();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.designer.destroy();
  }

  materialParamChanged(_: CatalogMaterial) {
    this.designer.invalidate();
  }

  closeMaterialEditor() {
    this.selectedMaterial = undefined;
  }

  animate() {
    if (!this.handler.animateAll()) {
      this.snackBar.open('No animations in model', undefined, { duration: 3000 });
    }
  }

  downloadFile(file: FileItem, format: string) {
    let root = this.designer.selected && this.designer.selected.uidStr;
    this.tdFileService.openDownloadDialog(file, format, root);
  }


  downloadLink(format?) {
    let link = `/api/files/${this.modelId}/download`;
    if (format) {
      link += '?format=' + format;
    }
    return link;
  }

  private modelChanged() {
    if (!this.designer.root) {
      return;
    }
    this._updateMaterialList();
    this.hasAnimations = false;
    this.designer.root.forAll(e => {
      if (e.anim) {
        this.hasAnimations = true;
      }
    });
  }

  private getViewLink() {
    let link = `${window.location.origin}/model/${this.modelId}?`;
    let cameraData = this.designer.saveCamera();
    link += `camera=${cameraData}`;
    return link;
  }

  generateViewLink() {
    let link = this.getViewLink();
    this._materialDialogs.open(ViewerProjectLinkComponent, {
      data: link,
      width: '75%'
    });
  }

  animationDone(event) {
    this.designer.invalidate();
  }

  makeThumbnail(manual = false) {
    if (!this.editable && !this.auth.admin) {
      return;
    }
    let camera = mat4.transformation(
      mat4.create(),
      vec3.origin,
      vec3.axisz,
      vec3.axisy
    );
    mat4.rotateY(camera, camera, glMatrix.toRadian(20));
    mat4.rotateX(camera, camera, glMatrix.toRadian(-40));

    this.designer.render.texturesLoaded.pipe(
      filter(v => v),
      concatMap(_ => this.designer.render.takePicture({
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
          return this.file.updateCustomThumbnail(this.modelId, blob)
        }
        return this.file.updateThumbnail(this.modelId, thumb)
      }),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(_ => {
      if (manual) {
        this.snackBar.open('Thumbnail updated');
      }
    });
  }

  dropTexture(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    let transfer = event.dataTransfer;
    if (transfer.files.length !== 1) return;
    let file = transfer.files[0];
    let bundle = this.getMeshBundleFromMouse(event);
    if (bundle) {
      this.uploadTexture(bundle.renderMaterial, file);
    }
  }

  onDragOver(event: Event): void {
    let transfer: DataTransfer = (<DragEvent>event).dataTransfer;
    transfer.dropEffect = 'copy';
    event.preventDefault();
  }

  canvasMouseup(event: MouseEvent) {
    if (this.designer.action) {
      if (!this.designer.action.moving && event.button === 2) {
        this.selectMaterialByMouse(event);
      }
    }
  }

  canvasDoubleClick(event: MouseEvent) {
    this.showMaterialEditor = true;
    this.selectMaterialByMouse(event);
  }

  RenderMode = RenderMode;

  get shadeMode() {
    return this.designer.render.mode;
  }

  set shadeMode(mode: RenderMode) {
    this.designer.render.mode = mode;
  }

  private selectMaterialByMouse(event: MouseEvent) {
    let bundle = this.getMeshBundleFromMouse(event);
    if (bundle && bundle.renderMaterial) {
      this.selectMaterial(bundle.renderMaterial);
    }
  }

  private getMeshBundleFromMouse(event: MouseEvent): MeshBundle {
    let mouseInfo = new MouseInfo();
    mouseInfo.set(event);
    let ray = this.designer.action.createRay(mouseInfo);
    this.designer.intersect(ray);
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
        return this.designer.render.scene.materials[pointer];
      }
    }
  }

  measureDistance() {
    this.designer.action = new MeasureTool(this.designer);
  }

  cancelAction() {
    this.designer.activeAction.cancel();
  }

  get actionHint() {
    if (this.designer.action) {
      return this.designer.activeAction.hint;
    }
  }

  get isDefaultAction() {
    return this.designer && this.designer.activeAction instanceof DefaultTool;
  }

  private _zoom(delta: number) {
    let camera = this.designer.camera;
    this.designer.animateCamera();
    if (camera.mode === NavigationMode.Orbit) {
      let zLimits = { near: 0, far: 1000 };
      camera.calcZPlanes(zLimits);

      let ray = this.designer.action.createRay();
      let diagonal = this.designer.box.diagonal;
      let speed = diagonal * 0.05;
      if (zLimits.near > 5) {
        speed = Math.max(speed, zLimits.near * 0.001);
      }

      this.designer.root.intersect(ray);
      if (ray.intersected) {
        let distance = ray.distance;
        speed = Math.max(distance * 0.2, this.designer.camera.nearPlaneLimit);
      }

      let dir = vec3.scale(vec3.create(), ray.dir, delta * speed * 0.005);
      camera.translate(dir);
    } else if (camera.mode === NavigationMode.Walk) {
      let ray = this.designer.action.createRay();
      let diagonal = this.designer.box.diagonal;
      let speed = diagonal * 0.01;
      let dir = vec3.fcopy(ray.dir);
      dir[1] = 0;
      vec3.normalize(dir, dir);
      dir = vec3.scale(dir, dir, delta * speed * 0.005);
      camera.translate(dir);
    } else {
      let ray1 = this.designer.action.createRay();
      camera.scale *= Math.pow(1.1, delta * 0.005);
      let ray2 = this.designer.action.createRay();
      let dir = vec3.sub(vec3.create(), ray1.pos, ray2.pos);
      camera.translate(dir);
    }
    this.designer.invalidate();
  }

  public zoomIn() {
    this._zoom(300);
  }

  public zoomOut() {
    this._zoom(-300);
  }

  zoomToFit() {
    this.designer.animateCamera();
    this.designer.zoomToFit(true, false);
  }

}
