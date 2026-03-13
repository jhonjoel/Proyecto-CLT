import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMatrixDuplicarComponent } from './modal-matrix-duplicar.component';

describe('ModalMatrixDuplicarComponent', () => {
  let component: ModalMatrixDuplicarComponent;
  let fixture: ComponentFixture<ModalMatrixDuplicarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMatrixDuplicarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMatrixDuplicarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
