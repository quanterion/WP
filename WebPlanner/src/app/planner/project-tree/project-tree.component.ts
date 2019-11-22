import { Component, OnInit, Input, OnDestroy, EventEmitter, ElementRef } from '@angular/core';
import { WebDesigner } from 'modeler/webdesigner';
import { merge } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Entity } from 'modeler/designer';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { EstimateService } from '../estimate';
import { SelectionModel } from '@angular/cdk/collections';

interface TreeItem {
  name: string;
  price?: number;
  e: Entity;
  parent: TreeItem,
  children: TreeItem[];
}

@Component({
  selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss']
})
export class ProjectTreeComponent implements OnInit, OnDestroy {

  private _ds: WebDesigner;
  private _getChildren = (e: TreeItem) => e.children;

  treeControl = new NestedTreeControl<TreeItem>(this._getChildren);
  private expansionModel = new SelectionModel<string>(true);
  dataSource = new MatTreeNestedDataSource<TreeItem>();
  hasNestedChild = (_: number, item: TreeItem) => item.children.length > 0;
  stop$ = new EventEmitter();
  last?: TreeItem;

  constructor(private hostElement: ElementRef, private estimate: EstimateService) {
  }

  ngOnInit() {
  }

  @Input()
  set ds(value: WebDesigner) {
    this.stop$.next();
    this._ds = value;
    if (value) {
      merge(value.selection.change, value.modelChange, value.serverSync, this.estimate.computed$).pipe(
        debounceTime(100),
        takeUntil(this.stop$)
      ).subscribe(v => {
        let last = v instanceof Entity ? v : undefined;
        this.updateTree(last);
      });
    }
    this.updateTree();
  }

  get ds() {
    return this._ds;
  }

  ngOnDestroy() {
    this.stop$.next();
    this.stop$.complete();
  }

  updateTree(lastSelected?: Entity) {
    this.dataSource.data = [];
    this.last = undefined;
    if (this.ds && this.ds.root) {
      this.dataSource.data = this.findModels(this.ds.root);
      if (this.last && lastSelected && lastSelected.selected) {
        let parent = this.last.parent
        while (parent) {
          this.treeControl.expand(parent);
          parent = parent.parent;
        }
      }
      if (lastSelected) {
        setTimeout(() => {
          let host = this.hostElement.nativeElement as HTMLElement;
          let item = host.querySelector(`.selected.last`);
          if (item) {
            let itemRect = item.getBoundingClientRect();
            let hostRect = host.parentElement.getBoundingClientRect();
            if (itemRect.bottom < hostRect.top || itemRect.top > hostRect.bottom) {
              item.scrollIntoView();
            }
          }
        });
      }
    }
  }

  findModels(root: Entity, parent?: TreeItem, last?: Entity) {
    let result: TreeItem[] = [];
    root.forEach(e => {
      let data = e.data;
      let model = data.model && data.model.id;
      if (model || data.wall || data.room) {
        let name = e.name;
        if (!name) {
          if (data.wall) {
            name = 'Стена';
          } else if (data.room) {
            name = 'Комната';
          }
        }
        let item: TreeItem = {
          name, e, parent,
          children: this.findModels(e)
        };
        let priceElement = this.estimate.findElement(e);
        if (priceElement) {
          item.price = priceElement.price;
        }
        if (e === last) {
          this.last = item;
        }
        result.push(item);
        return false;
      }
    })
    return result;
  }

  isExpanded(item: TreeItem) {
    return this.expansionModel.isSelected(item.e.uidStr);
  }

  toggleItem(item: TreeItem) {
    this.expansionModel.toggle(item.e.uidStr);
  }

  select(event: MouseEvent, e: Entity) {
    if (event.ctrlKey || event.shiftKey) {
      e.selected = !e.selected;
    } else {
      this.ds.selected = e;
      this.ds.selection.pos = undefined;
    }
  }

  dblclick(e: Entity) {
    this.ds.selected = e;
    this.ds.selection.pos = e.box.center;
    this.ds.animateCamera();
    this.ds.zoomToFit(true);
  }

  entityIcon(e: Entity) {
    if (e.children && e.children.length > 0) {
      return 'collections';
    }
    if (e.data.light) {
      return 'wb_sunny';
    }
    if (e.meshes) {
      return 'domain';
    }
    return 'collections';
  }

}
