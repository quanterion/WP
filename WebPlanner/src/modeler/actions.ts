import { vec3 } from './geometry/vec3';
import { mat4 } from './geometry/mat4';
import { plane } from './geometry/plane';
import { Mesh, Entity, EntityRay, Designer, NavigationMode } from './designer';
import { ElementRange } from './render/vector-renderer';
import * as geom from './geometry/geometry';
import { glMatrix } from './geometry';

export enum MouseEventType {
  None,
  Down,
  Move,
  Up
}

export class MouseInfo {
  event = MouseEventType.None;
  x: number;
  y: number;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  left: boolean;
  right: boolean;
  middle: boolean;
  delta: number; // for wheel events
  touch = false;
  pixelScale = 1;

  constructor(event?: MouseEvent) {
    if (event) {
      this.set(event);
    }
  }

  get anyButton() {
    return this.left || this.right || this.middle;
  }

  set(event: MouseEvent) {
    this.x = event.offsetX;
    this.y = event.offsetY;
    this.shift = event.shiftKey;
    this.alt = event.altKey;
    this.ctrl = event.ctrlKey;

    this.left = false;
    this.middle = false;
    this.right = false;
    this.touch = false;

    switch (event.type) {
      case 'touchstart':
        this.touch = true;
        this.event = MouseEventType.Down;
        break;
      case 'mousedown':
        this.event = MouseEventType.Down;
        break;
      case 'touchmove':
        this.touch = true;
        this.event = MouseEventType.Move;
        break;
      case 'mousemove':
        this.event = MouseEventType.Move;
        break;
      case 'touchend':
        this.touch = true;
        this.event = MouseEventType.Up;
        break;
      case 'mouseup':
        this.event = MouseEventType.Up;
        break;
    }
    this.delta = event['wheelDelta']
    if (!this.delta && event['deltaY']) {
      this.delta = -event['deltaY'] * 20;
    }
    if (this.touch) {
      this.left = true;
    } else {
      if (event.type !== 'mousemove') {
        this.left = event.button === 0;
        this.middle = event.button === 1;
        this.right = event.button === 2;
      }
      if (event.buttons) {
        this.left = !!(event.buttons & 1);
        this.middle = !!(event.buttons & 4);
        this.right = !!(event.buttons & 2);
      }
    }
  }

  atTheSamePoint(event: MouseInfo) {
    return (
      Math.abs(this.x - event.x) < 5 * this.pixelScale &&
      Math.abs(this.y - event.y) < 5 * this.pixelScale
    );
  }

  clearButtons() {
    this.left = false;
    this.right = false;
    this.middle = false;
  }
}

export class ActionCommand {
  constructor(
    public name: string,
    public command: () => any,
    public hint: string = '',
    public enabled = true
  ) {}
}

export enum ActionCursor {
  Default = 'default',
  Picker = 'pointer',
  Pointer = 'crosshair',
  Move = 'move',
  Add = 'copy',
  Wait = 'wait'
}

export class Action {
  mouse = new MouseInfo();
  lastMouse = new MouseInfo();
  lastMouseDown = new MouseInfo();

  mousePressed = false;
  // if mouse moved after pressing button
  moving = false;
  ds: Designer;
  get root(): Entity {
    return this.ds.root;
  };
  cursor = ActionCursor.Default;

  private _finishHandler: (action: Action) => any;
  private _finished = false;
  private _canceled = false;
  private _child: Action;
  private _hint?: string;

  _draggingMode: string;
  _draggingCalback: () => any;

  constructor(ds: Designer) {
    this.ds = ds;
    let pixelScale = ds.pixelRatio;
    this.mouse.pixelScale = pixelScale;
    this.lastMouse.pixelScale = pixelScale;
    this.lastMouseDown.pixelScale = pixelScale;
  }

  commands: ActionCommand[] = [];

  finish() {
    if (this._child) {
      if (this._canceled) {
        this._child.cancel();
      } else {
        this._child.finish();
      }
    }
    this.finishing();
    this._finished = true;
    let finishHandler = this._finishHandler;
    this._finishHandler = undefined;
    if (finishHandler) {
      finishHandler(this);
    }
  }

  protected get finished() {
    return this._finished;
  }

  cancel() {
    this._canceled = true;
    this.finish();
  }

  get canceled() {
    return this._canceled;
  }

  setFinishHandler(handler: (action: Action) => any) {
    this._finishHandler = handler;
  }

  get child() {
    return this._child;
  }

