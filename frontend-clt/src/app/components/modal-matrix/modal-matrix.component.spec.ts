import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMatrixComponent } from './modal-matrix.component';

describe('ModalMatrixComponent', () => {
  let component: ModalMatrixComponent;
  let fixture: ComponentFixture<ModalMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMatrixComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
