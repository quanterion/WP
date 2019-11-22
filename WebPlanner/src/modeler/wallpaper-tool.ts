import { Entity, Designer, Mesh } from './designer';
import { CameraAction, MouseInfo } from './actions';

export class WallpaperTool extends CameraAction {
  constructor(
    ds: Designer,
    private _material: string,
    private _catalog: number
  ) {
    super(ds);
    this.selectionMode = false;
    this.hint = 'Click on a surface to paste the paper to it';
  }

  protected up(mouse: MouseInfo) {
    super.up(mouse);
    if (!this.moving && mouse.left) {
      let ray = this.createRay(mouse);
      if (this.intersect(ray)) {
        if (ray.mesh && ray.mesh instanceof Mesh) {
          let entity = ray.entity as Entity;
          this.ds.apply('Painting', {
            uid: entity,
            paint: {
              material: this._material,
              catalog: this._catalog,
              faces: [entity.meshes.indexOf(ray.mesh)]
            }
          });
        }
      }
    }
  }
}
