import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from 'app/shared';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  error$: Observable<any>;

  constructor(auth: AuthService, route: ActivatedRoute, router: Router) {
    this.error$ = route.queryParams.pipe(concatMap(p => auth.emailLogin(p['email'] as string,
      p['token'] as string)),
      tap(_ => router.navigate(['/files'])),
      catchError(e => {
        console.error(e);
        return of(true);
      })
    );
   }

  ngOnInit() {
  }

}
