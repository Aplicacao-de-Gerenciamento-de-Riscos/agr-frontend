import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartExplanationModalComponent } from './chart-explanation-modal.component';

describe('ChartExplanationModalComponent', () => {
  let component: ChartExplanationModalComponent;
  let fixture: ComponentFixture<ChartExplanationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartExplanationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartExplanationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
