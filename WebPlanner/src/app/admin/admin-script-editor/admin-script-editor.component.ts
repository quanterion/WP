import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SystemService } from 'app/shared/system.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

let loadedTypings = false;
declare const monaco: any;

@Component({
  selector: 'app-admin-script-editor',
  templateUrl: './admin-script-editor.component.html',
  styleUrls: ['./admin-script-editor.component.scss']
})
export class AdminScriptEditorComponent implements OnInit {

  code$: Observable<string>;
  changed = false;

  constructor(private system: SystemService, private http: HttpClient) {
    let defaultValue = `/*
* Здесь вы можете настраивать алгоритм работы редактора проектов
*/
`;
    this.code$ = system.getScript('planner').pipe(map(v => v || defaultValue));
  }

  ngOnInit() {
  }

  codeChanged() {
    this.changed = true;
  }

  editorInitialized() {
    if (!loadedTypings) {
      this.http.get('/assets/protocols/script.typings.d.ts', {responseType: 'text'}).subscribe(value => {
        loadedTypings = true;
        monaco.languages.typescript.javascriptDefaults.addExtraLib(value, 'script.typings.d.ts');
      });
    }
  }

  save(value: string) {
    this.system.setScript('planner', value).subscribe(_ => {
      let elem = document.querySelector('link.wp-custom-style');
      elem.remove();
      document.querySelector('body').parentNode.appendChild(elem);
    });
  }

}
