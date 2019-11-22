import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/shared';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})

export class UserInfoComponent implements OnInit {

  token$: Observable<string | -1>;

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.updateToken();
  }

  updateToken() {
    this.token$ = this.http.get<{token: string}>('/api/account/token')
      .pipe(map(p => p.token || -1));
  }

  createToken() {
    this.http.post('/api/account/token', {}).subscribe(_ => this.updateToken());
  }

  removeToken() {
    this.http.delete('/api/account/token', {}).subscribe(_ => this.updateToken());
  }

  saveUser(form: FormGroup) {
    if (form.valid) {
      this.http.post('/api/account/update', form.value)
        .subscribe(
          _ => {
            this.snackBar.open('All user information successfully updated!');
            form.reset(form.value);
          },
          _ => this.snackBar.open('Failed to update user information')
        );
    }
  }

  ngOnInit() { }

}
