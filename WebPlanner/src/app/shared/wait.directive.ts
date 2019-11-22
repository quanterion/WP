import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  Input,
  OnDestroy
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { MatProgressBar } from "@angular/material/progress-bar";
import { startWith } from "rxjs/operators";

@Directive({
  selector: "[wpWait]"
})
export class WaitDirective implements OnDestroy {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) { }

  private shown?: boolean;
  private sub?: Subscription;

  @Input() set wpWait(value: Observable<any> | undefined) {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    if (value) {
      this.sub = value.pipe(startWith(undefined))
        .subscribe(value => this.updateView(value));
    } else if (this.shown !== undefined) {
      // if nothing to wait than nothing should be shown
      this.shown = undefined;
      this.viewContainer.clear();
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private updateView(value: any) {
    if (value) {
      if (this.shown !== true) {
        if (this.shown !== undefined) {
          this.viewContainer.clear();
        }
        this.viewContainer.createEmbeddedView(this.templateRef, { wpWait: value });
        this.shown = true;
      }
    } else {
      if (this.shown !== false) {
        if (this.shown !== undefined) {
          this.viewContainer.clear();
        }
        let factory = this.resolver.resolveComponentFactory(MatProgressBar);
        this.viewContainer.createComponent(factory).instance.mode = 'indeterminate';
        this.shown = false;
      }
    }
  }
}
