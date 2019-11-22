import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SystemService } from 'app/shared/system.service';
import { startWith, concatMap, map, filter, switchMap } from 'rxjs/operators';
import { of, Observable, from } from 'rxjs';
import { DialogService } from 'app/dialogs/services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getFileExtension } from 'app/shared';
import { DomSanitizer } from '@angular/platform-browser';
import { TdFileUploadComponent } from 'app/shared/file/file-upload/file-upload.component';

export interface DisplayFile {
  text?: string;
  name: string;
  language?: string;
  image?: string;
  unknown?: boolean;
}

@Component({
  selector: 'app-admin-content',
  templateUrl: './admin-content.component.html',
  styleUrls: ['./admin-content.component.scss']
})
export class AdminContentComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private system: SystemService,
    private dialog: DialogService,
    private snack: MatSnackBar,
    private sanitizer: DomSanitizer
  ) { }

  private getFilePath(params: Params) {
    let file = params['file'];
    let folder = params['folder'];
    if (file && folder) {
      return folder + '/' + file;
    }
    return file;
  }

  update$ = new EventEmitter()
  assets$ = this.update$.pipe(
    startWith(true),
    switchMap(_ => this.route.queryParams),
    switchMap(q => this.system.getAssets(q['folder'] || ''))
  );
  name$ = this.update$.pipe(
    startWith(true),
    switchMap(_ => this.route.queryParams),
    map(q => this.getFilePath(q))
  );
  folder$ = this.update$.pipe(
    startWith(true),
    switchMap(_ => this.route.queryParams),
    map(q => q['folder'])
  );
  file$: Observable<DisplayFile | undefined> = this.name$.pipe(
    switchMap(path => path ? this.system.getAsset(path) : of(null as Blob)),
    switchMap(blob => {
      if (!blob) {
        return of(undefined);
      }
      let textMatch = blob.type.match(/text\/(.*)/);
      if (textMatch) {
        return from(new Response(blob).text()).pipe(map(text => ({ text, language: textMatch[1] })));
      }
      if (blob.type === 'application/javascript') {
        return from(new Response(blob).text()).pipe(map(text => ({ text, language: 'javascript' })));
      }
      if (blob.type.match(/image.*/)) {
        let image = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        return of({ image });
       }
      return of({ unknown: true });
    })
  );

  ngOnInit() {
  }

  extension = getFileExtension;

  @ViewChild('fileReplace', { static: false }) fileReplaceComponent: TdFileUploadComponent;

  replaceFile(file: File) {
    this.fileReplaceComponent.cancel();
    this.name$.pipe(
      concatMap(name => this.system.uploadAsset(name, file))
    ).subscribe(
      _ => {
        this.update$.emit();
        this.snack.open('Файл успешно загружен!');
      },
      error => this.dialog.showError(error)
    );
  }

  addFolder() {
    this.dialog
      .openPrompt({
        message: `Enter folder name`
      })
      .afterClosed()
      .pipe(filter(v => v))
      .subscribe(name => {
        this.system.uploadAsset(name, null).subscribe(
          _ => this.update$.emit(),
          error => this.dialog.showError(error)
        );
      });
  }

  @ViewChild('fileUpload', { static: false }) fileUploadComponent: TdFileUploadComponent;

  uploadFile(file: File) {
    this.fileUploadComponent.cancel();
    this.folder$.pipe(
      map(f => f ? f + '/' : ''),
      concatMap(folder => this.system.uploadAsset(folder + file.name, file))
    ).subscribe(
      _ => this.update$.emit(),
      error => this.dialog.showError(error)
    );
  }

  removeFile(event: MouseEvent, name: string) {
    event.stopPropagation();
    event.preventDefault();
    this.dialog.openConfirm({message: 'Удалить файл?'})
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.system.removeAsset(name))
      ).subscribe(_ => this.update$.emit());
  }

}
