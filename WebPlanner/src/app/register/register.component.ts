import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared';
import { Subscription } from "rxjs";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  authSub: Subscription;

  constructor(private auth: AuthService, private router: Router) {
    this.authSub = auth.isAuthenticated
      .pipe(filter(v => v))
      .subscribe(_ => this.router.navigate(['/projects']));
  }

  errorMessages: string[] = [];
  model = {
    userName: '',
    email: '',
    password: ''
  };
  errorMessage = '';
  success = false;
  admin = false;

  ngOnInit() {}

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  signup() {
    this.errorMessage = '';
    this.auth
      .register(this.model)
      .subscribe(v => this.signupCallback(v), error => this.handleError(error));
  }

  signupCallback(result: {admin: boolean}) {
    this.success = true;
    this.admin = result.admin;
  }

  private handleError(data: any) {
    this.errorMessage = JSON.stringify(data);
    if (data.errors && data.errors.length > 0) {
      let error = data.errors[0];
      if (error.code === 'DuplicateUserName') {
        this.errorMessage = `User name '${this.model
          .userName}' is already taken.`;
      } else if ((error.code === 'PasswordTooShort')) {
        this.errorMessage = 'Password must contain at least 6 characters.';
      } else if (error.code === 'InvalidUserName') {
        this.errorMessage = 'Invalid user name.';
      }
    }
  }
}
