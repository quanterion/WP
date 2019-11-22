import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef
} from "@angular/core";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { SystemService, EmailResult, ReportType } from "app/shared/system.service";
import { map, concatMap, catchError } from "rxjs/operators";
import { of, from } from "rxjs";
import { compileHtml, introduceField } from "../print-dialog/template-compiler";
import { AuthService } from "app/shared";

export interface ProjectLinkComponentData {
  id: number;
  name: string;
  url: string;
  editableUrl?: string;
  scriptInterface: any;
  email: string;
}

@Component({
  selector: 'app-project-link',
  templateUrl: './project-link.component.html',
  styleUrls: ['./project-link.component.scss']
})
export class ProjectLinkComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProjectLinkComponentData,
    public auth: AuthService,
    private system: SystemService) { }

  editable = new FormControl(false);
  emailMode = false;
  email = new FormControl(this.data.email, [Validators.required, Validators.email]);
  emailBody = new FormControl('', Validators.required);
  emailForm = new FormGroup({
    email: this.email,
    body: this.emailBody
  });
  emailResult: EmailResult;

  @ViewChild('linkElem', { static: false }) linkRef: ElementRef;
  copied = false;

  ngOnInit() {
  }

  get url() {
    return this.editable.value ? this.data.editableUrl : this.data.url;
  }

  copy() {
    (this.linkRef.nativeElement as HTMLTextAreaElement).select();
    document.execCommand('copy');
    this.copied = true;
  }

  @ViewChild(MatInput, { static: false }) emailInput: MatInput;

  startEmailMode() {
    this.emailMode = true;
    this.emailForm.enable();
    this.system.getTemplates().pipe(
      map(list => list.find(r => r.type === ReportType.Email)),
      catchError(_ => of(undefined)),
      concatMap(r => {
        if (r) {
          let context = introduceField(this.data.scriptInterface, 'currentUrl', this.url);
          return this.system.getTemplate(r.id).pipe(
            concatMap(report => from(compileHtml(report.template, context)))
          );
        }
        return of(`Добрый день! Проект ${this.data.name} доступен по ссылке <a href="${this.url}">3D проект вашего заказа</a>`);
      })
    ).subscribe(body => this.emailBody.setValue(body));
    window.setTimeout(_ => {
      this.emailInput.focus();
    })
  }

  sendEmail() {
    if (this.emailForm.valid) {
      this.emailForm.disable();
      this.system.sendEmail(this.email.value, this.emailBody.value).subscribe(result => {
        this.emailResult = result;
        this.emailMode = false;
      })
    }
  }

}
