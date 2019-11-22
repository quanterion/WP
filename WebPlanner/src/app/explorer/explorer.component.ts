import { Component } from '@angular/core';
import { FilesService, FileItem } from '../shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent {
  constructor(private filesService: FilesService) {
    this.files = this.filesService.getChildren(0);
  }

  files: Observable<FileItem[]>;
}
