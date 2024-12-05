import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartExplanationModalComponent } from './chart-explanation-modal.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ChartExplanationModalComponent', () => {
  let component: ChartExplanationModalComponent;
  let fixture: ComponentFixture<ChartExplanationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartExplanationModalComponent ],
      imports: [
        BrowserAnimationsModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatDialogModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ]
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
