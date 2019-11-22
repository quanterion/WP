import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ProjectHandler } from 'modeler/project-handler';

interface HistoryItem {
  index: any;
  uid: string;
  name: string;
  size: number;
}

@Component({
  selector: 'app-model-history',
  templateUrl: './model-history.component.html',
  styleUrls: ['./model-history.component.scss']
})
export class ModelHistoryComponent implements OnInit, AfterViewInit {

  constructor(
    public dialogRef: MatDialogRef<ModelHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) private handler: ProjectHandler) {
      this.stats = handler.modelStatistics();
  }

  ngOnInit() {
    this.dialogRef.updateSize('70vw', '70vh');
  }

  ngAfterViewInit() {
    this.history.sort = this.sortForDataSource;
  }

  selectedTabChange(event: MatTabChangeEvent) {
    if (event.index === 1 && this.history.data.length <= 0) {
      this.handler.ds.execute({type: 'history', sync: false})
        .then(items => this.setHistory(items));
    }
  }

  @ViewChild('sortForDataSource', { static: true }) sortForDataSource: MatSort;
  displayedColumns = ['index', 'name', 'size'];
  loading = true;
  history = new MatTableDataSource<HistoryItem>([]);
  stats: any;

  private setHistory(items: HistoryItem[]) {
    this.loading = false;
    let historySize = 0;
    for (let item of items) {
      historySize += item.size;
    }
    items.push({ index: 'Total', uid: '', name: '', size: historySize});
    this.history.data = items;
  }
}
