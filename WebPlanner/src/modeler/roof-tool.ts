import { vec3, mat4 } from './geometry';
import * as geom from './geometry/geometry';
import { Entity, Designer } from './designer';
import { CameraAction, MouseInfo, ActionCursor } from './actions';
import { locatePoint } from './snap-locators';
import { CatalogMaterial } from 'app/shared';

// https://www.roofcostestimator.com/top-15-roof-types-and-their-pros-cons/
export enum RoofType {
  Flat = 0,
  Shed = 1, // one slope
  Gable = 2, //two slopes
  Gambrel = 3,
  Hip = 4, // four slopes
  PyramidHip = 5,
  Mansard = 6,
}

export class RoofTool extends CameraAction {
  constructor(ds: Designer, private material: CatalogMaterial) {
    super(ds);
    this.selectionMode = false;
    this._sizeEntity = this.ds.temp.addChild();
    this._updateHint();
    this.cursor = ActionCursor.Pointer;
  }

  protected finishing() {
    if (this._sizeEntity) {
      this._sizeEntity.delete();
    }
    super.finishing();
  }

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
      this.hint = 'Choose start point';
    } else {
      this.hint = 'Choose end point';
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
    this._sizeEntity.orient(vec3.axisy, vec3.axisz);
    size.translate(pos);

    let contour = new geom.Contour();

    let plocal = size.toLocal(curPoint);
    contour.addPointxy(plocal[0], plocal[1]);
    if (this._p1) {
      let plocal1 = size.toLocal(this._p1);
      contour.addPointxy(plocal1[0], plocal1[1]);
      contour.addRectxy(plocal[0], plocal[1], plocal1[0], plocal1[1]);
    }
    size.drawing = contour;
    size.contentBox = this.root.box.copy();
    size.changed();
  }

  protected move(mouse: MouseInfo) {
    super.move(mouse);
    let curPoint = this._findPoint(mouse);
    if (curPoint && this._p1) {
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
        if (this._p1) {
          let plans = this.ds.root.children.filter(e => !!e.data.floor);
          let plan = plans.pop();

          let p1 = plan.toLocal(this._p1);
          let p2 = plan.toLocal(curPoint);

          let length = p2[0] - p1[0];
          if (length < 0) {
            p1[0] = p2[0];
            length = -length;
          }
          let width = p2[2] - p1[2];
          if (width < 0) {
            p1[2] = p2[2];
            width = -width;
          }
          let roofMatrix = mat4.ftransformation(p1, vec3.axisz, vec3.axisy);
          this.ds.apply('Add roof', {
            parent: plan,
            matrix: roofMatrix,
            name: 'Roof',
            catalog: this.material.catalogId,
            data: {
              roof: {
                length,
                width,
                height: 2500,
                thickness: 10,
                offset: 200,
                type: RoofType.Gable,
                material: this.material.name
              }
            },
            updateRoof: true
          });
          this.finish();
        } else {
          this._p1 = curPoint;
        }
      }
    }
  }
}
