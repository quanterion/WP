import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { LoginComponent } from 'app/login/login.component';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  oldPasswordCtrl: FormControl;
  passwordCtrl: FormControl;
  confirmCtrl: FormControl;

  lockPassword = 'lock';
  typePassword = 'password';
  condPassword = false;

  errorIcon = 'error';
  errorMessage: string;
  succeeded = false;

  static passwordMatch(group: FormGroup) {
    const password = group.get('password').value;
    const confirm = group.get('confirm').value;
    return password === confirm ? null : { matchingError: true };
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogService: MatDialog
  ) {}

  ngOnInit() {
    this.passwordCtrl = this.fb.control('', [Validators.minLength(6)]);
    this.confirmCtrl = this.fb.control('', Validators.required);

    this.passwordForm = this.fb.group(
      {
        password: this.passwordCtrl,
        confirm: this.confirmCtrl
      },
      { validator: SetPasswordComponent.passwordMatch }
    );
  }

  changepassw() {
    this.errorMessage = undefined;
    let data = {
      userId: this.route.snapshot.queryParams['id'],
      code: this.route.snapshot.queryParams['code'],
      password: this.passwordCtrl.value
    };
    this.http
      .post<any>('api/account/setpassword', data)
      .subscribe(result => {
        if (result.succeeded) {
          this.router.navigate(['/']).then(_ => this.dialogService.open(LoginComponent));
          this.snackBar.open('Password successfully changed!', undefined, {
            duration: 3000
          });
        } else {
          this.errorMessage = 'Failed to update password';
          if (result.errors && result.errors.length) {
            let error = result.errors[0];
            if (error.code === 'PasswordMismatch') {
              this.errorMessage = 'Incorrect old password.';
            } else {
              this.errorMessage = error.description;
            }
          }
        }
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

}
