import { Component, OnInit } from '@angular/core';
import { AuthService, FilesService, FileItem } from 'app/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  files$: Observable<FileItem[]>;
  counter = 10;

  constructor(public auth: AuthService, private file: FilesService, private router: Router) {
    this.updateFiles();
   }

   updateFiles() {
    this.files$ = this.file.recent(this.counter).pipe(map(files => {
       let result: FileItem[] = [];
      for (let f of files) {
        if (f.preview) {
          result.push(f);
        }
      }
      return result;
    }));
   }

   moreFiles() {
    this.counter += 10;
    this.updateFiles();
   }

   openModel(id: number) {
    this.router.navigate(['/model', id]);
  }

  ngOnInit() {
  }

}