  get hint() {
    return this._hint;
  }

  set hint(value: string | undefined) {
    this._hint = value;
  }

  get options() {
    return this.ds.options;
  }

  addCommand(name: string, command: () => any) {
    let actionCommand = new ActionCommand(name, command);
    this.commands.push(actionCommand);
    return actionCommand;
  }

  run(action: Action, onFinish?: (action: Action) => any) {
    this._child = action;
    action.setFinishHandler(() => {
      this._child = undefined;
      if (onFinish) {
        onFinish(action);
      }
    });
    action.move(this.mouse);
  }

  get isDragging(): boolean {
    if (this.child && this.child.isDragging) {
      return true;
    }
    return this._draggingMode !== undefined;
  }

  startDrag(mode: string, onStop?: () => any): boolean {
    if (!this._draggingMode) {
      this._draggingMode = mode;
      this._draggingCalback = onStop;
      return true;
    } else {
      return false;
    }
  }

  endDrag() {
    this._draggingMode = undefined;
    if (this._draggingCalback) {
      this._draggingCalback();
      this._draggingCalback = undefined;
    }
  }

  createRayByMatrix(mouse: MouseInfo, transformMatrix): EntityRay {
    let pos1 = vec3.fromValues(
      mouse.x / this.ds.canvas.clientWidth * 2.0 - 1.0,
      (1.0 - mouse.y / this.ds.canvas.clientHeight) * 2.0 - 1.0,
      -1.0
    );
    let pos2 = vec3.fromValues(pos1[0], pos1[1], 0.0);
    let invertTransform = mat4.finvert(transformMatrix);
    if (invertTransform) {
      vec3.transformMat4(pos1, pos1, invertTransform);
      vec3.transformMat4(pos2, pos2, invertTransform);
    }

    let ray = new EntityRay();
    vec3.copy(ray.pos, pos1);
    vec3.sub(ray.dir, pos2, pos1);
    vec3.normalize(ray.dir, ray.dir);
    return ray;
  }

  createRay(mouse?: MouseInfo): EntityRay {
    if (!mouse) {
      mouse = new MouseInfo();
      mouse.x = this.ds.canvas.clientWidth * 0.5;
      mouse.y = this.ds.canvas.clientHeight * 0.5;
    }
    let ray = this.createRayByMatrix(mouse, this.ds.transformMatrix);
    return ray;
  }

  intersect(ray: EntityRay) {
    return this.ds.intersect(ray);
  }

  onMouseDown(event: MouseEvent) {
    if (!this.ds.root) {
      return;
    }
    this.mousePressed = true;
    if (this._child) {
      this._child.onMouseDown(event);
      return;
    }
    this.ds.hideEditor();
    this.moving = false;
    this.mouse.set(event);
    this.down(this.mouse);
    this.lastMouse.set(event);
    this.lastMouseDown.set(event);
  }

  onMouseEnter(event: MouseEvent) {
    if (!this.ds.root) {
      return;
    }
    if (this._child) {
      this._child.onMouseEnter(event);
      return;
    }
    this.enter(this.mouse);
  }

  onMouseLeave(event: MouseEvent) {
    if (!this.ds.root) {
      return;
    }
    if (this._child) {
      this._child.onMouseLeave(event);
      return;
    }
    this.leave(this.mouse);
  }

  onMouseMove(event: MouseEvent) {
    if (!this.ds.root) {
      return;
    }
    if (this._child) {
      this._child.onMouseMove(event);
      return;
    }
    this.mouse.set(event);
    if (!this.mouse.anyButton) {
      if (this.ds.handleNavigator(this.mouse.x, this.mouse.y, false)) {
        return;
      }
    }
    if (!this.moving && !this.lastMouseDown.atTheSamePoint(this.mouse) && this.mouse.anyButton)
      this.moving = true;
    this.move(this.mouse);

    if (this.lastMouse.event === MouseEventType.Down) {
      if (!this.mouse.left && this.lastMouse.left) {
        this.up(this.mouse);
      } else if (!this.mouse.right && this.lastMouse.right) {
        this.up(this.mouse);
      }
    }
    this.lastMouse.set(event);
  }

  onMouseUp(event: MouseEvent) {
    if (!this.ds.root) {
      return;
    }
    this.mousePressed = false;
    if (this._child) {
      this._child.onMouseUp(event);
      return;
    }
    this.mouse.set(event);
    if (this.mouse.left) {
      if (this.ds.handleNavigator(this.mouse.x, this.mouse.y, true)) {
        return;
      }
    }
    this.up(this.mouse);
    if (this.moving && !this._finished) this.click();
    this.lastMouse.set(event);
    this.lastMouseDown.clearButtons();
  }

