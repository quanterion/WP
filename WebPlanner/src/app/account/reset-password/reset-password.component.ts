import { Component, OnDestroy } from '@angular/core';
import { AuthService } from 'app/shared';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnDestroy {
  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {
  }

  email = new FormControl('', [Validators.required, Validators.email]);
  errorMessage = '';
  success = false;
  authSub = this.auth.isAuthenticated
  .pipe(filter(v => !!v))
  .subscribe(_ => this.router.navigate(['/projects']));

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  resetPassword() {
    this.errorMessage = '';
    this.email.disable();
    this.http
      .post<any>(`/api/account/resetpassword`, { email: this.email.value })
      .subscribe(
        r => this.handleResult(r),
        error => {
          if (error instanceof HttpErrorResponse) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = error.toString();
          }
        },
        () => this.email.enable()
      );
  }

  private handleResult(r) {
    if (r.ok) {
      this.success = true;
    } else {
      this.errorMessage = r.error;
      if (r.error === 'NotFound') {
        this.errorMessage = `Данный почтовый адрес не зарегистрирован`;
      }
    }
  }

}
