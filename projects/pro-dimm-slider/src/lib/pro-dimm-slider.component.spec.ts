import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProDimmSliderComponent } from './pro-dimm-slider.component';

describe('ProDimmSliderComponent', () => {
  let component: ProDimmSliderComponent;
  let fixture: ComponentFixture<ProDimmSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProDimmSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProDimmSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