  onMouseWheel(event: MouseEvent) {
    if (!this.ds.root) {
      return;
    }
    if (this._child) {
      this._child.onMouseWheel(event);
      return;
    }
    this.mouse.set(event);
    this.wheel(this.mouse);
    event.preventDefault();
  }

  onServerSync() {
    if (this._child) {
      this._child.serverSync();
    }
    this.serverSync();
  }

  onSelectionChanged() {
    if (this._child) {
      this._child.selectionChanged();
    }
    this.selectionChanged();
  }

  // functions to override
  protected click() {}
  protected move(mouse: MouseInfo) {}
  protected down(mouse: MouseInfo) {}
  protected up(mouse: MouseInfo) {}
  protected enter(mouse: MouseInfo) {}
  protected leave(mouse: MouseInfo) {}
  protected wheel(mouse: MouseInfo) {}

  escape() {
    if (this.child) {
      this.child.cancel();
    } else {
      this.cancel();
    }
  }
  protected key() {}
  protected selectionChanged() {
    this.ds.selection.pos = undefined;
  }
  // model updated from the server
  protected serverSync() {}
  protected finishing() {}

  protected invalidate() {
    this.ds.invalidate();
  }
}

enum CameraMode {
  None,
  Move,
  Scale,
  Rotate
}

export class CameraAction extends Action {
  private cameraMode = CameraMode.None;
  private shiftPoint = vec3.create();
  private cameraPosition = vec3.create();
  private shiftPlane = plane.createABCD(0, 0, 1, 0);
  private rotateCenter = vec3.create();
  private transformMatrix: Float64Array;
  private tempCamera: Entity;
  protected selectionMode = true;

  private handleCameraMove(mouse: MouseInfo) {
    let handle = false;
    let camera = this.ds.camera;
    switch (this.cameraMode) {
      case CameraMode.Move: {
        camera.translation = this.cameraPosition;
        let ray = this.createRayByMatrix(mouse, this.transformMatrix);
        ray.intersectPlane(this.shiftPlane);
        if (ray.intersected) {
          let newPos = ray.intersectPos;
          let moveDir = vec3.sub(vec3.create(), this.shiftPoint, newPos);
          camera.translate(moveDir);
        }
        camera.lastRotationCenter = undefined;
        handle = true;
        break;
      }

      case CameraMode.Rotate: {
        let dirx = mouse.x - this.lastMouse.x;
        let diry = mouse.y - this.lastMouse.y;
        let rotSpeed = 0.005;
        this.ds.animateCamera();

        let yAxis = vec3.fromValues(0.0, 1.0, 0.0);
        this.tempCamera.rotate(this.rotateCenter, yAxis, -dirx * rotSpeed);
        let xAxis = this.tempCamera.NtoGlobal(vec3.fromValues(1, 0, 0));
        let zAxis = this.tempCamera.NtoGlobal(vec3.fromValues(0, 0, 1));
        let yangle = -diry * rotSpeed;
        let ylimit = glMatrix.toRadian(15);
        if (yangle > 0) {
          let cur = Math.acos(-zAxis[1]);
          if (cur - yangle < ylimit) {
            yangle = cur - ylimit;
          }
        } else {
          let cur = Math.acos(zAxis[1]);
          if (cur + yangle < ylimit) {
            yangle = ylimit - cur;
          }
        }
        this.tempCamera.rotate(this.rotateCenter, xAxis, yangle);
        camera.matrix = this.tempCamera.matrix;
        handle = true;
        break;
      }
    }
    if (handle) this.ds.invalidate();
    return handle;
  }

