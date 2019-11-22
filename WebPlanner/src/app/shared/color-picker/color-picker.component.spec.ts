import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { AppColorPickerComponent } from './color-picker.component';

describe('AppColorPickerComponent', () => {
  let comp: AppColorPickerComponent;
  let fixture: ComponentFixture<AppColorPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppColorPickerComponent],
    });

    fixture = TestBed.createComponent(AppColorPickerComponent);

    comp = fixture.componentInstance;
  });
});
