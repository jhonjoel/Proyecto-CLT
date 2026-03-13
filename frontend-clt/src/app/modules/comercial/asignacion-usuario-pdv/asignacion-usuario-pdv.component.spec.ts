import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionUsuarioPdvComponent } from './asignacion-usuario-pdv.component';

describe('AsignacionUsuarioPdvComponent', () => {
  let component: AsignacionUsuarioPdvComponent;
  let fixture: ComponentFixture<AsignacionUsuarioPdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionUsuarioPdvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignacionUsuarioPdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
