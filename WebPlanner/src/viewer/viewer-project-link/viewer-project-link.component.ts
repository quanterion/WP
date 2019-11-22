import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef
} from "@angular/core";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-viewer-project-link',
  templateUrl: './viewer-project-link.component.html',
  styleUrls: ['./viewer-project-link.component.scss']
})
export class ViewerProjectLinkComponent implements OnInit {

  checked = true;

  constructor(@Inject(MAT_DIALOG_DATA) public link: string) { }


  @ViewChild('linkElem', { static: true }) linkRef: ElementRef;
  copied = false;


  ngOnInit() {
  }

  getLink(link: string): string {
    if (this.checked) {
      return link + '&compact=true';
    }
    return link;
  }

  copy() {
    (this.linkRef.nativeElement as HTMLTextAreaElement).select();
    document.execCommand('copy');
    this.copied = true;
  }

}
