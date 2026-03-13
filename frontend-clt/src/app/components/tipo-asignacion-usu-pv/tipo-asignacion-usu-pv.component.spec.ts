import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoAsignacionUsuPvComponent } from './tipo-asignacion-usu-pv.component';

describe('TipoAsignacionUsuPvComponent', () => {
  let component: TipoAsignacionUsuPvComponent;
  let fixture: ComponentFixture<TipoAsignacionUsuPvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoAsignacionUsuPvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TipoAsignacionUsuPvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
