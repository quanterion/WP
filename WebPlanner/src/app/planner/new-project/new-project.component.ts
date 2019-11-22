import { Component, OnInit, Inject, Optional, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService, FilesService, FileItem} from '../../shared';
import { ProjectHandler, NewProjectParams } from 'modeler/project-handler';
import { concatMap, filter } from 'rxjs/operators';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private files: FilesService,
    @Optional() private dialogRef?: MatDialogRef<NewProjectComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public template?: boolean
  ) {
    this.auth.isAuthenticated.pipe(
      filter(v => v),
      concatMap(_ => this.files.nextFileId())
    ).subscribe(id => this.name.setValue(`Проект ${id}`));
    this.files.getProjectTemplates().subscribe(list => {
      if (list.length > 0) {
        this.templates = list;
      }
    });
  }

  ngOnInit() {}

  @Output() afterCreate = new EventEmitter<FileItem>();

  templates?: FileItem[];
  message?: string;

  useTemplates = new FormControl(false);
  name = new FormControl('', [Validators.required]);
  sizeValidators = [Validators.min(1000), Validators.max(50000)];
  length = new FormControl(5000, this.sizeValidators);
  width = new FormControl(4000, this.sizeValidators);
  height = new FormControl(2500, this.sizeValidators);
  thickness = new FormControl(100, [Validators.min(1), Validators.max(500)]);
  form = new FormGroup({
    name: this.name,
    length: this.length,
    width: this.width,
    height: this.height,
    thickness: this.thickness
  });
  creating = false;
  error: string;

  createProject() {
    if (!this.form.valid) {
      return;
    }
    this.creating = true;

    let projectParams: NewProjectParams = {
      length: this.length.value,
      width: this.width.value,
      height: this.height.value,
      thickness: this.thickness.value
    };
    this.auth.getAppSettingRaw('materials').pipe(
      concatMap(materials => {
        let command = ProjectHandler.createNewProject({...materials, ...projectParams});
        return this.files.createProject(this.name.value, command, this.template);
      })
    ).subscribe(f => {
      if (this.dialogRef) {
        this.dialogRef.close();
      }
      this.afterCreate.next(f)
    }, e => this.error = e);
  }

  createFromTemplate(template: FileItem) {
    if (!this.name.valid) {
      return;
    }
    this.creating = true;
    let command =  {
      type: 'load',
      undo: 'clear',
      file: template.id,
      flushModelId: template.id.toString()
    }
    this.files.createProject(this.name.value, command).subscribe(f => {
      if (this.dialogRef) {
        this.dialogRef.close();
      }
      this.afterCreate.next(f)
    }, e => this.error = e);
  }

  cancel() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
