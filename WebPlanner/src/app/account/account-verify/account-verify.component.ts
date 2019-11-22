import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from "rxjs";
import { AuthService, AccountService } from 'app/shared';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-account-verify',
  templateUrl: './account-verify.component.html',
  styleUrls: ['./account-verify.component.scss']
})
export class AccountVerifyComponent implements OnInit, OnDestroy {
  succeeded = false;
  error: string;
  authSub: Subscription;

  constructor(
    private router: Router,
    auth: AuthService,
    route: ActivatedRoute,
    account: AccountService,
  ) {
    let id = route.snapshot.queryParams['id'];
    let code = route.snapshot.queryParams['code'];
    account.verifyEmail(id, code).subscribe(
      result => {
        if (result.succeeded) {
          this.succeeded = true;
        } else {
          this.error = 'Failed to verify email';
          if (result.errors && result.errors.length) {
            let error = result.errors[0];
            this.error = error.code;
          }
        }
      },
      _ => {
        this.error = 'Failed to verify email';
      }
    );
    this.authSub = auth.isAuthenticated
      .pipe(filter(v => !!v))
      .subscribe(_ => this.router.navigate(['/projects']));
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
