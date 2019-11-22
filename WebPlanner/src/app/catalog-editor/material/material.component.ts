import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnDestroy
} from "@angular/core";
import { CatalogMaterial, CatalogService, roundFloat } from '../../shared';
import { TdFileUploadComponent } from 'app/shared/file/file-upload/file-upload.component';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MaterialUnit, copyMaterial, MaterialType } from "app/shared/catalog.service";
import { filter, debounceTime, share } from "rxjs/operators";
import { DialogService } from "app/dialogs/services/dialog.service";

@Component({
  selector: "app-material",
  templateUrl: "./material.component.html",
  styleUrls: ["./material.component.scss"]
})
export class MaterialComponent implements OnDestroy {

  constructor(
    private _catalogService: CatalogService,
    private dialog: DialogService,
    private snackBar: MatSnackBar,
  ) {
    this.paramChange.pipe(debounceTime(250)).subscribe(_ => this.applyParams());
    this.internalColorChange.pipe(debounceTime(250)).subscribe(value => this.updateColor(value));
  }

  _material: CatalogMaterial;
  old?: CatalogMaterial | null;
  paramChange = new EventEmitter<void>();
  internalColorChange = new EventEmitter<string>();

  texturePanelExpanded = false;
  lightingPanelExpanded = false;
  effectsPanelExpanded = false;
  pricePanelExpanded = false;

  ngOnDestroy(): void {
    this.paramChange.complete();
  }

  get undoState() {
    if (this.old === null) {
      return 'changing';
    } else if (this.old) {
      return 'undo';
    }
  }

  @ViewChild('tdTextureUploader', { static: false }) fileUpload: TdFileUploadComponent;
  @ViewChild('tdBumpUpload1', { static: false }) bumpUpload1: TdFileUploadComponent;
  @ViewChild('tdBumpUpload2', { static: false }) bumpUpload2: TdFileUploadComponent;

  @Input()
  set material(value: CatalogMaterial) {
    this._material = value;
    this.setParams();
  }

  get material() {
    return this._material;
  }

  @Input() readOnly = false;
  @Input() modelId?: number;

  get editable() {
    return !this.readOnly;
  }

  private setParams() {
    let value = this._material;
    if (value) {
      this.type = value.type;
      this.sizex = roundFloat(value.sizex);
      this.sizey = roundFloat(value.sizey);
      this.offsetx = roundFloat(value.offsetx);
      this.offsety = roundFloat(value.offsety);
      this.angle = roundFloat(value.angle);
      this.transparency = roundFloat(value.transparency * 100);
      this.reflection = roundFloat(value.reflection * 100);
      this.ambient = roundFloat(value.ambient * 100);
      this.specular = roundFloat(value.specular * 100);
      this.shininess = roundFloat(value.shininess * 100);
      this.sku = value.sku || '';
      this.price = roundFloat(value.price);
      this.unit = value.unit;
    }
  }

  @Input() showImage = true;
  @Output() change = new EventEmitter<CatalogMaterial>();
  @Input() closable = false;
  @Output() close = new EventEmitter<void>();
  @Input() customButton?: string;
  @Output() customButtonClick = new EventEmitter<void>();

  type = MaterialType.Material;
  sizex = 100;
  sizey = 100;
  offsetx = 0;
  offsety = 0;
  angle = 0;
  transparency = 0;
  reflection = 0;
  ambient = 0;
  specular = 0;
  shininess = 0;
  sku: string;
  price = 0;
  unit = MaterialUnit.None;

  uploadTexture(file: File) {
    if (this.readOnly) {
      return;
    }
    this.old = undefined;
    let old = copyMaterial(this._material);
    this._catalogService
      .uploadTexture(this._material, file)
      .subscribe(response => {
        this._material.texture = response.texture;
        this._material.sizex = response.sizex;
        this._material.sizey = response.sizey;
        this.material = this._material;
        this.change.emit(this._material);
        this.old = old;
      });
  }

  updateColor(color?: string) {
    if (color && color !== 'none') {
      this.old = undefined;
      let old = copyMaterial(this._material);
      this._material.texture = color;
      this.materialChanged(old);
    }
  }

  tdUploadTexture(fileInfo: File | FileList) {
    if (fileInfo instanceof FileList) {
      this.uploadTexture(fileInfo.item(0));
    } else if (fileInfo instanceof File) {
      this.uploadTexture(fileInfo);
    }
    this.fileUpload.cancel();
  }

  uploadBumpMap(file?: File, bump = true) {
    if (this.readOnly) {
      return;
    }
    this.old = undefined;
    let old = copyMaterial(this._material);
    this.bumpUpload1.cancel();
    this._catalogService
      .uploadBumpMap(this._material, file, bump)
      .subscribe(response => {
        this._material.bumpTexture = response.bumpTexture;
        this.material = this._material;
        this.change.emit(this._material);
        this.old = old;
      });
      this.bumpUpload1.cancel();
      this.bumpUpload2.cancel();
  }

  private materialChanged(old?: CatalogMaterial) {
    if (this.old) {
      // do not reset null values indicating undo in progress
      this.old = undefined;
    }
    let mat = copyMaterial(this._material);
    this.change.emit(this._material);
    let sub =  this._catalogService.updateMaterial(mat).pipe(share());
    sub.subscribe(_ => this.old = old);
    return sub;
  }

  clearBumpMap() {
    let old = copyMaterial(this._material);
    this._material.bumpTexture = '';
    this.materialChanged(old);
  }

  paramChanged() {
    this.paramChange.next();
  }

  applyParams() {
    let m = this.material;
    let old = copyMaterial(m);
    if (m) {
      m.type = this.type;
      m.sizex = this.sizex;
      m.sizey = this.sizey;
      m.offsetx = this.offsetx;
      m.offsety = this.offsety;
      m.transparency = this.transparency / 100;
      m.reflection = this.reflection / 100;
      m.angle = this.angle;
      m.ambient = this.ambient / 100;
      m.specular = this.specular / 100;
      m.shininess = this.shininess / 100;
      m.sku = this.sku;
      m.price = this.price;
      m.unit = this.unit;
      this.materialChanged(old);
    }
  }

  renameMaterial() {
    this.dialog
      .openPrompt({
        message: "Enter material name",
        value: this.material.name,
        title: "Rename material"
      })
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(newValue => {
        this.old = undefined;
        let newMaterial = copyMaterial(this._material);
        newMaterial.name = newValue;
        this._catalogService.updateMaterial(newMaterial, this.modelId).subscribe(result => {
          this.old = undefined;
          this.material.name = newValue;
          if (result.changedModels > 0) {
            this.snackBar.open(`Material successfully renamed in model`);
          }
        });
      });
  }

  get hasTexture() {
    if (this._material) {
      let t = this._material.texture;
      if (t && t.length === 7 && t[0] === '#') {
        return false;
      }
      return true;
    }
    return false;
  }

  get materialColor() {
    if (this._material) {
      let t = this._material.texture;
      if (t && t.length === 7 && t[0] === '#') {
        return t;
      }
    }
  }

  revert() {
    if (this.old) {
      let cur = copyMaterial(this._material);
      for (let prop in this.old) {
        this._material[prop] = this.old[prop];
      }
      this.old = null;
      this.materialChanged(cur).subscribe(_ => this.setParams());
    }
  }
}
