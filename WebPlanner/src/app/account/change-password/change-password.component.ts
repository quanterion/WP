import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  oldPasswordCtrl: FormControl;
  passwordCtrl: FormControl;
  confirmCtrl: FormControl;

  lockPassword = 'lock';
  typePassword = 'password';
  condPassword = false;

  condErrorIcon = false;
  errorIcon = 'error';
  errorMessage: string;

  static passwordMatch(group: FormGroup) {
    const password = group.get('password').value;
    const confirm = group.get('confirm').value;
    return password === confirm ? null : { matchingError: true };
  }

  static customValidators(control: FormControl) {
    const value = control.value;
    let counter = 0;
    if (/[A-Z]/.test(value)) {
      counter++;
    }
    if (/[a-z]/.test(value)) {
      counter++;
    }
    if (/[0-9]/.test(value)) {
      counter++;
    }
    if (/[!"#$%&’*+,-./:;<=>?@[\]^_`{|}~]/.test(value)) {
      counter++;
    }
    return counter > 1 ? null : { validatorError: true };
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.oldPasswordCtrl = this.fb.control('', [
      Validators.required,
      Validators.minLength(6)
    ]);
    this.passwordCtrl = this.fb.control('', [
      Validators.required,
      Validators.minLength(8),
      ChangePasswordComponent.customValidators
    ]);
    this.confirmCtrl = this.fb.control('', Validators.required);

    this.passwordForm = this.fb.group(
      {
        oldPassword: this.oldPasswordCtrl,
        password: this.passwordCtrl,
        confirm: this.confirmCtrl
      },
      { validator: ChangePasswordComponent.passwordMatch }
    );
  }

  changepassw() {
    this.errorMessage = undefined;
    let data = {
      oldPassword: this.oldPasswordCtrl.value,
      password: this.passwordCtrl.value
    };
    this.http
      .post<any>('api/account/changepassword', data)
      .subscribe(result => {
        if (result.succeeded) {
          this.router.navigate(['account']);
          this.snackBar.open('Password successfully changed!', undefined, {
            duration: 3000
          });
        } else {
          this.errorMessage = 'Failed to change password';
          if (result.errors && result.errors.length) {
            let error = result.errors[0];
            if (error.code === 'PasswordMismatch') {
              this.errorMessage = 'Incorrect old password.';
            }
          }
        }
      },
      _ => {
        this.errorMessage = 'Ошибка обработки запроса. Попробуйте еще раз через несколько минут';
      });
  }

  lightPassword() {
    this.condPassword = !this.condPassword;
    if (this.condPassword) {
      this.lockPassword = 'lock_open';
      this.typePassword = 'text';
    } else {
      this.lockPassword = 'lock';
      this.typePassword = 'password';
    }
  }

  lightIcon() {
    this.condErrorIcon = !this.condErrorIcon;
    if (this.condErrorIcon) {
      this.errorIcon = 'error_outline';
    } else {
      this.errorIcon = 'error';
    }
  }
}
