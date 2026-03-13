import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosVisitasComponent } from './permisos-visitas.component';

describe('PermisosVisitasComponent', () => {
  let component: PermisosVisitasComponent;
  let fixture: ComponentFixture<PermisosVisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermisosVisitasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermisosVisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
