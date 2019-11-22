import {
  TestBed,
  async,
  ComponentFixture,
} from '@angular/core/testing';
import 'hammerjs';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppSearchInputComponent } from '../search-input/search-input.component';
import { SearchModule } from '../search.module';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  template: `
    <app-search-box [(ngModel)]="value">
    </app-search-box>`,
})
class TestNgModelSupportComponent {
  value: string;
}

TestBed.configureTestingModule({
  imports: [
    NoopAnimationsModule,
    FormsModule,
    SearchModule
  ],
  declarations: [
    TestNgModelSupportComponent,
  ],
});


describe('Component: SearchBox', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        SearchModule
      ],
      declarations: [
        TestNgModelSupportComponent,
      ]
    });
    TestBed.compileComponents();
  }));

  it('should leverage ngModel to set a value', (done: DoneFn) => {
    let fixture: ComponentFixture<any> = TestBed.createComponent(TestNgModelSupportComponent);
    let component: TestNgModelSupportComponent = fixture.debugElement.componentInstance;
    let inputComponent: DebugElement = fixture.debugElement.query(By.directive(AppSearchInputComponent));

    expect(inputComponent).toBeTruthy();

    component.value = 'test';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(inputComponent.componentInstance.value).toBe('test');

        component.value = 'another_test';
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(inputComponent.componentInstance.value).toBe('another_test');
            done();
          });
        });
      });
    });
  });
});
