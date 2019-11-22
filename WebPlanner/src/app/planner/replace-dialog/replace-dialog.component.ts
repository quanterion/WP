import { Component, OnInit, Input, Inject } from '@angular/core';
import { Entity, Designer } from 'modeler/designer';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Catalog, FileItem } from 'app/shared';
import { Observable } from 'rxjs';
import { ContainerManager } from 'modeler/container';
import { ProjectHandler } from 'modeler/project-handler';

@Component({
  selector: 'app-replace-dialog',
  templateUrl: './replace-dialog.component.html',
  styleUrls: ['./replace-dialog.component.scss']
})
export class ReplaceDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ReplaceDialogComponent>,
     @Inject(MAT_DIALOG_DATA) private project: ProjectHandler, private snackBar: MatSnackBar) { }

  public allModels: Entity[][];
  private ds: Designer;

  ngOnInit() {
    this.ds = this.project.ds;
    this.allModels = this.findAllReplacableItems();
  }

  @Input() selectModel: (catalogOrFolder?: Catalog | number, activeFileId?: number,
    type?: string) => Observable<FileItem>;



  findAllReplacableItems() {
    let allItems: Entity[][] = [];
    let canReplace = (e: Entity) => e.data.model || (e.type && !(e.elastic && e.elastic.container));
    let isIdentical = (e1, e2: Entity) => {
      let condition = e1.name === e2.name && e1.type === e2.type;
      if (ContainerManager.isContainerItem(e1) && ContainerManager.isContainerItem(e2)) {
        condition = condition && e1.elastic.position === e2.elastic.position;
      }
      return condition;
    }
    this.ds.root.forEach(currentEntity => {
      if (canReplace(currentEntity)) {
        let alreadyExist = false;
        for (let sameItems of allItems) {
          alreadyExist = sameItems.some(e => isIdentical(e, currentEntity));
          if (alreadyExist) {
            sameItems.push(currentEntity);
            break;
          }
        }
        if (!alreadyExist) {
          allItems.push([currentEntity]);
        }
      }
    });
    return allItems;
  }

  replace(models: Entity[]) {
    if (models && models.length > 0) {
      this.selectModel(undefined, undefined, models[0].type).subscribe(f => {
        this.project.replaceModels(models, f).then(_ => {
          let message = `${models.length} models of ${models[0].name} have been replaced to ${f.name}`;
          this.snackBar.open(message, 'OK');
        });
        this.dialogRef.close();
      });
    }
  }

}
