import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared';
import { FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = new FormControl('', [Validators.email]);
  token = new FormControl('', [Validators.required]);
  authInProgress = false;
  loginInProgress = false;
  testToken: string;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.token.disable();
  }

  login() {
    if (this.email.valid) {
      this.email.disable();
      this.authInProgress = true;
      this.auth.requestEmailToken(this.email.value).pipe(
        finalize(() => this.authInProgress = false)
      ).subscribe(
        result => {
          this.testToken = result.token;
          this.token.enable();
        },
        _ => {
          this.email.setErrors({ serverError: true })
          this.email.enable();
        }
      );
    }
  }

  loginWithToken(email: string, token: string) {
    this.loginInProgress = true;
    this.auth.emailLogin(email, token).pipe(
      finalize(() => this.loginInProgress = false)
    ).subscribe(
      _ => this.router.navigate(['/files']),
      _ => {
        this.token.setErrors({ invalid: true })
      }
    );
  }

  changeEmail() {
    this.email.enable();
    this.token.disable();
  }
}
