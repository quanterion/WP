import { Component } from '@angular/core';
import { AuthService } from 'app/shared';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  constructor(public auth: AuthService) {

  }
}
