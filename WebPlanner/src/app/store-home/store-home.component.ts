import { Component, OnInit } from '@angular/core';
import { AuthService, UserInfo } from "../shared";
import { Router } from "@angular/router";

@Component({
  selector: 'app-store-home',
  templateUrl: './store-home.component.html',
  styleUrls: ['./store-home.component.scss']
})
export class StoreHomeComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit() {
  }

  loginAs(user: UserInfo) {
    this.auth
      .loginAs(user.id, true)
      .subscribe(_ => this.router.navigateByUrl('/projects'));
  }

  logout() {
    this.auth.logout(true);
    this.router.navigateByUrl('/');
  }

}
