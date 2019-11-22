import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, UserInfo, OrderService, AccountService } from 'app/shared';
import { Observable, BehaviorSubject } from 'rxjs';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FormGroup } from '@angular/forms';
import { of, combineLatest } from 'rxjs';
import { concatMap, map, filter, shareReplay } from 'rxjs/operators';
import { PricelistDetailComponent } from 'app/shared/pricelist-detail/pricelist-detail.component';

export interface UserData extends UserInfo {
  employeeList: MatTableDataSource<UserInfo>;
}

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})

export class AdminUserComponent implements OnInit {
  user$: Observable<UserData>;
  projectCount$: Observable<string>;
  error: string;
  succeeded = false;
  selectedIndex: number;

  displayedColumns = ['login', 'fullName', 'email'];

  constructor(
    public auth: AuthService,
    private account: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: DialogService,
    private firm: OrderService,
  ) {

  }

  rolesChanged = new BehaviorSubject(true);
  roles$ = this.rolesChanged.pipe(concatMap(_ => this.account.getRoles()));

  @ViewChild('sellersTable', { static: false }) sellersTable?: MatTable<UserInfo>;

  @ViewChild(MatSort, { static: false }) set sellersSort(ms: MatSort) {
    if (ms && this.sellersTable && this.sellersTable.dataSource instanceof MatTableDataSource) {
      this.sellersTable.dataSource.sort = ms;
    }
  }

  updateUser() {
    let userInfo$ = this.route.params.pipe(
      concatMap(params => {
        let userId = params.userId;
        if (userId === 'new') {
          let newUser: UserInfo = {
            id: -1,
            name: '',
            fullName: '',
            email: '',
            emailConfirmed: false,
            admin: false,
            roles: [],
            externalId: '',
            employees: []
          };
          return of(newUser);
        }
        return this.account.getUser(userId);
      }),
      map(user => {
        let employeeList = new MatTableDataSource(user.employees);
        let data: UserData = {...user, employeeList};
        return data;
      })
    );
    this.user$ = combineLatest(userInfo$, this.route.queryParamMap).pipe(
      map(([user, query]) => {
        user.parentUserId = Number(query.get('parentUserId') || user.parentUserId);
        return user;
      }),
      map(user => {
        user.admin = !!user.roles.find(r => r === 'admin');
        return user;
      }),
      shareReplay()
    );
    this.projectCount$ = this.user$.pipe(
      concatMap(user => user.id > 0 ? this.firm.getUserOrders(user.id, 100) : of(undefined)),
      map(list => list ? (list.length > 99 ? '99+' : list.length.toString()) : undefined)
    );
  }

  ngOnInit() {
    this.updateUser();
  }

  loginAs(user: UserInfo) {
    this.auth
      .loginAs(user.id, false, true)
      .subscribe(_ => this.router.navigateByUrl('/'));
  }

  unlock(user: UserInfo) {
    this.account.unlock(user).subscribe(_ => {
      this.updateUser();
      this.snackBar.open('Пользователь успешно разблокирован');
    });
  }

  verifyEmail(user: UserInfo) {
    let fail = (code?) => {
      this.snackBar.open('Failed to verify email. ' + code);
    }
    this.account.verifyEmail(user.id)
      .subscribe(
        result => {
          if (result.succeeded) {
            this.snackBar.open('User successfully verified');
          } else {
            let code = '';
            if (result.errors && result.errors.length) {
              let error = result.errors[0];
              code = error.code;
            }
            fail(code);
          }
        },
        _ => fail()
      );
  }

  removeUser(user: UserInfo) {
    this.dialog
      .openConfirm({
        message: `Delete user and its data?`
      })
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.account.removeUser(user))
      ).subscribe(
        _ => {
          if (user.parentUserId) {
            this.updateUser();
          } else {
            this.router.navigateByUrl('/admin/users');
          }
          this.snackBar.open('User successfully removed');
        },
        _ => this.snackBar.open('Failed to remove user')
      );
  }

  changeNameUser(user: UserInfo) {
    this.dialog
      .openPrompt({
        message: `Enter new User name`
      })
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(firmName => {
        this.account.updateUser({ id: user.id, name: firmName })
          .subscribe(
            _ => this.updateUser(),
            _ => this.snackBar.open('Failed to update user information')
          );
      });
  }

  changePassword(user: UserInfo) {
    this.dialog
      .openPrompt({ message: `Enter new password` })
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(password => {
        this.account.updateUser({ id: user.id, password })
          .subscribe(
            _ => this.snackBar.open('User successfully changed!'),
            _ => this.snackBar.open('Failed to update user information')
          );
      });
  }


  saveUser(user: UserInfo, form: FormGroup) {
    if (form.valid) {
      let info = {
        username: user.name,
        parentUserId: user.parentUserId,
        ...form.value
      };
      // do not send empty string password
      if (!info.password) {
        info.password = undefined;
      }
      this.account.updateUser(info)
        .subscribe(
          _ => {
            if (user.id > 0) {
              this.snackBar.open('All user information successfully updated!');
            } else {
              this.snackBar.open('New user successfully created!');
              if (info.parentUserId) {
                this.router.navigate(['/admin', 'user', info.parentUserId]);
              } else {
                this.router.navigate(['/admin', 'users']);
              }
            }
            form.reset(form.value);
          },
          _ => this.snackBar.open('Failed to update user information')
        );
    }
  }

  goToUser(id: number) {
    if (id > 0) {
      this.router.navigate(['/admin', 'user', id]);
    } else {
      this.router.navigate(['/admin', 'user', "new"]);
    }
  }

  newSeller(parentUserId) {
    this.router.navigate(['/admin', 'user', "new"], { queryParams: { parentUserId } });
  }

  openPriceList(id: number): void {
    this.dialog.open(PricelistDetailComponent, {
      data: { id: id, name: name }
    });
  }

  superAdmin() {
    return this.auth.roles.includes('superadmin');
  }
}
