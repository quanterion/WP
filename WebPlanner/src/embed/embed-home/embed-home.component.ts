import { Component, OnInit } from '@angular/core';
import { FileItem, AuthService } from 'app/shared';
import { ActivatedRoute } from '@angular/router';
import { EmbedService } from 'embed/embed.service';

@Component({
  selector: 'app-embed-home',
  templateUrl: './embed-home.component.html',
  styleUrls: ['./embed-home.component.scss']
})
export class EmbedHomeComponent implements OnInit {

  constructor(
    route: ActivatedRoute,
    public embed: EmbedService,
    private auth: AuthService
  ) {
    if (embed) {
      embed.setInitParams(route.snapshot.queryParams);
    }
  }

  lastProjectId = this.embed.getLastProjectId();

  ngOnInit() {
  }

  appName() {
    return this.auth.settings.applicationName || 'WebPlanner';
  }

  afterProjectCreate(f: FileItem) {
    this.embed.goToProject(f.id);
  }
}
