import {Entity, Designer, ModelGetValue } from "./designer";
import { Action } from './actions';
import { syncBundle } from './syncer';
import { EventEmitter } from '@angular/core';
import * as Long from 'long';
import * as protobuf from 'protobufjs/minimal';
import { environment } from 'environments/environment';

protobuf.util.Long = Long as any;
protobuf.configure();

import { pb } from './pb/scene';
import * as pako from 'pako';
import { BehaviorSubject } from 'rxjs';
import { loadDracoDecoder, decodeMesh } from "./draco";

export enum DesignerErrorType { None, Internal, Forbid, License, InvalidAction, Network, WebGL, WebGLLost };

export interface DesignerError {
  type: DesignerErrorType;
  info?: string;
}

export class BuilderDesigner extends Designer {
  lastSyncRevision = Long.fromInt(-1);
  undoOperationId: Long;
  undoName?: string;
  redoName: string;
  private ws: WebSocket;
  private wsTimeout?: number;

  private destroying = false;
  private wsOpened = false;
  private _waitingMessage;
  private _action: Action;
  private _defaultAction: () => Action;
  private _messageResultId = 0;
  private _messageCallbacks: { [id: number]: (data: any) => any } = {};
  protected builderServer: string;
  protected dracoModule: any;
  // messages waiting dracoModule to load
  private bundleQueue?: ArrayBuffer[];

  constructor(canvas?: HTMLCanvasElement) {
    super(canvas);
    this.selection.change.subscribe(() => {
      if (this.action) {
        this.action.onSelectionChanged();
      }
    });
    if (typeof window === 'object') {
      loadDracoDecoder().then(m => {
        this.dracoModule = m.module;
        if (this.bundleQueue) {
          let queue = this.bundleQueue;
          this.bundleQueue = undefined;
          for (let buf of queue) {
            this.applySyncData(buf);
          }
        }
      });
    }
  }

  destroy() {
    this.destroying = true;
    if (this.action) {
      this.action.finish();
    }
    this.disconnect();
    super.destroy();
  }

  disconnect() {
    if (this.wsTimeout) {
      window.clearTimeout(this.wsTimeout);
      this.wsTimeout = undefined;
    }
    if (this.ws) {
      this.wsOpened = false;
      this.ws.onerror = undefined;
      this.ws.onclose = undefined;
      this.ws.close();
      this.ws = undefined;
      this._messageCallbacks = {};
    }
  }

  private createWebSocket() {
    let ws = new WebSocket(this.builderServer);
    this.ws = ws;
    this.wsTimeout = window.setTimeout(() => {
      this.serverError.next({type: DesignerErrorType.Network});
      this.ws.close();
    }, 5000);
    ws.onopen = () => this.socketOpen();
    ws.onerror = () => {
      this.processing.next(false);
      this.serverError.next({ type: DesignerErrorType.Network });
    }
    ws.onmessage = message => this.socketMessage(message);
    ws.binaryType = 'arraybuffer';
    ws.onclose = () => {
      if (this.wsTimeout) {
        window.clearTimeout(this.wsTimeout);
        this.wsTimeout = undefined;
      }
      this.wsOpened = false;
      this.ws = undefined;
    };
  }

  private socketOpen() {
    window.clearTimeout(this.wsTimeout);
    this.wsOpened = true;
    // socket will be in opened state immediately after onopen
    setTimeout(_ => this.processWaitedMessages());
  }

  // virtual
  getAccessToken() {
    return '';
  }

  private processWaitedMessages() {
    if (!this._waitingMessage) {
      this._waitingMessage = {};
    }
    this.sendSocketMessage(this._waitingMessage);
  }

  sendSocketMessage(message, callback?: (data: any) => any) {
    if (!message.modelId) {
      message.modelId = this.modelId;
    }
    if (callback) {
      message.resultId = ++this._messageResultId;
      this._messageCallbacks[message.resultId] = callback;
    }
    if (this.wsOpened && this.ws.readyState >= WebSocket.CLOSING) {
      this.disconnect();
    }
    if (this.wsOpened) {
      this._waitingMessage = undefined;
      message.jwt = this.getAccessToken();
      this.ws.send(JSON.stringify(message));
    } else {
      this._waitingMessage = message;
      if (!this.ws) {
        this.createWebSocket();
      }
    }
  }

  // some request is currently processed server side
  processing = new BehaviorSubject<boolean>(false);
  // model changed either after server request processed or local client changes
  modelChange = new EventEmitter<string>();
  // model changed by applying diff from server
  serverSync = new EventEmitter();
  // any server error socket error, internal builder errors etc
  serverError = new EventEmitter<DesignerError>();
  private maxSyncErrors = 10;

  // stub
  loadCamera(data: string) {}

