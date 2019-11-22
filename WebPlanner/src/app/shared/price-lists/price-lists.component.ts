import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, Input } from '@angular/core';
import { AuthService } from 'app/shared';
import { Observable, concat, of } from 'rxjs';
import { OrderService } from 'app/shared/order.service';
import { PricelistDetailComponent } from '../pricelist-detail/pricelist-detail.component';
import { PriceListInfo, PriceList } from '../../planner/estimate';
import { combineLatest } from 'rxjs';
import { map, filter, concatMap, toArray } from 'rxjs/operators';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TdFileUploadComponent } from '../file/file-upload/file-upload.component';

export interface PriceListsInfo {
  list: PriceListInfo[];
  active: PriceList;
  activeId: number;
}

@Component({
  selector: 'app-price-lists',
  templateUrl: './price-lists.component.html',
  styleUrls: ['./price-lists.component.scss']
})

export class PriceListsComponent implements OnInit, OnDestroy {
  private destroy = new EventEmitter<void>();
  info$: Observable<PriceListsInfo>;
  selection = new SelectionModel<PriceListInfo>(true);
  @ViewChild(TdFileUploadComponent, { static: false }) fileUpload: TdFileUploadComponent;
  displayedColumns = ['select', 'id', 'name', 'date', 'recordCount'];
  id: string;
  systemPrices$: Observable<PriceListInfo[]>;

  constructor(private firm: OrderService, public auth: AuthService,
    private dialog: DialogService) {
      this.systemPrices$ = firm.getPrices(0);
  }

  private _userId?: number;
  @Input() set userId(value: number | undefined) {
    this._userId = value;
    if (this.info$) {
      this.updateInfo();
    }
  }

  get userId() {
    if (this._userId === undefined) {
      return this.auth.userId;
    }
    return this._userId;
  }

  ngOnInit() {
    this.updateInfo();
  }

  updateInfo() {
    let active$ = this.userId >= 0 ? this.firm.getActivePrice(false, this.userId) : of(undefined as PriceList);
    let userId = this.userId === undefined ? this.auth.userId : this.userId;
    this.info$ = combineLatest(this.firm.getPrices(userId), active$)
      .pipe(map(result => {
        this.selection.clear();
        let active = result[1];
        return {list: result[0], active, activeId: active ? active.id : -1};
      }));
  }

  canCreate() {
    return this.userId >= 0 || this.userId === undefined;
  }

  openDialog(id: number, name: string): void {
    this.dialog.open(PricelistDetailComponent, {
      data: { id, name }
    }).afterClosed().subscribe(_ => this.updateInfo());
  }

  ngOnDestroy() {
    this.destroy.complete();
  }

  addPriceList() {
    this.dialog.open(PricelistDetailComponent, { data: this.userId })
      .afterClosed()
      .subscribe(_ => this.updateInfo());
  }

  deletePrice(event: MouseEvent, p: PriceListInfo) {
    event.stopPropagation();
    this.dialog.openConfirm({message: 'Удалить прайс-лист?'})
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.firm.removePrice(p.id))
      ).subscribe(_ => this.updateInfo());
  }

  deletePrices(prices: PriceListInfo[]) {
    this.dialog.openConfirm({message: 'Удалить выбранные прайс-листы?'})
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => concat(...prices.map(p => this.firm.removePrice(p.id))).pipe(toArray()))
      ).subscribe(_ => this.updateInfo());
  }

  activatePrice(p: PriceListInfo, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.dialog.openConfirm({message: 'Активировать прайс-лист?'})
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.firm.setActivePrice(p, this.userId))
      ).subscribe(_ => this.updateInfo());
  }

  isAllSelected(info: PriceListsInfo) {
    const numSelected = this.selection.selected.length;
    const numRows = info.list.length;
    return numSelected === numRows;
  }

  masterToggle(info: PriceListsInfo) {
    this.isAllSelected(info) ?
        this.selection.clear() :
        info.list.forEach(row => this.selection.select(row));
  }
}
