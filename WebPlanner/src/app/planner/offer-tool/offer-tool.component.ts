import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FileItem, FilesService } from 'app/shared';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-offer-tool',
  templateUrl: './offer-tool.component.html',
  styleUrls: ['./offer-tool.component.scss']
})
export class OfferToolComponent {
  constructor(private files: FilesService) {}

  offers$: Observable<FileItem>;

  @Input() set offers(value: number[]) {
    this.offers$ = this.files.getFiles(value).pipe(map(files => {
      return {
        id: 0,
        folder: true,
        name: '',
        files
      }
    }));
  }

  @Output() modelDrag = new EventEmitter<FileItem>();
  @Output() close = new EventEmitter<void>();
}
