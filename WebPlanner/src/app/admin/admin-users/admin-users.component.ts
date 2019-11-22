import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserInfo, AuthService, AccountService } from 'app/shared';
import { filter, concatMap, startWith, map } from 'rxjs/operators';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

export enum UserTypeFilter {
  All,
  Registred,
  Imported,
  Stores,
  Sellers,
  Locked
}

export interface UserViewData extends UserInfo {
  shopName?: string;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})

export class AdminUsersComponent implements OnInit {
  displayedColumns = ['select', 'name', 'fullName', 'date', 'email'];
  advColumn = new BehaviorSubject<string | undefined>(undefined);
  userType = new FormControl(UserTypeFilter.All);
  usersUpdate$: Observable<boolean>;
  userList = new MatTableDataSource<UserViewData>([]);
  selection = new SelectionModel<UserViewData>(true);
  UserTypeFilter = UserTypeFilter;

  displayedColumns$ = this.advColumn.pipe(
    map(c => [...this.displayedColumns, ...(c ? [c] : []) ])
  );

  constructor(
    public auth: AuthService,
    private account: AccountService,
    private router: Router,
    private dialog: DialogService,
    private snackBar: MatSnackBar) {
  }

  @ViewChild('sortForDataSource', { static: true }) sortForDataSource: MatSort;
  roles$ = this.account.getRoles();

  ngOnInit() {
    this.userList.sort = this.sortForDataSource;
    this.updateUsers();
  }

  private updateUsers() {
    this.selection.clear();
    let userType$ = this.userType.valueChanges as Observable<UserTypeFilter>;
    let users$: Observable<UserViewData[]> = this.advColumn.pipe(
      concatMap(column => this.account.getAllUsers(column)),
      map(list => {
        let shops = new Map<number, UserInfo>();
        for (let u of list) {
          if (u.roles.includes('seller')) {
            shops.set(u.id, u);
          }
        }
        return list.map(user => {
          let shopName: string;
          if (user.parentUserId) {
            let shop = shops.get(user.parentUserId);
            if (shop) {
              shopName = shop.fullName;
            }
          }
          return {...user, shopName};
        })
      })
    );
    this.usersUpdate$ = combineLatest(
      users$,
      userType$.pipe(startWith(this.userType.value as UserTypeFilter | string)),
    ).pipe(
      map(([data, type]) => {
        this.selection.clear();
        let list = data.filter(u => {
          switch (type) {
            case UserTypeFilter.Registred: return !u.externalId;
            case UserTypeFilter.Imported: return !!u.externalId;
            case UserTypeFilter.Stores: return u.roles.includes('store');
            case UserTypeFilter.Sellers: return u.roles.includes('seller');
            case UserTypeFilter.Locked: return u.disabled;
          }
          if (typeof type === 'string') {
            return u.roles.includes(type);
          }
          return true;
        });
        this.userList.data = list;
        return true;
      })
    );
  }

  goToUser(id: number) {
    if (id > 0) {
      this.router.navigate(['/admin', 'user', id]);
    } else {
      this.router.navigate(['/admin', 'user', "new"]);
    }
  }

  removeUsers(users: UserInfo[]) {
    let changes = users.map(u => ({ id: u.id, remove: true }));
    this.dialog.openConfirm({ message: `Вы действительно хотите удалить ВСЕ данные ${changes.length} пользователей?` })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.account.updateUsers(changes))
      ).subscribe(_ => {
        this.updateUsers();
        this.snackBar.open('Выбранные пользователи успешно удалены');
      });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userList.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.userList.filteredData.forEach(row => this.selection.select(row));
  }
}
