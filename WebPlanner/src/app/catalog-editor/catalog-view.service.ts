import { Injectable, EventEmitter } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs";
import { combineLatest } from "rxjs";
import { distinctUntilChanged, switchMap, concatMap,
  filter, tap, shareReplay, take, map } from "rxjs/operators";
import { Catalog, CatalogService, AuthService, OrderService } from "../shared";
import { ActivatedRoute } from "@angular/router";
import { PriceListInfo, PriceList } from "../planner/estimate";

export interface SearchQuery {
  catalog: number;
  term: string;
}

export interface SearchResult {
  files: any[];
  materials: any[];
  properties: any[];
}

@Injectable()
export class CatalogViewService {
  private editable = false;
  catalog: Observable<Catalog>;
  priceLists: Observable<PriceListInfo[]>;
  activePriceListId = 0;
  activePriceList = new BehaviorSubject<PriceList>(undefined);

  constructor(private catalogs: CatalogService, route: ActivatedRoute,
      private firm: OrderService, auth: AuthService) {
    this.catalog = combineLatest(route.params, auth.isAuthenticated, this.catalogChange).pipe(
      concatMap(params => catalogs.getCatalog(params[0]['id'])),
      map(c => {
        if (this.editable) {
          c.readOnly = false;
        }
        return c;
      }),
      shareReplay(1),
    );
    this.priceLists = combineLatest(auth.isAuthenticated, this.activePriceList).pipe(
      filter(v => v[0]),
      concatMap(_ => firm.getPrices(auth.admin ? -1 : auth.userId))
    );
    this.search$.pipe(
      distinctUntilChanged(),
      switchMap(query => this.catalogs.searchCatalog(query))
    ).subscribe(value => this.result.next(value));
  }

  private search$ = new EventEmitter<SearchQuery | undefined>();
  private catalogChange = new BehaviorSubject(undefined);

  edit(data: Catalog) {
    this.catalog.pipe(
      take(1),
      concatMap(c => this.catalogs.editCatalog(c.id, data)),
      tap(_ => this.updateCatalog())
    ).subscribe();
  }

  startEdit() {
    this.editable = true;
    this.updateCatalog();
  }

  updateCatalog() {
    this.catalogChange.next(undefined);
  }

  uploadThumbnail(preview: File) {
    this.catalog.pipe(
      take(1),
      concatMap(c => this.catalogs.updateThumbnail(c.id, preview)),
      tap(_ => this.updateCatalog())
    ).subscribe();
  }

  removeThumbnail() {
    this.catalog.pipe(
      take(1),
      concatMap(c => this.catalogs.removeThumbnail(c.id)),
      tap(_ => this.updateCatalog())
    ).subscribe();
  }

  search(term: string) {
    if (term) {
        this.catalog.subscribe(c => this.search$.next({ catalog: c.id, term }));
    } else {
        this.clear();
    }
  }

  clear() {
    this.search$.next(undefined);
  }

  result = new BehaviorSubject<SearchResult>(undefined);

  activatePriceList(price: PriceListInfo) {
    this.firm.getPrice(price.id).subscribe(value => {
      this.activePriceListId = value.id;
      this.activePriceList.next(value)
    });
  }
}
