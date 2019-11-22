import { Component, ViewChild, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemService, Report as DocumentTemplate, ReportType as TemplateType } from 'app/shared/system.service';
import { map, concatMap, tap, filter, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { printTemplate, printStyle, emailTemplate, xmlTemplate } from './new-templates';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilderComponent } from '../form-builder/form-builder.component';
import { DialogService } from 'app/dialogs/services/dialog.service';

@Component({
  selector: 'app-admin-templates',
  templateUrl: './admin-templates.component.html',
  styleUrls: ['./admin-templates.component.scss']
})
export class AdminTemplatesComponent {

  constructor(private route: ActivatedRoute, private system: SystemService,
    private snack: MatSnackBar, private router: Router, private dialog: DialogService) { }

  update$ = new EventEmitter()
  templates$ = this.update$.pipe(
    startWith(true),
    concatMap(_ => this.system.getTemplates())
  );
  template$ = this.route.queryParams.pipe(
    map(q => q['id']),
    concatMap(v => {
      if (!v) {
        return of<DocumentTemplate>(undefined);
      }
      if (v.startsWith('new')) {
        let template = {id: 0, type: TemplateType.Print, name: '', template: printTemplate, style: printStyle};
        if (v === 'new-email') {
          template.type = TemplateType.Email;
          template.template = emailTemplate;
          template.style = '';
        }
        if (v === 'new-xml') {
          template.type = TemplateType.Xml;
          template.template = xmlTemplate;
          template.style = '';
        }
        return of<DocumentTemplate>(template);
      }
      return this.system.getTemplate(v);
    }),
    tap(v => {
      if (v) {
        v.params = v.params || {};
        this.form.patchValue(v);
      }
    })
  );

  TemplateType = TemplateType;
  type = new FormControl(TemplateType.Print);
  name = new FormControl('', [Validators.required]);
  templateControl = new FormControl('', [Validators.required]);
  style = new FormControl('');

  form = new FormGroup({
    type: this.type,
    name: this.name,
    template: this.templateControl,
    style: this.style
  });

  @ViewChild(FormBuilderComponent, { static: false }) formBuilder?: FormBuilderComponent;

  save(report: DocumentTemplate) {
    if (!this.form.valid) {
      return;
    }
    let value = this.form.value;

    let params =  report.params || {};
    params.form = this.formBuilder ? this.formBuilder.elements : [];
    let data = {...report, ...value, params: JSON.stringify(params)};
    this.system.editTemplate(data)
      .subscribe(_ => {
        this.snack.open('Отчёт успешно сохранён');
        this.router.navigateByUrl('/admin/templates', {queryParams: {}});
      });
  }

  removeTemplate(event: MouseEvent, template: DocumentTemplate) {
    event.stopPropagation();
    event.preventDefault();
    this.dialog.openConfirm({message: 'Удалить отчёт?'})
      .afterClosed().pipe(
        filter(v => v),
        concatMap(_ => this.system.removeTemplate(template))
      ).subscribe(_ => this.update$.emit());
  }
}
