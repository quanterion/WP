import { Injectable } from '@angular/core';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { DownloadComponent } from '../download/download.component';
import { FileItem, FilesService } from 'app/shared/files.service';
import { saveAsDialog } from 'app/shared/filesaver';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UploadIndicatorComponent } from 'app/catalog-editor/upload-indicator/upload-indicator.component';
import { Router } from '@angular/router';

export interface IUploadOptions {
  url: string;
  method: 'post' | 'put';
  file?: File;
  headers?: { [key: string]: string };
  formData?: FormData;
}

@Injectable()
export class TdFileService {

  constructor(private dialog: DialogService, private filesService: FilesService, private router: Router) { }

  openDownloadDialog(file: FileItem, format?: string, rootUid?: string, materials = false) {
    let dialogRef = this.dialog.open(DownloadComponent, {
      minWidth: "40%",
      disableClose: true,
      data: file
    });
    dialogRef.componentInstance.downloadResponse$ = this.filesService.
      downloadFileWithProgress(file, format, rootUid, materials).pipe(tap(resp => {
        if (resp && resp.blob) {
          saveAsDialog(resp.blob, file.name + '.' + (format || '.wpm'));
          setTimeout(() => dialogRef.close(true), 1000);
        }
        if (resp && resp.error) {
          dialogRef.disableClose = false;
        }
      }));
    dialogRef.afterClosed().subscribe(ok => {
      if (!ok) {
        dialogRef.componentInstance.downloadResponse$ = of(undefined);
      }
    });
    return dialogRef;
  }

  openUploadWindow(folderId: number, files: File[], hideModelLinks?: boolean) {
    let info = {files, folderId, hideModelLinks};
    let dialogRef = this.dialog.open(UploadIndicatorComponent, {
      minWidth: "40%",
      disableClose: true,
      data: info
    });
    return dialogRef;
  }
}
