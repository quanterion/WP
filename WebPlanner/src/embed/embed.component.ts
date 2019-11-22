import { Component, EventEmitter } from '@angular/core';
import { OnDestroy, ChangeDetectorRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmbedService } from './embed.service';
import { SystemService } from 'app/shared/system.service';
import { AuthService } from 'app/shared/auth.service';

@Component({
  selector: 'app-embed-root',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.scss']
})
export class EmbedComponent implements OnDestroy {
  initialized = false;
  private destroy = new EventEmitter<void>();
  constructor(
    private ref: ChangeDetectorRef,
    public auth: AuthService,
    private system: SystemService,
    private embed: EmbedService
  ) {
    if (auth.wigwam) {
      fromEvent(window, 'message')
        .pipe(takeUntil(this.destroy))
        .subscribe(m => this.externalEvent(m));
    } else {
      this.auth.embedLogin().subscribe(
        _ => {
          if (this.auth.embedded.configUrl) {
            interface ConfigResponse {
              redirectUrl?: string;
              params?: any;
            }
            let body = {
              params: this.embed.initParams
            }
            this.system.proxyPost<ConfigResponse>(this.auth.embedded.configUrl, body).subscribe(result => {
              if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
              }
              if (result.params) {
                this.embed.setInitParams(result.params, true);
              }
            })
          }
        },
        _ => {
          alert('Failed to login')
      });
    }
  }

  private externalEvent(event: any) {
    console.log('EM', event.data);
    let message = event.data;
    if (message && message.webplanner) {
      if (message.type === 'init') {
        this.initialized = true;
        if (message.linkOrigin) {
          this.embed.linkOrigin = message.linkOrigin;
        }
        if (message.params) {
          this.embed.setInitParams(message.params, true);
        }
        this.ref.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy.complete();
  }
}
