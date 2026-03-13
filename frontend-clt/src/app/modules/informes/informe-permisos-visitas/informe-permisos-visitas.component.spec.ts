import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformePermisosVisitasComponent } from './informe-permisos-visitas.component';

describe('InformePermisosVisitasComponent', () => {
  let component: InformePermisosVisitasComponent;
  let fixture: ComponentFixture<InformePermisosVisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformePermisosVisitasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InformePermisosVisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
