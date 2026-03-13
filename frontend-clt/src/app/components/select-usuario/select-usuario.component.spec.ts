import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUsuarioComponent } from './select-usuario.component';

describe('SelectUsuarioComponent', () => {
  let component: SelectUsuarioComponent;
  let fixture: ComponentFixture<SelectUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
