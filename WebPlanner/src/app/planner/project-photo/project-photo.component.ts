import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAsDialog } from 'app/shared/filesaver';
import { dataURItoFile } from 'app/shared';
import { fromEvent, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface PhotoDataData {
  image: any;
  name: string;
}

@Component({
  selector: 'app-project-photo',
  templateUrl: './project-photo.component.html',
  styleUrls: ['./project-photo.component.scss']
})
export class ProjectPhotoComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data$?: Observable<PhotoDataData>) { }

  saveImage(data: PhotoDataData) {
    let fileName = data.name + '.png';
    let file = dataURItoFile(data.image, fileName);
    saveAsDialog(file, fileName);
  }

  print(data: PhotoDataData) {
    let features = 'top=0,left=0,height=100%,width=auto';
    let printWindow = window.open('', '_blank', features);
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${data.name}</title>
          <style>img {
            max-width: 100%;
            max-height: 100%;
          }</style>
          <style type="text/css" media="print">
            @page { size: landscape; }
          </style>
        </head>
        <body><img src="${data.image}"></body>
      </html>`);
    printWindow.document.close();
    fromEvent(printWindow, 'load').pipe(delay(100)).subscribe(_ => {
      printWindow.print();
      printWindow.close();
    });
  }

}
