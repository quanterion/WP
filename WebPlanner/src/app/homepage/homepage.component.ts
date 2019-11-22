import { Component, OnDestroy } from '@angular/core';
import { AuthService } from 'app/shared';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnDestroy {
  constructor(public auth: AuthService, private router: Router) {

  }

  showLogin$ = this.auth.isAuthenticated.pipe(map(v => v === false));

  sub = this.auth.isAuthenticated.subscribe(v => {
    if (v) {
      this.router.navigate(['/projects']);
    }
  });

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
