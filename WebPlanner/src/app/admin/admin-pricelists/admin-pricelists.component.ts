import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-pricelists',
  templateUrl: './admin-pricelists.component.html',
  styleUrls: ['./admin-pricelists.component.scss']
})
export class AdminPriceListsComponent {
  constructor(private route: ActivatedRoute) {

  }

  userId$ = this.route.queryParams.pipe(map(qp => qp["user"] === undefined ? -1 : Number(qp["user"])));
}
