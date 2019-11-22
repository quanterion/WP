import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseComponent } from './browse.component';
import { FilesComponent } from './files.component';
import { LoginComponent } from './login.component';
import { AuthComponent } from './auth.component';
import { ModelComponent } from './model.component';
import { AuthGuard } from 'app/guards';
import { AccountPageComponent } from './account-page/account-page.component';

const routes: Routes = [
  { path: 'browse', component: BrowseComponent },
  { path: 'files', component: FilesComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'auth', component: AuthComponent},
  { path: '', redirectTo: '/browse', pathMatch: 'full' },
  { path: 'model/:id', component: ModelComponent},
  { path: 'account', component: AccountPageComponent, canActivate: [AuthGuard] }

];

@NgModule({
  exports: [RouterModule],
  imports: [ RouterModule.forRoot(routes) ]
})
export class ViewerRoutingModule { }
