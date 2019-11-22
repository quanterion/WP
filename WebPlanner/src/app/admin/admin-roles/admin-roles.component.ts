import { Component, OnInit, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AccountService } from 'app/shared';
import { concatMap, filter } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss']
})
export class AdminRolesComponent implements OnInit {

  constructor(private account: AccountService, private dialog: DialogService) { }

  changed = new BehaviorSubject(true);
  roles$ = this.changed.pipe(concatMap(_ => this.account.getRoles()));

  ngOnInit() {
  }

  canRemoveRole(name: string) {
    return ['admin', 'seller', 'store'].indexOf(name) < 0;
  }

  roleName = new FormControl('', [Validators.minLength(2)]);

  inputNewRole() {
    this.roleName.markAsTouched();
  }

  createNewRole() {
    if (this.roleName.valid) {
      this.roleName.markAsUntouched();
      this.account.createRole(this.roleName.value)
        .subscribe(_ => this.changed.next(true));
        this.roleName.setValue('');
    }
  }

  removeRole(role: string) {
    this.dialog.openConfirm({ message: `Удалить роль ${role}?`}).afterClosed().pipe(
      filter(v => v),
      concatMap(_ => this.account.removeRole(role))
    ).subscribe(_ => this.changed.next(true))
  }

}
