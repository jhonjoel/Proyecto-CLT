import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcacionUsuariosComponent } from './marcacion-usuarios.component';

describe('MarcacionUsuariosComponent', () => {
  let component: MarcacionUsuariosComponent;
  let fixture: ComponentFixture<MarcacionUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcacionUsuariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarcacionUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
