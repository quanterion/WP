import { Entity, Designer, Mesh } from './designer';
import { pb } from './pb/scene';
import * as Long from 'long';
import { NumberMakr } from './render/number-makr';
import { Box } from './geometry';

interface UniqueElement {
  uid: Long;
}

class MoveMap {
  private _items: { [key: string]: Entity } = {};

  constructor(private _ds: Designer) {}

  remove(e: Entity) {
    if (e.uid) {
      e.parent = undefined;
      this._items[e.uid.toString()] = e;
    } else {
      e.delete();
    }
  }

  extract(uid: string): Entity {
    let e = this._items[uid];
    if (e) {
      delete this._items[uid];
    }
    return e;
  }

  create(uid: Long): Entity {
    // we should extract entity to avoid deleting it later
    let uidStr = uid.toString();
    let e = this.extract(uidStr);
    if (!e) {
      e = this._ds.entityMap[uidStr];
    }
    if (!e) {
      e = new Entity(this._ds);
      e.uid = uid;
    }
    return e;
  }

  public clear() {
    let items = this._items;
    this._items = {};
    for (let e in items) {
      items[e].delete();
    }
  }
}

function indexOfElement(uid: Long, items: UniqueElement[]) {
  if (items) {
    for (let i = 0; i < items.length; i++)
      if (items[i].uid.equals(uid)) return i;
  }
}

function indexOfUid(uid: Long, items: Long[]) {
  if (items) {
    for (let i = 0; i < items.length; i++) if (items[i].equals(uid)) return i;
  }
  return -1;
}

function syncEntity(ds: Designer, message: pb.IEntity, map: MoveMap) {
  let entity = ds.entityMap[message.uid.toString()];
  if (!entity) {
    return false;
  }
  if (message.syncChildren) {
    let destArr = entity.children;
    let srcArr = message.child as Long[];
    let oneRemoved = undefined;
    let oneAdded = undefined;
    if (destArr) {
      // remove missing items
      for (let i = destArr.length - 1; i >= 0; i--) {
        let item = destArr[i];
        let srcIndex = indexOfUid(item.uid, srcArr);
        if (srcIndex < 0) {
          map.remove(item);
          oneRemoved = oneRemoved === undefined ? item : null;
        }
      }
    } else {
      destArr = [];
      entity.children = destArr;
    }
    for (let i = 0; i < srcArr.length; i++) {
      let source = srcArr[i] as Long;
      let index = indexOfElement(source, destArr);
      if (index === undefined) {
        let newEntity = map.create(source);
        newEntity.parent = entity;
        oneAdded = oneAdded === undefined ? newEntity : null;
      } else {
        let newEntity = destArr[index];
        // swap elems to save the order
        if (index !== i) {
          if (i < destArr.length) {
            destArr[index] = destArr[i];
            destArr[i] = newEntity;
          } else {
            console.error('duplicate entity uids', message);
            break;
          }
        }
      }
    }
    if (oneRemoved && oneRemoved.selected && oneAdded) {
      oneAdded.selected = true;
    }
  }
  if (message.content) {
    entity.applyContent(message.content);
  }
  return true;
}

export function syncBundle(ds: Designer, bundle: pb.Scene) {
  if (!ds.root || !ds.root.uid.equals(bundle.rootUid as Long)) {
    if (ds.root) {
      ds.root.delete();
    }
    ds.root = new Entity(ds);
    ds.root.uid = bundle.rootUid as Long;
  }

  let entities = bundle.entity;
  let map = new MoveMap(ds);
  let ok = true;
  for (let k = 0; k < entities.length; k++) {
    if (!syncEntity(ds, entities[k], map)) {
      ok = false;
      break;
    }
  }
  map.clear();
  return ok;
}

function base64stringToUint8Array(data: string) {
  let raw = window.atob(data);
  let rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

export function loadModelInsertInfo(data: string) {
  let dataArray = base64stringToUint8Array(data);
  return pb.ModelInsertInfo.decode(dataArray);
}

export function createReplica(ds: Designer, data: string) {
  let dataArray = base64stringToUint8Array(data);
  let info = pb.ModelInsertInfo.decode(dataArray);
  let result = new Entity(ds);
  result.contentBox = new Box();
  result.contentBox.set(info.box);
  if (info.type) {
    result.type = info.type;
  }
  if (info.flags) {
    if (info.flags & 7) {
      result.elastic = {
        box: result.contentBox.copy(),
        x: !!(info.flags & 1),
        y: !!(info.flags & 2),
        z: !!(info.flags & 4),
        container: !!(info.flags & 8),
        position: (info.flags >> 4) & 15,
        params: []
      }
    }
    let mountType = (info.flags >> 8) & 15;
    if (mountType) {
      result.data.mountType = mountType;
    }
  }
  let random = new NumberMakr();
  result.uid = Long.fromValue({
    low: random.randomInt32(),
    high: random.randomInt31(),
    unsigned: true
  });
  let mesh = new Mesh();
  mesh.catalog = -1;
  mesh.material = '#B3D3DD';
  mesh.createBox(result.contentBox);
  result.meshes = [mesh];
  result.parent = ds.root;
  return result;
}
