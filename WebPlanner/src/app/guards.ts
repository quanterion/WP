import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'app/shared';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    return this.auth.isAdmin.pipe(
      filter(val => val !== undefined),
      map(v => v ? true : this.router.createUrlTree(['/home']))
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate() {
    return this.auth.isAuthenticated.pipe(filter(val => val !== undefined));
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate();
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthStatusGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService) {}

  canActivate() {
    return this.auth.isAuthenticated.pipe(
      filter(val => val !== undefined),
      map(_ => true)
    );
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate();
  }
}
