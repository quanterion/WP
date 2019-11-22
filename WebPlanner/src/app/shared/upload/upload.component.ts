import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FilesService, FilesUploadResponse} from 'app/shared';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  uploadResponse$: Observable<FilesUploadResponse>;
  fileName = "";
  fileSize: number;

  @Input() folderId: number;
  @Output() hide = new EventEmitter();

  constructor(private files: FilesService, private router: Router) {}

  close() {
    this.hide.emit();
  }

  private openModel(id: number) {
    this.router.navigate(['/model', id]);
  }

  private uploadFile(folderId: number, file: File) {
    this.fileName = file.name;
    this.fileSize = file.size;
    this.uploadResponse$ = this.files
    .uploadFileWithProgress(folderId, file).pipe(
      tap(resp => {
        if (resp && resp.uploaded && resp.uploaded.length > 0) {
          let f = resp.uploaded[0];
          this.openModel(f.id);
        }
      }),
      catchError(error => {
        console.log(error);
        let status = -1;
        let message = "Unknown error";
        if (error instanceof HttpErrorResponse) {
          status = error.status;
          message = error.message;
        }
        return of({error: message, errorStatus: status} as FilesUploadResponse);
      })
    )
    ;
  }

  handleFileInput(event: Event, folderId: number) {
    let input = event.target as HTMLInputElement;
    if (input.files.length === 1) {
      let file = input.files.item(0);
      this.uploadFile(folderId, file);
    }
    input.value = null;
  }

  getProgressMode(response?: FilesUploadResponse) {
    let progress = response && response.progress;
    return progress > 0 && progress < 100 ? 'determinate' : 'indeterminate';
  }

  dropHandler(event, folderId: number) {
    event.preventDefault();
    if (event.dataTransfer.items) {
      let items = event.dataTransfer.items;
      let itemsCount = items.length;
      if (itemsCount === 1) {
        if (items[0].kind === 'file') {
          let file = items[0].getAsFile();
          this.uploadFile(folderId, file);
        }
      }
    } else {
      let files =  event.dataTransfer.files
      let filesCount = files.length;
      if (filesCount === 1) {
        this.uploadFile(folderId, files[0]);
      }
    }
    this.removeDragData(event)
  }

  removeDragData(ev) {
    if (ev.dataTransfer.items) {
      ev.dataTransfer.items.clear();
    } else {
      ev.dataTransfer.clearData();
    }
  }

  dragOverHandler(ev) {
    ev.preventDefault();
  }
}
