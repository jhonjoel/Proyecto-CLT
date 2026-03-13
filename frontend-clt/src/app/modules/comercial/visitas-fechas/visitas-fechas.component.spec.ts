import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitasFechasComponent } from './visitas-fechas.component';

describe('VisitasFechasComponent', () => {
  let component: VisitasFechasComponent;
  let fixture: ComponentFixture<VisitasFechasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitasFechasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisitasFechasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
