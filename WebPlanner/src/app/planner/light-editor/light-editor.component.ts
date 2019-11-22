import { Component, OnDestroy, Input, ViewChild } from '@angular/core';
import { WebDesigner } from 'modeler/webdesigner';
import { Subscription } from 'rxjs';
import { RenderLight, SunLight } from 'modeler/render/render-scene';
import { Entity } from 'modeler/designer';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { merge, auditTime } from 'rxjs/operators';

class LightInfo {
  constructor(public e: Entity) {
    this.name = e.name || 'Light';
  }
  name: string;
  power = 100;
  distance = 3500;
  shadows = false;
}

@Component({
  selector: 'app-light-editor',
  templateUrl: './light-editor.component.html',
  styleUrls: ['./light-editor.component.scss']
})
export class LightEditorComponent implements OnDestroy {
  constructor() {}

  private changeSub: Subscription;
  private _ds: WebDesigner;

  sun: SunLight;
  headLight: RenderLight;
  lights: LightInfo[] = [];
  selected: Entity;
  hasSelection = false;

  @Input()
  set ds(value: WebDesigner) {
    if (this.changeSub) {
      this.changeSub.unsubscribe();
      this.changeSub = undefined;
    }
    this._ds = value;
    if (value) {
      let onChange = value.selection.change.pipe(
        merge(value.modelChange),
        merge(value.serverSync),
        auditTime(100)
      );
      this.changeSub = onChange.subscribe(_ => this.updateProperties());
    }
    this.updateProperties();
  }

  get ds() {
    return this._ds;
  }

  _manage = false;
  @Input()
  set manage(value: boolean) {
    this._manage = value;
  }
  get manage() {
    return this._manage;
  }

  @Input() selectedOnly = false;

  ngOnDestroy() {
    this.ds = undefined;
  }

  private convertLight(source: RenderLight) {
    if (source.link.removed || !source.link.entity) {
      return;
    }
    let dest = new LightInfo(source.link.entity);
    let info = dest.e.data.light || {};
    dest.power = info.power || dest.power;
    dest.distance = info.distance || dest.distance;
    dest.shadows = !!info.shadows;
    return dest;
  }

  private updateProperties() {
    if (this.ds && this.ds.render) {
      this.headLight = this.ds.render.scene.headLight;
      this.sun = this.ds.render.scene.sunLight;
      this.lights = this.ds.render.scene.lights
        .map(this.convertLight)
        .filter(v => v)
        .sort((a, b) => a.e.uid.comp(b.e.uid));
      if (this.selectedOnly && this.ds.selectedItems.length) {
        this.lights = this.lights.filter(l => l.e && l.e.isSelected);
      }
      this.selected = this.ds.selected;
      this.hasSelection = this.ds.hasSelection;
    } else {
      this.lights = [];
      this.selected = undefined;
    }
  }

  @ViewChild('headEnabled', { static: false }) headEnabled: MatCheckbox;
  @ViewChild('headPower', { static: false }) headPower: MatSlider;

  headLightChanging(event: MatSliderChange) {
    this.headLightChanged(event.value);
  }

  headLightChanged(currentpower?: number) {
    let params = {
      enabled: this.headEnabled.checked,
      power: currentpower || this.headPower.value
    }
    this.ds.root.data.headLight = params;
    if (!currentpower) {
      this.ds.apply('Change headlight',
        {
          uid: this.ds.root,
          data: { headLight: params }
        }, false);
    }
    this.ds.invalidate();
  }

  sunLuminanceInput(event: MatSliderChange) {
    this.sun.luminance = event.value;
    this.sunLightChanged(false);
  }

  sunAzimuthInput(event: MatSliderChange) {
    this.sun.azimuth = event.value;
    this.sunLightChanged(false);
  }

  sunElevationInput(event: MatSliderChange) {
    this.sun.elevation = event.value;
    this.sunLightChanged(false);
  }

  sunLightChanged(apply = true) {
    let params = {
      enabled: this.sun.enabled,
      luminance: this.sun.luminance,
      azimuth: this.sun.azimuth,
      elevation: this.sun.elevation,
    }
    this.ds.root.data.sunLight = params;
    if (apply) {
      this.ds.apply('Change sun options',
        {
          uid: this.ds.root,
          data: { sunLight: params }
        }, false);
    }
    this.ds.invalidate();
  }

  paramChanged(light: LightInfo, curPower?: number, curDistance?: number) {
    let info = {
      power: curPower || light.power,
      distance: curDistance || light.distance,
      shadows: light.shadows
    };
    light.e.data.light = info;
    if (!curPower && !curDistance) {
      this.ds.apply('Change light parameter', {uid: light.e, data: {light: info}}, false);
    }
    this.ds.invalidate();
  }

  createLight(obj: Entity) {
    let light = { power: 100, distance: 3500, shadows: true};
    this.ds.apply('Change light parameter', {uid: obj, data: {light}});
  }

  removeLight(light: LightInfo) {
    if (this.manage) {
      this.ds.apply('Remove light', {uid: light.e, data: {light: null}});
    } else {
      let model = light.e.findParent(p => !!p.data.model);
      this.ds.apply('Remove light', {uid: model, remove: true});
    }
  }

  lightTrackBy(_, item: LightInfo) {
    return item.e.uid;
  }
}
