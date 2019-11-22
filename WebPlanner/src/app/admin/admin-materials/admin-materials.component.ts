import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/shared';
import { MaterialSelectorComponent } from 'app/planner/material-selector/material-selector.component';
import { ModelExplorerComponent } from 'app/planner/model-explorer/model-explorer.component';
import { NewProjectParams } from 'modeler/project-handler';

@Component({
  selector: 'app-admin-materials',
  templateUrl: './admin-materials.component.html',
  styleUrls: ['./admin-materials.component.scss']
})
export class AdminMaterialsComponent implements OnInit {
  materials: NewProjectParams;

  constructor(
    private materialDialogs: MatDialog,
    public authService: AuthService,
    private vcr: ViewContainerRef,
    private snack: MatSnackBar
  ) {
    authService
      .getAppSettingRaw('materials')
      .subscribe(m => this.materials = m || {});
   }

  ngOnInit() {
  }

  selectMaterial(type: string) {
    let dialogRef = this.materialDialogs.open(MaterialSelectorComponent, {
      width: '50%',
      height: '60%',
      data: this.materials[type] || {}
    });
    let selector = dialogRef.componentInstance;
    selector.displayCatalogs = true;
    selector.select.subscribe(m => {
      dialogRef.close();
      this.materials[type] = m;
      this.save();
    });
  }

  save() {
    this.authService.setAppSettingRaw('materials', this.materials, 0).subscribe(
      _ => this.snack.open('Project params successfully updated', undefined, {duration: 3000})
    );
  }

  chooseWallMaterial() {
    this.selectMaterial('wall');
  }

  chooseFloorMaterial() {
    this.selectMaterial('floor');
  }

  chooseCeilingMaterial() {
    this.selectMaterial('ceiling');
  }

  chooseRoofMaterial() {
    this.selectMaterial('roof');
  }

  chooseLight() {
    let dialogRef = this.materialDialogs.open(ModelExplorerComponent, {
      viewContainerRef: this.vcr,
      width: "50%",
      height: "60%"
    });
    let selector = dialogRef.componentInstance;
    if (this.materials.light) {
      selector.activateFile(this.materials.light.id);
    }
    selector.fileSelected.subscribe(file => {
      this.materials.light = file;
      this.save();
      dialogRef.close();
    });
  }

  removeLight() {
    delete this.materials.light;
    this.save();
  }
}
