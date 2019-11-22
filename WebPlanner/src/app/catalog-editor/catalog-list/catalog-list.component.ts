import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { AuthService, CatalogService, Catalog, CatalogType, catalogSort } from '../../shared';
import { Subscription } from 'rxjs';
import { CatalogInfoComponent } from '../catalog-info/catalog-info.component';
import { concatMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-catalog-list',
  templateUrl: './catalog-list.component.html',
  styleUrls: ['./catalog-list.component.css']
})
export class CatalogListComponent implements OnInit {
  authSub: Subscription;

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private dialogService: DialogService,
    public auth: AuthService
  ) {
    this.authSub = auth.isAuthenticated.subscribe(_ => this.updateCatalogs());
  }

  catalogs$ = this.auth.isAuthenticated.pipe(
    concatMap(_ => this.catalogService.getAllCatalogs()),
    map(list => {
      return {
        my: list.filter(c => c.ownerId === this.auth.userId).sort(catalogSort),
        all: list.filter(c => c.ownerId !== this.auth.userId).sort(catalogSort)
      }
    })
  );

  private updateCatalogs() {
    this.catalogs$ = this.catalogs$.pipe(map(v => v));
  }

  ngOnInit() {}

  addNewCatalog() {
    this.dialogService
      .open(CatalogInfoComponent)
      .afterClosed()
      .subscribe((value: Catalog) => {
        if (value) {
          this.catalogService.addCatalog(value).subscribe(c => {
            this.router.navigate(['/catalog', c.id]);
          });
        }
      });
  }

  removeCatalog(event: MouseEvent, c: Catalog) {
    event.stopPropagation();
    event.preventDefault();

    this.dialogService
      .openConfirm({
        message: `Are you sure to remove catalog ${c.name}?`
      })
      .afterClosed()
      .subscribe(accept => {
        if (accept) {
          this.catalogService
            .removeCatalog(c.id)
            .subscribe(_ => this.updateCatalogs());
        }
      });
  }

  getCatalogLink(c: Catalog) {
    let result = ['/catalog', c.id];
    if (c.type === CatalogType.Material) {
      result.push('materials');
    }
    return result;
  }
}
