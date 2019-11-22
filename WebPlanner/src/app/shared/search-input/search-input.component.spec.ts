import {
  TestBed,
  inject,
  async,
  ComponentFixture,
} from '@angular/core/testing';
import 'hammerjs';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SearchModule } from '../search.module';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Component: SearchInput', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        SearchModule,
      ],
      declarations: [
        TestNgModelSupportComponent,
      ],
    });
    TestBed.compileComponents();
  }));

  it('should leverage ngModel to set a value', (done: DoneFn) => {
    let fixture: ComponentFixture<any> = TestBed.createComponent(TestNgModelSupportComponent);
    let component: TestNgModelSupportComponent = fixture.debugElement.componentInstance;
    let inputElement: DebugElement = fixture.debugElement.query(By.css('input'));

    expect(inputElement.nativeElement).toBeTruthy();

    component.value = 'test';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(inputElement.nativeElement.value).toBe('test');

        component.value = 'another_test';
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(inputElement.nativeElement.value).toBe('another_test');
            done();
          });
        });
      });
    });

  });
});

@Component({
  template: `
    <app-search-input [(ngModel)]="value">
    </app-search-input>`,
})
class TestNgModelSupportComponent {
  value: string;
}