  startCameraManipulation(mouse: MouseInfo) {
    let camera = this.ds.camera;
    let ortho = this.ds.camera.mode === NavigationMode.Ortho;
    let rightButton = this.lastMouseDown.right && mouse.right;
    let leftButton = this.lastMouseDown.left && mouse.left;
    if (
      (rightButton && this.cameraMode !== CameraMode.Move) ||
      (leftButton && ortho)
    ) {
      let ray = this.createRay(this.lastMouseDown);
      if (!this.intersect(ray)) {
        let zLimits = { near: 0, far: 1000 };
        camera.calcZPlanes(zLimits);
        if (camera.perspective) {
          if (zLimits.near < camera.nearPlaneLimit)
            zLimits.near = camera.nearPlaneLimit;
          if (zLimits.far < zLimits.near) zLimits.far = zLimits.near;
        }
        ray.distance = (zLimits.near + zLimits.far) * 0.5;
        ray.intersected = true;
      }

      if (ray.intersected) {
        this.shiftPoint = ray.intersectPos;
        this.cameraPosition = vec3.fcopy(this.ds.camera.translation);
        this.transformMatrix = this.ds.camera.transformMatrix();
        this.shiftPlane = plane.createPN(
          this.shiftPoint,
          this.ds.camera.NtoGlobal(vec3.axisz)
        );
        this.cameraMode = CameraMode.Move;
      }
    } else if (leftButton && this.cameraMode !== CameraMode.Rotate && !ortho) {
      this.rotateCenter = this.ds.camera.findRotationCenter();
      this.tempCamera = new Entity(undefined);
      mat4.copy(this.tempCamera.matrix, this.ds.camera.matrix);
      this.cameraMode = CameraMode.Rotate;
    }
  }

  protected down(_: MouseInfo) {
    this.ds.selection.mesh = undefined;
  }

  protected move(mouse: MouseInfo) {
    if (this.moving) {
      if (!this.cameraMode && !this.isDragging) {
        this.startCameraManipulation(mouse);
      }
      if (this.cameraMode) {
        this.handleCameraMove(mouse);
      }
    }
  }

  takeEntity(e: Entity) {
    if (!e || !e.parent) {
      return;
    }
    let customRoot = !!this.ds.rootId;
    while (customRoot || e.parent.parent) {
      let d = e.data;
      let selModel = d.model && d.model.id !== undefined;
      if (selModel || d.wall || d.room || d.ceiling || d.roof || d.floor) {
        break;
      }
      e = e.parent;
    }
    return e;
  }

  intersect(ray: EntityRay) {
    let ok = false;
    if (this.ds.camera.mode === NavigationMode.Ortho) {
      ray.contentFilter = (e: Entity) => !e.data.wall && !e.data.room;
      ok = this.ds.intersect(ray);
      if (!ok) {
        ray.contentFilter = (e: Entity) => !!e.data.wall || !!e.data.room;
        ok = this.ds.intersect(ray);
      }
    } else {
      ok = this.ds.intersect(ray);
    }
    return ok;
  }

  protected up(mouse: MouseInfo) {
    if (this.finished) return;
    this.cameraMode = CameraMode.None;
    if (!this.moving && !this.ds.editorActive && this.selectionMode) {
      let ray = this.createRay(mouse);
      ray.selection = true;
      if (this.intersect(ray)) {
        let entity = <Entity>ray.entity;
        entity = this.takeEntity(entity);
        this.ds.selection.pos = undefined;
        if (entity && mouse.left) {
          if (!mouse.ctrl && !mouse.shift) {
            this.ds.selection.clear();
            entity.selected = true;
            this.ds.selection.mesh = ray.mesh as Mesh;
          } else {
            entity.selected = !entity.selected;
          }
          if (entity.selected) {
            this.ds.selection.pos = entity.toLocal(ray.intersectPos);
          }
        }
      } else {
        this.ds.selection.clear();
      }
    }
  }

  moveCameraForward(mouse?: MouseInfo, delta?: number) {
    delta = delta || mouse.delta;
    let camera = this.ds.camera;
    this.ds.animateCamera();
    let ray = this.createRay(mouse);
    if (camera.mode === NavigationMode.Orbit) {
      let zLimits = { near: 0, far: 1000 };
      camera.calcZPlanes(zLimits);

      let diagonal = this.ds.box.diagonal;
      let speed = diagonal * 0.05;
      if (zLimits.near > 5) speed = Math.max(speed, zLimits.near * 0.001);

      this.ds.root.intersect(ray);
      if (ray.intersected) {
        let distance = ray.distance;
        speed = Math.max(distance * 0.2, this.ds.camera.nearPlaneLimit);
      }

      let dir = vec3.scale(vec3.create(), ray.dir, delta * speed * 0.005);
      camera.translate(dir);
    } else if (camera.mode === NavigationMode.Walk) {
      let diagonal = this.ds.box.diagonal;
      let speed = diagonal * 0.01;
      let dir = vec3.fcopy(ray.dir);
      dir[1] = 0;
      vec3.normalize(dir, dir);
      dir = vec3.scale(dir, dir, delta * speed * 0.005);
      camera.translate(dir);
      this.ds.root.intersect(ray);
      let entity = <Entity>ray.entity;
      while (entity && !entity.anim) {
        entity = entity.parent;
      }
      if (ray.distance < 1000 && entity && entity.anim && !entity.animPos) {
        this.ds.animateEntity(entity);
      }
    } else {
      camera.scale *= Math.pow(1.1, delta * 0.005);
      let ray2 = this.createRay(mouse);
      let dir = vec3.sub(vec3.create(), ray.pos, ray2.pos);
      camera.translate(dir);
    }
    this.ds.invalidate();
  }

