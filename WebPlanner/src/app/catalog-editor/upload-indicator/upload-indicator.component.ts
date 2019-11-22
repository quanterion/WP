import { Component, Inject, Output, EventEmitter} from '@angular/core';
import { Observable, empty } from 'rxjs';
import { FilesUploadResponse, FilesService, FileItem } from 'app/shared/files.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { concat } from 'rxjs';
import { scan, catchError, tap, map, startWith, delay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-indicator',
  templateUrl: './upload-indicator.component.html',
  styleUrls: ['./upload-indicator.component.scss']
})
export class UploadIndicatorComponent {

  @Output() complete = new EventEmitter();
  uploadResponse$: Observable<FilesUploadResponse>;
  errorStatuses = [];

  constructor(@Inject(MAT_DIALOG_DATA) public info: { files: File[], folderId: number, hideModelLinks?: boolean },
    private dialogRef: MatDialogRef<UploadIndicatorComponent>, private filesService: FilesService, private router: Router) {
    let files = info.files;
    let folderId = info.folderId;
    let filesUploadResponses = files.map(f => filesService.uploadFileWithProgress(folderId, f).pipe(
      catchError(error => {
        dialogRef.disableClose = !(files.length < 2);
        console.log(error);
        let status = -1;
        let message = "Unknown error";
        if (error instanceof HttpErrorResponse) {
          status = error.status;
          message = error.message;
        }
        return empty().pipe(delay(1200), startWith({ error: message, errorStatus: status } as FilesUploadResponse));
      }),
      map(resp => {
        if (resp) {
          resp.curFileIndex = files.indexOf(f);
        }
        return resp;
      })));
    const firstResponse = { curFileIndex: 0, uploaded: [], failed: [] } as FilesUploadResponse;
    this.uploadResponse$ = concat(...filesUploadResponses).pipe(
      scan((globalResp, curResp) => {
        if (curResp) {
          globalResp.error = curResp.error;
          globalResp.progress = curResp.progress;
          if (curResp.error) {
            this.errorStatuses.push(curResp.errorStatus);
            let failedName = files[globalResp.curFileIndex].name;
            globalResp.failed.push({ name: failedName } as FileItem);
          } else if (curResp.failed && curResp.failed.length > 0) {
            this.errorStatuses.push(-2);
            globalResp.failed.push(curResp.failed);
          } else {
            globalResp.uploaded.push(...curResp.uploaded || []);
          }
          globalResp.curFileIndex = curResp.curFileIndex;
        }
        return globalResp;
      }, firstResponse),
      tap(resp => {
        if (resp && this.isUploadComplete(resp)) {
          dialogRef.disableClose = false;
          this.complete.emit();
        }
      }),
      );
  }

  isUploadComplete(response?: FilesUploadResponse) {
    if (response) {
      let upload = [];
      let failed = [];
      upload.push(...response.uploaded || []);
      failed.push(...response.failed || []);
      return (upload.length + failed.length === this.info.files.length);
    }
    return false;
  }

  getProgressMode(response?: FilesUploadResponse) {
    let progress = response && response.progress;
    return progress >= 0 && progress < 100 ? 'determinate' : 'indeterminate';
  }

  openModel(file: FileItem) {
    this.router.navigate(['catalog', file.catalogId, 'model', file.id]);
    this.dialogRef.close(true);
  }

  getModelLink(file: FileItem) {
    return ['catalog', file.catalogId, 'model', file.id];
  }

  close() {
    this.dialogRef.close();
  }

}
