import { EventEmitter, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogProperty } from '../../shared';

@Component({
  selector: 'app-property-selector',
  templateUrl: './property-selector.component.html',
  styleUrls: ['./property-selector.component.scss']
})
export class PropertySelectorComponent implements OnInit {
  constructor() {}

  caption = 'Выберите свойство или создайте новое';
  properties: Observable<CatalogProperty[]>;
  select = new EventEmitter<CatalogProperty>();

  ngOnInit() {}
}
