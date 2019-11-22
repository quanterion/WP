import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WindowService {

  getFullscreenElement(): Element {
    return (
      (document as any).fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement ||
      null
    );
  }

  toggleFullScreen(elem: any) {
    if (this.getFullscreenElement()) {
      this.exitFullscreen();
      return;
    }
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozExitFullScreen) {
      (document as any).mozExitFullScreen();
    } else if ((document as any).msExitFullScreen) {
      (document as any).msExitFullScreen();
    }
  }
}
