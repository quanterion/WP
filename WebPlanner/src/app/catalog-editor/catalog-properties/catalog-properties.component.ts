import { Input, Component, OnInit, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  AuthService,
  CatalogService,
  CatalogProperty
} from "../../shared";
import { MatTableDataSource } from "@angular/material/table";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { DialogService } from "app/dialogs/services/dialog.service";

@Component({
  selector: "app-catalog-properties",
  templateUrl: "./catalog-properties.component.html",
  styleUrls: ["./catalog-properties.component.css"]
})
export class CatalogPropertiesComponent implements OnInit {
  private _catalogId: number;
  properties = new MatTableDataSource<CatalogProperty>([]);
  displayedColumns = ["name"];
  editedProperty: any;
  private propertiesUpdated = new EventEmitter();

  constructor(
    private catalogService: CatalogService,
    authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
    route: ActivatedRoute
  ) {
    this.catalogId = route.snapshot.parent.params["id"];
    combineLatest(route.queryParams, this.propertiesUpdated, authService.isAuthenticated)
      .pipe(map(p => Number(p[0]["pid"])))
      .subscribe(
        pid => this.editedProperty = this.properties.data.find(p => p.id === pid)
      );
  }

  ngOnInit() {}

  @Input()
  set catalogId(value: number) {
    this._catalogId = value;
    this._updateProperties();
  }

  get catalogId() {
    return this._catalogId;
  }

  private _updateProperties() {
    if (this._catalogId) {
      this.catalogService
        .getCatalogProperties(this._catalogId)
        .subscribe(list => {
          this.properties.data = list;
          this.propertiesUpdated.next();
        });
    }
  }

  addNewProperty() {
    this.dialogService
      .openPrompt({
        message: "Enter the name of a new property",
        title: "New property"
      })
      .afterClosed()
      .subscribe((newValue: string) => {
        if (newValue) {
          this.catalogService
            .addProperty(this.catalogId, newValue)
            .subscribe(p => {
              this._updateProperties();
              this.router.navigate([], { queryParams: { pid: p.id } });
            });
        }
      });
  }

  selectProperty(property: CatalogProperty) {
    this.router.navigate([], { queryParams: { pid: property.id } });
  }

  removeProperty(p: CatalogProperty) {
    this.dialogService
      .openConfirm({
        message: `Are you sure to remove property ${p.name}?`
      })
      .afterClosed()
      .subscribe(accept => {
        if (accept) {
          this.catalogService
            .removeProperty(this.catalogId, p.id)
            .subscribe(_ => this._updateProperties());
        }
      });
  }
}