  protected wheel(mouse: MouseInfo) {
    if (mouse.delta) {
      this.moveCameraForward(mouse);
    }
  }
}

export function rangeCursorDistance(
  range: ElementRange,
  transform,
  cursor: geom.Vector
): number {
  let p1 = new geom.Vector();
  let p2 = new geom.Vector();
  let p3 = new geom.Vector();
  let p4 = new geom.Vector();
  let distance = Number.MAX_VALUE;

  let lines = range.lines;
  for (let k = 0; k + 3 < lines.length; k += 4) {
    p1.set(lines[k], lines[k + 1]);
    p2.set(lines[k + 2], lines[k + 3]);
    if (p1.transformPersp(transform) && p2.transformPersp(transform)) {
      let d = geom.pointSegmentDistance(cursor, p1, p2);
      if (d < distance) {
        distance = d;
      }
    }
  }

  let rects = range.rects;
  for (let k = 0; k + 3 < rects.length; k += 4) {
    let minx = rects[k];
    let miny = rects[k + 1];
    let maxx = rects[k + 2];
    let maxy = rects[k + 3];
    if (maxx - minx < geom.eps || maxy - miny < geom.eps) continue;
    p1.set(minx, miny);
    p2.set(maxx, miny);
    p3.set(maxx, maxy);
    p4.set(minx, maxy);
    if (
      p1.transformPersp(transform) &&
      p2.transformPersp(transform) &&
      p3.transformPersp(transform) &&
      p4.transformPersp(transform)
    ) {
      let d1 = geom.pointSegmentDistance(cursor, p1, p2);
      let d2 = geom.pointSegmentDistance(cursor, p2, p3);
      let d3 = geom.pointSegmentDistance(cursor, p3, p4);
      let d4 = geom.pointSegmentDistance(cursor, p4, p1);
      distance = Math.min(distance, d1, d2, d3, d4);

      let s1 = geom.lineEvalPoint(cursor, p1, p2) > 0;
      let s2 = geom.lineEvalPoint(cursor, p2, p3) > 0;
      let s3 = geom.lineEvalPoint(cursor, p3, p4) > 0;
      let s4 = geom.lineEvalPoint(cursor, p4, p1) > 0;
      if (s1 === s2 && s3 === s4 && s1 === s3) {
        distance = 0;
      }
    }
  }

  return distance;
}

export function findClosestElem(
  ranges: Array<ElementRange>,
  transform,
  cursor: geom.Vector,
  maxDistance: number,
  filter?: (elem: geom.Element) => boolean
): geom.Element {
  let result: geom.Element;
  let distance = maxDistance;
  for (let range of ranges) {
    if (!filter || filter(range.elem)) {
      let curDistance = rangeCursorDistance(range, transform, cursor);
      if (curDistance < distance) {
        result = range.elem;
        distance = curDistance;
      }
    }
  }
  return result;
}

export function findContourByPoint(contours: geom.Contour, point: geom.Vector) {
  for (let item of contours.items) {
    let contour = item.contour;
    if (contour && contour.isPointInside(point)) {
      return contour;
    }
  }
}

export function findEntityElement(
  entity: Entity,
  mouse: MouseInfo,
  filter?: (elem: geom.Element) => boolean,
  contours = false
) {
  if (entity && entity.renderLink && entity.renderLink.ranges) {
    let link = entity.renderLink;
    let matrix = mat4.fcopy(link.matrix);
    mat4.multiply(matrix, entity.ds.windowTransform, matrix);
    let pos = new geom.Vector(mouse.x, mouse.y);
    let el = findClosestElem(link.ranges, matrix, pos, 5, filter);
    if (!el && contours && entity.drawing && entity.drawing.contour) {
      el = findContourByPoint(entity.drawing.contour, pos);
    }
    return el;
  }
}
