import { Component, OnInit } from '@angular/core';
import { AuthService } from "app/shared";
import { Router } from "@angular/router";
import { SubscribeDialogComponent } from "../subscribe-dialog/subscribe-dialog.component";
import { DialogService } from 'app/dialogs/services/dialog.service';
import { LoginComponent } from 'app/login/login.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(public auth: AuthService, private router: Router, private dialog: DialogService) { }

  ngOnInit() {
  }

  getStarted() {
    if (this.auth.isAuthenticated.getValue()) {
      this.router.navigateByUrl('/projects');
    } else if (this.auth.settings.registrationEnabled) {
      this.router.navigateByUrl('/register');
    } else {
      this.dialog.open(LoginComponent);
    }
  }

  connectUs() {

  }

  subscribe() {
    this.dialog.open(SubscribeDialogComponent);
  }

}
