import { Component, Inject, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FileItem, FileDownloadResponse } from 'app/shared/files.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent {

  @Input() downloadResponse$: Observable<FileDownloadResponse>;

  constructor(@Inject(MAT_DIALOG_DATA) public file: FileItem) { }

  getProgressMode(response?: FileDownloadResponse) {
    let progress = response && response.progress;
    return progress >= 0 && progress <= 100 ? 'determinate' : 'indeterminate';
  }

}
