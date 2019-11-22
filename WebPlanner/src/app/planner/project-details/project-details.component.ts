import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MaterialUnit, FileItem, OrderInfo, AuthService, AccountService } from '../../shared';
import { EstimateService } from '../estimate';
import { FloorProjectStatistics } from 'modeler/floorplanner';
import { Observable } from 'rxjs';
import { EmbedService } from 'embed/embed.service';
import { TdFileService } from 'app/shared/file/services/file.service';
import { map } from 'rxjs/operators';

export interface ProjectDetails {
  file: FileItem,
  revision: string;
  tab: number,
  download: boolean;
  shared?: string,
  readOnly: boolean,
  estimate: EstimateService,
  backups: Observable<FileItem[]>,
  order: Observable<OrderInfo>,
  statistics: FloorProjectStatistics,
  print: () => void,
  scriptInterface: any;
  orderUrl?: string;
  orderUrlParams: any;
};

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ProjectDetails,
    @Optional() public embed: EmbedService, public auth: AuthService,
    public files: TdFileService,
    private dialogRef: MatDialogRef<ProjectDetailsComponent>,
    private account: AccountService) {
      if (!data.shared) {
        data.shared = '!';
      }
    }

  roles$ = this.account.getRoles();
  ownerName$ = this.account.getUser(this.data.file.ownerId).pipe(
    map(u => u.fullName || u.name)
  );
  versionColumns = ['name', 'date'];
  unit = MaterialUnit;

  ngOnInit() {
    this.dialogRef.updateSize('70vw', '70vh');
  }

  canChangeShared() {
    return !this.embed && !this.auth.roles.includes('seller');
  }

  downloadFile(format?) {
    this.files.openDownloadDialog(this.data.file, format, undefined, true);
  }

  close() {
    this.dialogRef.close();
  }
}
