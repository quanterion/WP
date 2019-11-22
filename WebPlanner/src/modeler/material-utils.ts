import { Entity } from './designer';

export function materialPointer(catalog: number, name: string, check = false) {
  if (check && name.indexOf('\n') > 0) {
    return name;
  }
  return `${catalog}\n${name}`;
}

export class MaterialMapper {
  private maps: { [material: string]: string }[] = [];

  constructor(e?: Entity) {
    if (e) {
      let parents = [];
      while (e) {
        parents.push(e);
        e = e.parent;
      }
      for (let i = parents.length - 1; i >= 0; --i) {
        this.push(parents[i]);
      }
    }
  }

  push(e: Entity) {
    if (e.materialMap) {
      this.maps.push(e.materialMap);
    }
  }

  pop(e: Entity) {
    if (e.materialMap) {
      this.maps.length -= 1;
    }
  }

  map(material: string): string {
    for (let i = this.maps.length - 1; i >= 0; --i) {
      let replacement = this.maps[i][material];
      if (replacement) {
        return replacement;
      }
    }
    return material;
  }

  forEach(root: Entity, fun: (e: Entity) => any) {
    if (root.children) {
      for (let child of root.children) {
        if (fun(child) !== false) {
          this.push(child);
          child.forEach(fun);
          this.pop(child);
        }
      }
    }
  }

  forAll(root: Entity, fun: (e: Entity) => any) {
    if (fun(root) !== false) {
      this.forEach(root, fun);
    }
  }
}

export function isMaterialUsed(e: Entity, material: string, mapper: MaterialMapper) {
  let yes = false;
  if (e.meshes) {
    yes = e.meshes.some(m => mapper.map(m.material) === material);
  }
  if (!yes && e.advMaterials) {
    let advMaterials = e.advMaterials.split('\n');
    yes = advMaterials.some(m => mapper.map(m) === material);
  }
  return yes;
}

export function findUsedMaterialPointers(e: Entity) {
  let materials = new Map<number, Set<string>>();

  let addMaterial = (name: string, catalog: number) => {
    let set = materials.get(catalog);
    if (!set) {
      set = new Set<string>();
      materials.set(catalog, set);
    }
    set.add(name);
  }

  let add = (e: Entity, catalog: number, mapper: MaterialMapper) => {
    mapper.push(e);
    catalog = e.catalog || catalog;
    if (e.meshes) {
      e.meshes.forEach(m => addMaterial(mapper.map(m.material), catalog));
    }
    if (e.advMaterials) {
      let advMaterials = e.advMaterials.split('\n');
      advMaterials.some(m => addMaterial(mapper.map(m), catalog));
    }
    if (e.children) {
      e.children.forEach(c => add(c, catalog, mapper));
    }
    mapper.pop(e);
  };
  add(e, 0, new MaterialMapper(e));
  let result: string[] = [];
  for (let pair of materials) {
    let items = Array.from(pair[1].values()).map(m => materialPointer(pair[0], m));
    result.push(...items);
  }
  return result;
}
