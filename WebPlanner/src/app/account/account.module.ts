import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from './account.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { PriceListsComponent } from 'app/shared/price-lists/price-lists.component';
import { AccountVerifyComponent } from './account-verify/account-verify.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthGuard } from 'app/guards';
import { AppDialogsModule } from 'app/dialogs/dialogs.module';

const routes: Routes = [
  {
    path: '', component: AccountComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { path: 'info', component: UserInfoComponent },
      { path: 'price-lists', component: PriceListsComponent },
    ]
  },
  { path: 'verify', component: AccountVerifyComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  { path: 'setpassword', component: SetPasswordComponent },
  { path: 'changepassword', component: ChangePasswordComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    AccountComponent,
    UserInfoComponent,
    AccountVerifyComponent,
    ResetPasswordComponent,
    SetPasswordComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AppDialogsModule
  ],
  entryComponents: [

  ]
})
export class AccountModule { }
