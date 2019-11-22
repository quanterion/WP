import { Component, OnInit } from '@angular/core';
import { CatalogService, Catalog, CatalogType } from "app/shared";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, combineLatest } from "rxjs";
import { mergeMap, filter } from 'rxjs/operators';
import { DialogService } from 'app/dialogs/services/dialog.service';

@Component({
  selector: 'app-nested-catalogs',
  templateUrl: './nested-catalogs.component.html',
  styleUrls: ['./nested-catalogs.component.scss']
})
export class NestedCatalogsComponent implements OnInit {

  catalogs: Observable<Catalog[]>;

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private dialogService: DialogService,
    private route: ActivatedRoute) {
    this.catalogs = combineLatest(route.params, this.route.parent.params)
      .pipe(mergeMap(params => catalogService.getNestedCatalogs(params[1]["id"])));
  }

  ngOnInit() {
  }

  addNewFragmentCatalog() {
    this.dialogService
      .openPrompt({
        message: "Enter the name of a new catalog",
        title: "New fragment catalog"
      })
      .afterClosed()
      .pipe(filter(n => n))
      .subscribe(name => {
        this.catalogService
          .addCatalog({
            name,
            type: CatalogType.Model,
            parentCatalogId: +this.route.parent.snapshot.params["id"]
          })
          .subscribe(c => {
            this.router.navigate(['/catalog', c.id]);
          });
      });
  }

}
