import { Component, Input } from '@angular/core';
import { JobProgressEvent } from 'app/shared';
import { SystemService } from 'app/shared/system.service';

@Component({
  selector: 'app-job-progress-bar',
  templateUrl: './job-progress-bar.component.html',
  styleUrls: ['./job-progress-bar.component.scss']
})
export class AppJobProgressBarComponent {

  @Input() value: JobProgressEvent;

  stopping = false;

  constructor(private system: SystemService) {
  }

  stop(id: string) {
    this.stopping = true;
    this.system.stopJob(id).subscribe();
  }
}