  public applySyncData(compressedData: ArrayBuffer) {
    let uncompressData = pako.inflate(new Uint8Array(compressedData, 4));
    let entityBundle = pb.Scene.decode(uncompressData);

    for (let entity of entityBundle.entity) {
      let geometry = entity.content && entity.content.geometry;
      if (geometry) {
        for (let grid of geometry.grid) {
          if (grid.draco && grid.draco.length > 0) {
            if (!this.dracoModule) {
              this.bundleQueue = this.bundleQueue || [];
              this.bundleQueue.push(compressedData);
              return;
            }
            decodeMesh(this.dracoModule, grid);
          }
        }
      }
    }

    if (!syncBundle(this, entityBundle)) {
      if (this.maxSyncErrors > 0) {
        this.maxSyncErrors--;
        console.error("Failed to sync model tree. Reloading...", entityBundle);
        this.root.delete();
        this.root = undefined;
        this.lastSyncRevision = Long.fromInt(-1);
        this.syncModel();
      }
    }
    if (!this.camera.assigned) {
      if (entityBundle.camera) {
        this.loadCamera(entityBundle.camera);
      } else {
        this.zoomToFit();
        if (entityBundle.revision) {
          this.camera.assigned = true;
        }
      }
    }
    this.lastSyncRevision = entityBundle.revision as Long;
    this.undoOperationId = entityBundle.operation as Long;
    if (this.lastSyncRevision && this.lastSyncRevision.compare(0) > 0) {
      this.undoName = entityBundle.undo;
      this.redoName = entityBundle.redo;
      if (entityBundle.entity.length > 0) {
        if (this._action) {
          this._action.onServerSync();
        }
        this.serverSync.emit();
      }
    }
  }

  private socketMessage(message: MessageEvent) {
    if (typeof message.data === 'string') {
      let data = JSON.parse(message.data);
      if (data.type === 'sync') {
        if (data.error) {
          this.serverError.next({
            type: DesignerErrorType.InvalidAction,
            info: data.error
          });
        }
        let resultId = data.resultId;
        if (data.changed) {
          this.modelChange.emit(data.type);
        }
        if (resultId) {
          let callback = this._messageCallbacks[resultId];
          if (callback) {
            this._messageCallbacks[resultId] = undefined;
            callback(data.result);
          }
        }
      } else if (data.type === 'externalchange') {
        this.syncModel().then(_ => this.modelChange.emit(data.type));
      } else if (data.type === 'externalreset') {
        this.lastSyncRevision = Long.fromInt(-1);
        this.syncModel().then(_ => this.modelChange.emit(data.type));
      } else if (data.type === 'error') {
        this.serverError.next(data.error || {type: DesignerErrorType.Internal});
      }
      if (environment.e2e && !this._waitingMessage) {
        this.disconnect();
      }
      this.processing.next(false);
    } else {
      if (!this.bundleQueue) {
        this.applySyncData(message.data);
      } else {
        this.bundleQueue.push(message.data);
      }
    }
  }

  get defaultAction() {
    return this._defaultAction;
  }

  set defaultAction(value: () => Action) {
    this._defaultAction = value;
    if (!this._action) {
      this.action = value();
    }
  }

  get action() {
    return this._action;
  }

  set action(value: Action) {
    if (this._action) {
      this._action.setFinishHandler(undefined);
      this._action.finish();
    }
    this._action = value;
    if (value) {
      value.setFinishHandler((action: Action) => {
        this.actionFinishHandler(action);
      });
    }
  }

  get activeAction() {
    let result = this._action;
    while (result && result.child) {
      result = result.child;
    }
    return result;
  }

  private actionFinishHandler(action: Action) {
    this._action = undefined;
    if (!this.destroying && this.defaultAction) {
      this.action = this.defaultAction();
    }
  }

  escape() {
    if (this.action) {
      this.activeAction.escape();
    }
  }

  execute(action, sync?: boolean) {
    this.processing.next(true);
    let result = new Promise<any>((resolve, reject) => {
      this.sendSocketMessage({
          action: action,
          revision: this.lastSyncRevision.toString() || -1,
          sync,
          rootId: this.rootId,
          token: this.fileToken
        }, resolve);
    });
    return result;
  }

  modelValueGetter(model: number, value: ModelGetValue, arg: any, uid?: Entity | string) {
    if (uid instanceof Entity) {
      uid = uid.uidStr;
    }
    return new Promise<any>((resolve, reject) => {
      this.sendSocketMessage({
          modelId: model.toString(),
          action: { type: 'get', value, arg, uid },
          sync: false,
          fastClose: true
        }, resolve);
    });
  }

  syncModel() {
    return this.execute({
      type: 'sync',
      revision: this.lastSyncRevision.toString() || -1
    });
  }

  undo() {
    return this.execute({ name: 'Undo', type: 'undo' });
  }

  redo() {
    return this.execute({ name: 'Redo', type: 'redo' });
  }

  loadModel(id: string, rootId?: string, token?: string) {
    this.rootId = rootId;
    this.fileToken = token;
    this.lastSyncRevision = Long.fromInt(-1);
    if (this.root) this.root.deleteChildren();
    this.modelId = id;
    this.camera.assigned = false;
    return this.syncModel();
  }
}
