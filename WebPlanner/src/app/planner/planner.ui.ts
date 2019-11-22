import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { DialogService } from "app/dialogs/services/dialog.service";
import { Component, Input } from '@angular/core';
import { MatSnackBar } from "@angular/material";
import { HttpClient } from "@angular/common/http";

export class UIButton {
  constructor (public text: string) {}
  icon: string;
  tooltip: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled = false;
  class: string;
  click: () => void | Promise<any>;
}

export class UICollection {
  items: UIButton[] = [];

  add(text: string) {
    let button = new UIButton(text);
    this.items.push(button);
    return button;
  }

  addIcon(icon: string) {
    let button = new UIButton('');
    button.icon = icon;
    this.items.push(button);
    return button;
  }

  remove(button: UIButton) {
    this.items = this.items.filter(b => b !== button);
  }
}

export class PlannerUI {
  constructor(
    public _dialog: DialogService,
    private _matIconRegistry: MatIconRegistry,
    private _sanitizer: DomSanitizer) {}

  toolbar = new UICollection();
  menu = new UICollection();
  popup = new UICollection();

  alert(message: string) {
    this._dialog.openAlert({ message });
  }

  snack(message: string, duration?: number)  {
    if (duration) {
      this._dialog.snackBar.open(message, undefined, { duration: duration * 1000 });
    } else {
      this._dialog.snackBar.open(message);
    }
  }

  addSvgIconSet(url: string) {
    this._matIconRegistry.addSvgIconSet(
      this._sanitizer.bypassSecurityTrustResourceUrl(url)
    );
  }

  addSvgIcon(name: string, html?: string) {
    if (!html) {
      html = name;
      name = Math.random().toString();
    }
    this._matIconRegistry.addSvgIconLiteral(name,
      this._sanitizer.bypassSecurityTrustHtml(html)
    );
    return name;
  }
}

@Component({
  selector: 'app-ui-collection',
  template: `
    <ng-container *ngFor="let item of collection.items">
      <button *ngIf="menu" mat-menu-item (click)="click(item)">
        <mat-icon *ngIf="item.icon" [svgIcon]="item.icon"></mat-icon>
        <span>{{item.text}}</span>
      </button>
      <ng-container *ngIf="!menu">
        <button *ngIf="!item.text" mat-icon-button (click)="click(item)"
            [color]="item.color" [matTooltip]="item.tooltip" [disabled]="item.disabled" class="item.class">
          <mat-icon [svgIcon]="item.icon"></mat-icon>
        </button>
        <button *ngIf="item.color && item.text" mat-raised-button (click)="click(item)"
            [color]="item.color" [matTooltip]="item.tooltip" [disabled]="item.disabled" class="item.class">
          <mat-icon *ngIf="item.icon" [svgIcon]="item.icon"></mat-icon>
          <span>{{item.text}}</span>
        </button>
        <button *ngIf="!item.color && item.text" mat-button (click)="click(item)"
            [matTooltip]="item.tooltip" [disabled]="item.disabled" class="item.class">
          <mat-icon *ngIf="item.icon" [svgIcon]="item.icon"></mat-icon>
          <span>{{item.text}}</span>
        </button>
      </ng-container>
    </ng-container>
    <hr *ngIf="menu && collection.items.length">
  `,
  styles: [`
    button[mat-raised-button] {
      margin-left: 4px;
      margin-right: 4px;
    }`]
})
export class UICollectionComponent {
  @Input() collection: UICollection;
  @Input() menu = false;

  constructor(private snack: MatSnackBar) {}

  async click(item: UIButton) {
    try {
      let result = item.click();
      if (result && result.then) {
        await result;
      }
    } catch (error) {
      console.error(error);
      this.snack.open(error.toString());
    }
  }
}

export class HttpWrapper {
  constructor(private _http: HttpClient) {}

  get(url: string, options?: any) {
    return this._http.get(url, options).toPromise();
  }

  post(url: string, body: any, options?: any) {
    const proxyPrefix = 'proxy://';
    if (url.startsWith(proxyPrefix)) {
      let proxyBody = { url: url.substr(proxyPrefix.length), body };
      return this._http.post('/api/system/proxy', proxyBody).toPromise();
    }
    return this._http.post(url, body, options).toPromise();
  }

  delete(url: string, options?: any) {
    return this._http.delete(url, options).toPromise();
  }
}
