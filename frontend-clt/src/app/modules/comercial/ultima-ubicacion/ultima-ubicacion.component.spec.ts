import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimaUbicacionComponent } from './ultima-ubicacion.component';

describe('UltimaUbicacionComponent', () => {
  let component: UltimaUbicacionComponent;
  let fixture: ComponentFixture<UltimaUbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UltimaUbicacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UltimaUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
