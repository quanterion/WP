import { vec3, mat4, glMatrix } from './geometry';
import {
  Entity,
  EntityRay,
  NavigationMode,
} from "./designer";
import { DragDropTool } from './move-tool';
import { Renderer } from './render/renderer';
import { EventEmitter, NgZone } from '@angular/core';
import { AuthService, CatalogService, CatalogMaterial } from 'app/shared';
import { BuilderDesigner } from './builder-designer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver } from '@angular/cdk/layout';

export let forbiddenModelExtensions = ['b3d', 'f3d', 'fr3d'];
export function supportedModelExtensions() {
  let ext =  ['c3d', 'step', 'stp',
      'wrl', 'stl', 'x_t', 'x_b', 'sat', 'iges', 'igs', 'gltf', 'glb',
      'jt', '3ds', 'obj', 'dae', 'stl', 'fbx', 'blend', 'wpm'];
  return [...forbiddenModelExtensions, ...ext];
}

class AudioPlayer {
  constructor(private folder: string) {}
  doorOpen = () => this.play("door-open");
  doorClose = () => this.play("door-close");
  drawerOpen = () => this.play("drawer-open");
  drawerClose = () => this.play("drawer-close");

  private sounds = new Map<string, HTMLAudioElement>();
  private play(sound: string) {
    sound = `${this.folder}/${sound}.mp3`;
    let audio = this.sounds.get[sound];
    if (!audio) {
      audio = new Audio(sound);
      this.sounds.set(sound, audio);
    }
    audio.play();
  }
}

export class WebDesigner extends BuilderDesigner {
  render: Renderer;
  sounds = true;
  // emits true if mouse move event
  mouseEvent = new EventEmitter<boolean>();

  private audioPlayer = new AudioPlayer('./assets/sound');
  private _startPinchInfo = {
    pos: vec3.fromValues(0, 0, 0),
    scale: 1
  };

  private _installedCanvasEvents: { type: string; event: EventListener }[] = [];
  private _resizeHandler = () => {
    this.invalidate();
  };

  constructor(
    canvas: HTMLCanvasElement,
    zone: NgZone,
    private http: AuthService,
    catalogs: CatalogService,
    private snackBar: MatSnackBar,
    breakpointObserver: BreakpointObserver
  ) {
    super(canvas);
    let protocolPrefix = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.builderServer = protocolPrefix + '//' + location.host + '/builder/';

    this.render = new Renderer(this, canvas, catalogs, breakpointObserver);
    vec3.set(this.camera.translation, 0, 0, 1000);

    let addEvent = (type: string, event: EventListener) => {
      canvas.addEventListener(type, event);
      this._installedCanvasEvents.push({ type: type, event: event });
    };
    addEvent('mousedown', (e: MouseEvent) => this.mouseDown(e));
    addEvent('pointerdown', (e: PointerEvent) => this.pointerDown(e));
    addEvent('mouseup', (e: MouseEvent) => this.mouseUp(e));
    addEvent('wheel', (e: MouseEvent) => this.mouseWheel(e));
    addEvent('mouseenter', (e: MouseEvent) => this.mouseEnter(e));
    addEvent('mouseleave', (e: MouseEvent) => this.mouseLeave(e));
    addEvent('drop', (e: MouseEvent) => this.dragDrop(e));
    addEvent('touchstart', e => this._touchHandler(e));
    addEvent('touchend', e => this._touchHandler(e));
    zone.runOutsideAngular(() => {
      addEvent('mousemove', (e: MouseEvent) => this.mouseMove(e));
      addEvent('dragover', (e: MouseEvent) => this.dragOver(e));
      addEvent('touchmove', e => this._touchHandler(e));
    });

    //addEvent("pinchstart", e => this._pinchStart(e));
    //addEvent("pinchmove", e => this._pinchMove(e));

    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('orientationchange', this._resizeHandler);

    // for debug
    window['ds'] = this;
  }

  destroy() {
    for (let event of this._installedCanvasEvents) {
      this.canvas.removeEventListener(event.type, event.event);
    }
    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('orientationchange', this._resizeHandler);
    if (this.action) {
      this.action.finish();
    }
    this.render.destroy();
    this.render = undefined;
    this.mouseEvent.complete();
    super.destroy();
  }

  getAccessToken() {
    if (this.http.accessToken) {
      return 'Bearer ' + this.http.accessToken;
    }
    return '';
  }

