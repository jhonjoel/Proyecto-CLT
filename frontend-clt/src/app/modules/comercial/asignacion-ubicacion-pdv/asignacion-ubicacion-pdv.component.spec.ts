import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionUbicacionPdvComponent } from './asignacion-ubicacion-pdv.component';

describe('AsignacionUbicacionPdvComponent', () => {
  let component: AsignacionUbicacionPdvComponent;
  let fixture: ComponentFixture<AsignacionUbicacionPdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionUbicacionPdvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignacionUbicacionPdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
