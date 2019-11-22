import { Component, OnInit, Input } from '@angular/core';
import { WebDesigner } from 'modeler/webdesigner';
import { NavigationMode } from 'modeler/designer';
import { vec3 } from 'modeler/geometry/vec3';
import { RenderMode } from 'modeler/render/renderer';

@Component({
  selector: 'app-navigator-3d',
  templateUrl: './navigator-3d.component.html',
  styleUrls: ['./navigator-3d.component.scss']
})
export class Navigator3dComponent implements OnInit {
  RenderMode = RenderMode;
  constructor() {}

  private _ds: WebDesigner

  @Input() set ds(value) {
    this._ds = value;
    this.webgl2 = value.render.webgl2Enabled;
  }

  get ds() {
    return this._ds;
  }

  webgl2 = false;

  ngOnInit() {}

  get navMode() {
    if (this.ds) {
      return NavigationMode[this.ds.camera.mode];
    }
  }

  set navMode(mode: string) {
    switch (NavigationMode[mode]) {
      case NavigationMode.Ortho:
        this._orthoCamera();
        break;
      case NavigationMode.Orbit:
        this._orbitCamera();
        break;
      case NavigationMode.Walk:
        this._walkCamera();
        break;
    }
  }

  applyNavMode(mode: string) {
    this.navMode = mode;
  }

  private _zoom(delta: number) {
    let camera = this.ds.camera;
    this.ds.animateCamera();
    if (camera.mode === NavigationMode.Orbit) {
      let zLimits = { near: 0, far: 1000 };
      camera.calcZPlanes(zLimits);

      let ray = this.ds.action.createRay();
      let diagonal = this.ds.box.diagonal;
      let speed = diagonal * 0.05;
      if (zLimits.near > 5) {
        speed = Math.max(speed, zLimits.near * 0.001);
      }

      this.ds.root.intersect(ray);
      if (ray.intersected) {
        let distance = ray.distance;
        speed = Math.max(distance * 0.2, this.ds.camera.nearPlaneLimit);
      }

      let dir = vec3.scale(vec3.create(), ray.dir, delta * speed * 0.005);
      camera.translate(dir);
    } else if (camera.mode === NavigationMode.Walk) {
      let ray = this.ds.action.createRay();
      let diagonal = this.ds.box.diagonal;
      let speed = diagonal * 0.01;
      let dir = vec3.fcopy(ray.dir);
      dir[1] = 0;
      vec3.normalize(dir, dir);
      dir = vec3.scale(dir, dir, delta * speed * 0.005);
      camera.translate(dir);
    } else {
      let ray1 = this.ds.action.createRay();
      camera.scale *= Math.pow(1.1, delta * 0.005);
      let ray2 = this.ds.action.createRay();
      let dir = vec3.sub(vec3.create(), ray1.pos, ray2.pos);
      camera.translate(dir);
    }
    this.ds.invalidate();
  }

  public zoomIn() {
    this._zoom(300);
  }

  public zoomOut() {
    this._zoom(-300);
  }

  zoomToFit() {
    this.ds.animateCamera();
    this.ds.zoomToFit(true, false);
  }

  get shadeMode() {
    return this.ds.render.mode;
  }

  set shadeMode(mode: RenderMode) {
    this.ds.render.mode = mode;
  }

  get background() {
    return this.ds.render.background;
  }

  set background(value: string) {
    this.ds.render.background = value;
  }

  toggleWallsVisibility() {
    this.ds.render.dynamicVisibility = !this.ds.render.dynamicVisibility;
  }

  togglexRayMode() {
    this.ds.render.xRayMode = !this.ds.render.xRayMode;
  }

  toggleSsao() {
    this.ds.render.effectsEnabled = !this.ds.render.effectsEnabled;
  }

  toggleSkyBox() {
    this.ds.render.background = this.ds.render.background
      ? undefined
      : 'country';
  }

  private _orthoCamera() {
    this.ds.camera.mode = NavigationMode.Ortho;
    this.ds.camera.orient(vec3.axisy, vec3.axis_z);
    this.ds.zoomToFit(false, false);
    this.ds.render.mode = RenderMode.HiddenEdgesVisible;
  }

  private _orbitCamera() {
    let perspective = this.ds.camera.perspective;
    this.ds.camera.mode = NavigationMode.Orbit;
    if (perspective) {
      return;
    }
    let viewDir = vec3.fromValues(0.6, 0.5, 0.6);
    let upDir = vec3.cross(vec3.create(), viewDir, vec3.axisy);
    upDir = vec3.cross(vec3.create(), upDir, viewDir);
    vec3.normalize(viewDir, viewDir);
    vec3.normalize(upDir, upDir);
    this.ds.camera.orient(viewDir, upDir);
    this.ds.zoomToFit(false, false);
    this.ds.render.mode = RenderMode.Shaded;
  }

  private _walkCamera() {
    let perspective = this.ds.camera.perspective;
    this.ds.camera.mode = NavigationMode.Walk;
    if (perspective) {
      return;
    }
    let viewDir = vec3.fromValues(0.6, 0.3, 0.6);
    let upDir = vec3.cross(vec3.create(), viewDir, vec3.axisy);
    upDir = vec3.cross(vec3.create(), upDir, viewDir);
    vec3.normalize(viewDir, viewDir);
    vec3.normalize(upDir, upDir);
    this.ds.camera.orient(viewDir, upDir);
    this.ds.zoomToFit(false, false);
    this.ds.render.mode = RenderMode.Shaded;
  }
}
