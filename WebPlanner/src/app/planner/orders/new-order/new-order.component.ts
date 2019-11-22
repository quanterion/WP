import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService, FilesService, FileItem, OrderSettings} from 'app/shared';
import { ProjectHandler, NewProjectParams } from 'modeler/project-handler';
import { concatMap } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ClientEditorComponent } from '../client-editor/client-editor.component';
import { ITdDynamicElementConfig } from 'app/shared/dynamic-forms/services/dynamic-forms.service';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  constructor(
    public auth: AuthService,
    private files: FilesService,
    private router: Router,
    private dialogRef: MatDialogRef<NewOrderComponent>,
  ) {
    this.files.nextFileId().subscribe(id => this.name.setValue(`Проект ${id}`));
    this.files.getProjectTemplates().subscribe(list => {
      if (list.length > 0) {
        this.templates = list;
      }
    });
  }

  ngOnInit() {
    this.auth.getAppSetting<OrderSettings>('OrderSettings').subscribe(s => {
      this.orderParamsFormElements = s.customParams || [];
    });
  }

  templates: FileItem[];
  orderParamsFormElements: ITdDynamicElementConfig[] = [];

  useTemplates = new FormControl(false);
  name = new FormControl('', [Validators.required]);

  sizeValidators = [Validators.min(1000), Validators.max(50000)];
  length = new FormControl(5000, this.sizeValidators);
  width = new FormControl(4000, this.sizeValidators);
  height = new FormControl(2500, this.sizeValidators);
  thickness = new FormControl(100, [Validators.min(1), Validators.max(500)]);
  orderParamsForm = new FormGroup({});
  roomForm = new FormGroup({
    length: this.length,
    width: this.width,
    height: this.height,
    thickness: this.thickness
  });

  creating = false;
  error: string;

  @ViewChild(ClientEditorComponent, { static: true }) clientEditor: ClientEditorComponent;

  canCreateOrder() {
    let canCreate = this.name.valid && this.orderParamsForm.valid && !this.creating && this.clientEditor.form.valid;
    return canCreate;
  }

  createFromTemplate(template: FileItem) {
    if (!this.clientEditor.form.valid) {
      return;
    }
    this.creating = true;
    let command =  {
      type: 'load',
      undo: 'clear',
      file: template.id,
      flushModelId: template.id.toString()
    }
    this.createOrder(this.files.createProject(this.name.value, command));
  }

  createProject() {
    if (!this.roomForm.valid || !this.clientEditor.form.valid) {
      return;
    }
    this.creating = true;
    let projectParams: NewProjectParams = {
      length: this.length.value,
      width: this.width.value,
      height: this.height.value,
      thickness: this.thickness.value
    };
    let project = this.auth.getAppSettingRaw('materials').pipe(
      concatMap(materials => {
        let command = ProjectHandler.createNewProject({...materials, ...projectParams});
        return this.files.createProject(this.name.value, command);
      })
    );
    this.createOrder(project);
  }

  createOrder(project: Observable<FileItem>) {
    project.pipe(
      concatMap(p => this.clientEditor.saveOrderInfo(p.id, this.orderParamsForm.value))
    ).subscribe(order => {
      this.dialogRef.close();
      this.router.navigate(['/project', order.id]);
    }, e => (this.error = e));
  }

  cancel() {
    this.dialogRef.close();
  }
}
