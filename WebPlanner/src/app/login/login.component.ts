import { Component, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../shared';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(public auth: AuthService,
    @Optional() private dialogRef?: MatDialogRef<LoginComponent>) {}

  error: string;
  message: string;
  passwordVisible = false;

  login(info: { userName: string; password: string }) {
    this.error = '';
    this.auth
      .login(info)
      .subscribe(
        _ => this.closeForm(true),
        error => this.handleError(error)
      );
  }

  closeForm(success = false) {
    if (this.dialogRef) {
      this.dialogRef.close(success);
    }
  }

  private handleError(errorInfo: any) {
    this.error = (errorInfo && errorInfo.error && errorInfo.error.error_type) || 'unknown';
  }
}
