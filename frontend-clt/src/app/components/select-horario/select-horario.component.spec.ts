import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectHorarioComponent } from './select-horario.component';

describe('SelectHorarioComponent', () => {
  let component: SelectHorarioComponent;
  let fixture: ComponentFixture<SelectHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHorarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
