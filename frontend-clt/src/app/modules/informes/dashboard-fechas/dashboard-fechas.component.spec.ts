import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFechasComponent } from './dashboard-fechas.component';

describe('DashboardFechasComponent', () => {
  let component: DashboardFechasComponent;
  let fixture: ComponentFixture<DashboardFechasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFechasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardFechasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
