import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditVisitasComponent } from './audit-visitas.component';

describe('AuditVisitasComponent', () => {
  let component: AuditVisitasComponent;
  let fixture: ComponentFixture<AuditVisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditVisitasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditVisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
