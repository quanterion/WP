import { Component, OnInit, Input, EventEmitter, OnDestroy, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Entity } from 'modeler/designer';
import { WebDesigner } from 'modeler/webdesigner';
import { merge } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { EstimateService } from 'app/planner/estimate';

@Component({
  selector: 'app-model-tree',
  templateUrl: './model-tree.component.html',
  styleUrls: ['./model-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelTreeComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.stop$.next();
    this.stop$.complete();
  }

  treeControl: NestedTreeControl<Entity>;
  dataSource: MatTreeNestedDataSource<Entity>;
  stop$ = new EventEmitter();
  last: Entity;

  constructor(private hostElement: ElementRef) {
    this.treeControl = new NestedTreeControl<Entity>(this._getChildren);
    this.dataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
  }

  hasNestedChild = (_: number, e: Entity) => e.children && e.children.length > 0;

  private _getChildren = (e: Entity) => e.children;

  private _ds: WebDesigner;

  @Input()
  set ds(value: WebDesigner) {
    this.stop$.next();
    this._ds = value;
    if (value) {
      merge(value.selection.change, value.modelChange, value.serverSync).pipe(
        debounceTime(100),
        takeUntil(this.stop$)
      ).subscribe(v => {
        let last = v instanceof Entity ? v : undefined;
        this.updateData(last);
      });
      this.updateData();
    }
  }

  updateData(lastSelected?: Entity) {
    if (this._ds) {
      // workaround https://github.com/angular/material2/issues/11381
      this.dataSource.data = [];
      this.dataSource.data = this._ds.root.children;
      if (lastSelected && lastSelected.selected) {
        let parent = lastSelected.parent
        while (parent) {
          this.treeControl.expand(parent);
          parent = parent.parent;
        }
      }
      this.last = lastSelected;
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

  get ds() {
    return this._ds;
  }

  select(event: MouseEvent, e: Entity) {
    if (event.ctrlKey || event.shiftKey) {
      e.selected = true;
    } else {
      this.ds.selected = e;
    }
  }

  dblclick(e: Entity) {
    this.ds.selected = e;
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

  entityColor(e: Entity) {
    if (e.data.light) {
      return 'accent';
    }
    if (EstimateService.isPriceElement(e)) {
      return 'primary';
    }
  }

}
