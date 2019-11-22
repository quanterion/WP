import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { SystemService } from 'app/shared/system.service';
import { map, concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-style-editor',
  templateUrl: './admin-style-editor.component.html',
  styleUrls: ['./admin-style-editor.component.scss']
})
export class AdminStyleEditorComponent implements OnInit {

  type$ = new BehaviorSubject(0);
  style$: Observable<string>;
  changed = false;

  constructor(private system: SystemService) {
    let defaultValue = `/*
* Здесь вы можете указать дополнительные стили для отображения WebPlanner
*/
`;
    this.style$ = this.type$.pipe(
      concatMap(t => t ? system.getEmbedStyle() : system.getStyle()),
      map(v => v || defaultValue)
    );
  }

  ngOnInit() {
  }

  setType(type: number) {
    this.type$.next(type);
  }

  codechanged() {
    this.changed = true;
  }

  save(value: string) {
    let saver = this.type$.value ? this.system.setEmbedStyle(value) : this.system.setStyle(value);
    saver.subscribe(_ => {
      let elem = document.querySelector('link.wp-custom-style');
      elem.remove();
      document.querySelector('body').parentNode.appendChild(elem);
    });
  }

}
