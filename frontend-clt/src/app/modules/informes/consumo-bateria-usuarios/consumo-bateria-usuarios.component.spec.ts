import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumoBateriaUsuariosComponent } from './consumo-bateria-usuarios.component';

describe('ConsumoBateriaUsuariosComponent', () => {
  let component: ConsumoBateriaUsuariosComponent;
  let fixture: ComponentFixture<ConsumoBateriaUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumoBateriaUsuariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsumoBateriaUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
