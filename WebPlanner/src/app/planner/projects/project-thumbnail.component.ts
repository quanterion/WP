import { Component, Input } from '@angular/core';
import { FileItem } from 'app/shared';

@Component({
  // tslint:disable-next-line
  selector: '[app-project-thumbnail]',
  templateUrl: './project-thumbnail.component.html',
  styleUrls: ['./project-thumbnail.component.scss']
})
export class ProjectThumbnailComponent {
  @Input() file?: FileItem;
}
