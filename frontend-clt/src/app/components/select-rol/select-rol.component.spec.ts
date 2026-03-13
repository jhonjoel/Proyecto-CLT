import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRolComponent } from './select-rol.component';

describe('SelectRolComponent', () => {
  let component: SelectRolComponent;
  let fixture: ComponentFixture<SelectRolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectRolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
