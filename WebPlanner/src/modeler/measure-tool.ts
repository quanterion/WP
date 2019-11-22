import { glMatrix } from './geometry/common';
import { vec3 } from './geometry';
import * as geom from './geometry/geometry';
import { Entity, Designer, NavigationMode } from './designer';
import { CameraAction, MouseInfo, ActionCursor } from './actions';
import { locatePoint } from './snap-locators';
import { ImageMaker } from 'app/planner/image-maker';

export class MeasureTool extends CameraAction {
  private autoSizes: Entity;

  constructor(ds: Designer, imageMaker?: ImageMaker) {
    super(ds);
    this.selectionMode = false;
    this.sizeRoot = this.ds.temp.addChild();
    this._sizeEntity = this.sizeRoot.addChild();
    this._updateHint();
    this.cursor = ActionCursor.Pointer;
    if (imageMaker) {
      this.addCommand('ОБРАЗМЕРИТЬ ИЗДЕЛИЯ', () => {
        if (this.autoSizes) {
          this.autoSizes.delete();
        }
        this.autoSizes = imageMaker.createArticleSizes();
        this.autoSizes.parent = this.sizeRoot;
      });
      this.addCommand('ОБРАЗМЕРИТЬ ПЛАНИРОВКУ', () => {
        if (this.autoSizes) {
          this.autoSizes.delete();
        }
        this.autoSizes = imageMaker.createFloorSizes();
        this.autoSizes.parent = this.sizeRoot;
      });
    }
  }

  protected finishing() {
    this.sizeRoot.delete();
    super.finishing();
  }

  private sizeRoot: Entity;
  private _sizeEntity: Entity;
  private _p1: Float64Array;
  private _p2: Float64Array;

  private _findPoint(mouse: MouseInfo) {
    let point = locatePoint(
      mouse.x,
      mouse.y,
      this.root,
      this.ds.root.windowMatrix,
      10
    );
    if (point) {
      return point;
    }
    let ray = this.createRay(mouse);
    if (this.intersect(ray)) {
      return ray.intersectPos;
    }
  }

  private _updateHint() {
    if ((this._p1 && this._p2) || !this._p1) {
      this.hint = 'Укажите первую точку';
    } else {
      this.hint = 'Укажите вторую точку';
    }
  }

  private _updateDrawing(curPoint: Float64Array) {
    let pos = curPoint;
    let p2 = this._p2 || curPoint;
    if (this._p1) {
      if (vec3.equals(this._p1, p2)) {
        p2 = vec3.fadd(p2, vec3.axisx);
      }
      pos = vec3.fmiddle(p2, this._p1);
    }
    let size = this._sizeEntity;
    size.setIdentityTransform();
    size.translate(pos);

    if (this._p1) {
      let diry = vec3.fsub(p2, this._p1);
      vec3.normalize(diry, diry);
      let dirz = this.ds.camera.NtoGlobal(vec3.axisz);
      let dirx = vec3.fcross(diry, dirz);
      if (vec3.len(dirx) > glMatrix.EPSILON) {
        dirz = vec3.fcross(diry, dirx);
        vec3.normalize(dirz, dirz);
        size.orient(dirz, diry);
      }
    } else {
      let dirz = this.ds.camera.NtoGlobal(vec3.axisz);
      let diry = this.ds.camera.NtoGlobal(vec3.axisy);
      size.orient(dirz, diry);
    }

    let contour = new geom.Contour();

    let plocal = size.toLocal(curPoint);
    contour.addPointxy(plocal[0], plocal[1]);
    if (this._p1) {
      let plocal1 = size.toLocal(this._p1);
      let plocal2 = size.toLocal(p2);
      contour.addPointxy(plocal1[0], plocal1[1]);
      contour.addPointxy(plocal2[0], plocal2[1]);
      contour.addSizexy(plocal1[0], plocal1[1], plocal2[0], plocal2[1]);
    }
    size.drawing = contour;
    size.contentBox = this.root.box.copy();
    size.changed();
  }

  protected move(mouse: MouseInfo) {
    super.move(mouse);
    let curPoint = this._findPoint(mouse);
    if (curPoint && this._p1 && this.ds.camera.mode === NavigationMode.Ortho) {
      curPoint[1] = this._p1[1];
    }
    if (curPoint) {
      this._updateDrawing(curPoint);
    }
  }

  protected up(mouse: MouseInfo) {
    super.up(mouse);
    if (!this.moving) {
      let curPoint = this._findPoint(mouse);
      if (curPoint) {
        if (!this._p1) {
          this._p1 = curPoint;
          this._p2 = undefined;
          this._updateDrawing(curPoint);
        } else {
          this._p2 = curPoint;
          this._updateDrawing(curPoint);
          this._p1 = undefined;
          this._p2 = undefined;
          this._sizeEntity = this.sizeRoot.addChild();
        }
        this._updateHint();
      }
    }
  }
}
