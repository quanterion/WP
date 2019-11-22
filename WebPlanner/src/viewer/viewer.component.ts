import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'app/shared';

@Component({
  selector: 'app-viewer-root',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent {
  checkModelPage$: Observable<boolean>;
  checkCompactView$: Observable<boolean>;

  constructor(public auth: AuthService, public router: Router, public route: ActivatedRoute) {
    this.checkModelPage$ = route.queryParams.pipe(map( p => {
      if (p["model"]) {
        return true;
      } else {
        return false;
      }
    }));
    this.checkCompactView$ = route.queryParams.pipe(map( p => p["compact"]));
  }

  logoutOfTheAccount() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
