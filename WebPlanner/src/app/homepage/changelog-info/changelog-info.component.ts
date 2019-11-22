import { Component, OnInit } from '@angular/core';
import { commit, branch } from 'git-version';

@Component({
  selector: 'app-changelog-info',
  templateUrl: './changelog-info.component.html',
  styleUrls: ['./changelog-info.component.scss']
})
export class ChangelogInfoComponent implements OnInit {

  constructor() { }

  commit = commit;
  branch = branch;

  ngOnInit() {
  }

}