  private _touchHandler(event) {
    let touches = event.changedTouches;
    let first = touches[0];

    let bb = event.target.getBoundingClientRect();
    let simulatedEvent = document.createEvent('MouseEvent');
    simulatedEvent.initMouseEvent(
      event.type,
      true,
      true,
      window,
      1,
      first.screenX,
      first.screenY,
      first.clientX - bb.left,
      first.clientY - bb.top,
      false,
      false,
      false,
      false,
      0,
      null
    );

    switch (event.type) {
      case 'touchstart':
        this.mouseDown(simulatedEvent);
        break;
      case 'touchmove':
        this.mouseMove(simulatedEvent);
        break;
      case 'touchend':
        this.mouseUp(simulatedEvent);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  private _pinchStart(event) {
    window.alert('Pinch start');
    this._startPinchInfo.pos = this.camera.toGlobal(vec3.fromValues(0, 0, 0));
    this._startPinchInfo.scale = this.camera.scale;
  }

  private _pinchMove(event) {
    if (this.camera.perspective) {
      let ray = new EntityRay();
      ray.pos = this.camera.toGlobal(vec3.origin);
      ray.dir = this.camera.NtoGlobal(vec3.axisz);
      this.root.intersect(ray);
      if (ray.intersected) {
        let pos = this.camera.toLocal(this._startPinchInfo.pos);
        let newZPos = (pos[2] - ray.distance) * event.scale + ray.distance;
        this.camera.translate(vec3.fscale(ray.dir, newZPos - pos[2]));
      }
      this._startPinchInfo.pos = this.camera.toGlobal(vec3.fromValues(0, 0, 0));
    } else {
      this.camera.scale = this._startPinchInfo.scale * event.scale;
    }
  }

  get pixelRatio() {
    return this.render.pixelRatio;
  }

  private pointerDown(event: PointerEvent) {
    if (this.canvas.setPointerCapture) {
      this.canvas.setPointerCapture(event.pointerId);
    }
  }

  private mouseDown(event: MouseEvent) {
    if (this.action) this.action.onMouseDown(event);
    if ((this.canvas as any).setCapture) {
      (this.canvas as any).setCapture();
    }
    this.mouseEvent.emit(false);
    return false;
  }

  private mouseMove(event: MouseEvent) {
    if (this.action) this.action.onMouseMove(event);
    return false;
  }

  private mouseUp(event: MouseEvent) {
    if (this.action) this.action.onMouseUp(event);
    this.mouseEvent.emit(false);
    return false;
  }

  private mouseWheel(event: MouseEvent) {
    if (this.action) this.action.onMouseWheel(event);
    this.mouseEvent.emit(false);
    return false;
  }

  private mouseEnter(event: MouseEvent) {
    if (this.action) this.action.onMouseEnter(event);
    this.mouseEvent.emit(false);
    return false;
  }

  private mouseLeave(event: MouseEvent) {
    if (this.action) this.action.onMouseLeave(event);
    this.mouseEvent.emit(false);
    return false;
  }

  private dragOver(event: MouseEvent) {
    event.preventDefault();
    if (this.action instanceof DragDropTool) {
      this.action.onMouseMove(event);
    }
  }

  private dragDrop(event: MouseEvent) {
    event.preventDefault();
    if (this.action instanceof DragDropTool) {
      this.action.endMove();
      this.action.finish();
    }
    this.mouseEvent.emit(false);
  }

  handleNavigator(x: number, y: number, orient: boolean) {
    if (this.options.navigator && this.render.navigator) {
      return this.render.navigator.handle(x, y, orient);
    }
    return false;
  }

  invalidate() {
    if (this.render) {
      this.render.invalidate();
    }
  }

  modelChanged() {
    if (this.render) {
      this.render.modelChanged();
    }
  }

  animateCamera() {
    this.render.animateCamera();
    this.camera.assigned = true;
  }

  animateEntity(e: Entity, newPos?: number, quiet?: boolean) {
    this.render.animateEntity(e, newPos);
    if (!e.animPos || e.animPos !== newPos) {
      let drawer = false;
      if (e.anim && e.anim.items.length === 1) {
        let item = e.anim.items[0];
        if (item.frames.length === 1) {
          let frame = item.frames[0];
          drawer = glMatrix.equalsd(frame.angle, 0);
        }
      }
      if (this.sounds && !quiet) {
        if (drawer) {
          if (e.animPos) {
            this.audioPlayer.drawerOpen();
          } else {
            this.audioPlayer.drawerClose();
          }
        } else {
          if (e.animPos) {
            this.audioPlayer.doorOpen();
          } else {
            this.audioPlayer.doorClose();
          }
        }
      }
    }
  }

  updateAnimation(e: Entity) {
    this.render.updateAnimation(e);
  }

  // overriden in modeler to return matrix corrected with animation
  get transformMatrix() {
    return this.render.calcTransformMatrix();
  }

  intersect(ray: EntityRay) {
    ray.animated = false;
    let ok = this.root.intersect(ray);
    if (this.render.intersectAnimatedObjects(ray)) {
      ok = true;
    }
    return ok;
  }

  enlargeFrustum(frustum, selectionOnly?: boolean) {
    this.render.scene.enlargeFrustum(frustum, selectionOnly);
  }

  executeActionOnSelection(
    type: string,
    name: string,
    getData?: (Entity) => any,
    action?: any
  ) {
    let actionObject = action || {};
    actionObject.name = name;
    actionObject.type = type;
    actionObject.items = this.selection.items.map(entity => {
      let entityData = getData ? getData(entity) || {} : {};
      entityData.uid = entity.uidStr;
      return entityData;
    });
    return this.execute(actionObject);
  }

  usedMaterials(): CatalogMaterial[] {
    let materials: CatalogMaterial[] = [];
    for (let bundle in this.render.scene.materials) {
      let material = this.render.scene.materials[bundle].renderMaterial;
      materials.push(material);
    }
    return materials.sort((a, b) => (a < b ? -1 : 1));
  }

  saveCamera(root?: Entity) {
    let m = this.camera.matrix;
    if (root) {
      m = mat4.mul(mat4.create(), root.invGlobalMatrix, m);
    }
    let msmall = [m[4], m[5], m[6], m[8], m[9], m[10], m[12], m[13], m[14]];
    for (let i = 0; i < msmall.length; ++i) {
      msmall[i] = Math.round(msmall[i] * 100) / 100;
    }
    let camera: any = {
      m: msmall,
      n: this.camera.mode,
      r: this.render.mode
    };
    let a = [];
    this.root.forEach(e => {
      if (e.animPos) {
        a.push(e.uidStr);
      }
    });
    if (a.length > 0) {
      camera.a = a;
    }
    if (this.camera.mode === NavigationMode.Ortho) {
      camera.s = this.camera.scale;
    }
    if (this.rootId) {
      camera.e = this.rootId;
    }
    let str = JSON.stringify(camera);
    return btoa(str.slice(1, str.length - 1));
  }

  loadCamera(param: string, position = true, animations = true) {
    let json = atob(param);
    if (!json.startsWith('{')) {
      json = '{' + json + '}';
    }
    let info = JSON.parse(json);
    let camera = this.camera;
    if (info.m && position) {
      let m = info.m;
      if (info.n !== undefined) {
        camera.mode = info.n;
      }
      if (info.r !== undefined) {
        this.render.mode = info.r;
      }
      camera.setIdentityTransform();
      camera.translate([m[6], m[7], m[8]]);
      camera.orient(vec3.fromValues(m[3], m[4], m[5]), vec3.fromValues(m[0], m[1], m[2]));
      if (info.e) {
        let e = this.entityMap[info.e];
        if (e) {
          camera.matrix = mat4.multiply(mat4.create(), e.globalMatrix, camera.matrix);
          e.selected = true;
        }
      }
      if (info.s) {
        this.camera.scale = info.s;
      }
      this.camera.assigned = true;
      this.camera.matrixChanged();
    }
    if (info.a && animations) {
      // we should wait for a render to happen because animations need renderLinks
      // and it's better to wait while textures are loading
      window.setTimeout(() => {
        for (let id of info.a) {
          let e = this.entityMap[id];
          if (e) {
            this.animateEntity(e, undefined, true);
          }
        }
      }, 1000);
    }
  }

  rotateSelection(angle: number, axis?: Float64Array) {
    if (this.selection.items.length < 1) return;
    let pivot = this.selection.items[0];
    let center = pivot.sizeBox.center;
    center = pivot.toGlobal(center);
    axis = axis ? vec3.fcopy(axis) : vec3.fromValues(0, 1, 0);
    axis = pivot.NtoGlobal(axis);
    let pos = this.selected && this.selection.pos && this.selected.toGlobal(this.selection.pos);
    this.selection.items.forEach(o =>
      o.globalRotate(center, axis, angle * Math.PI / 180)
    );
    this.applyToSelection('Rotate', e => ({matrix: e.matrix}));
    if (pos) {
      this.selection.pos = this.selected.toLocal(pos);
    }
  }

  removeSelection() {
    this.applyToSelection('Remove selection', e => ({ uid: e, remove: true}));
  }

  snack(message: string, action?: string, duration?: number) {
    let config = duration ? { duration } : undefined;
    return this.snackBar.open(message, action, config).onAction();
  }
}
