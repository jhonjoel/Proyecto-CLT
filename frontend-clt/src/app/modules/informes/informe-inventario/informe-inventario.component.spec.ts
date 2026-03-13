import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformeInventarioComponent } from './informe-inventario.component';

describe('InformeInventarioComponent', () => {
  let component: InformeInventarioComponent;
  let fixture: ComponentFixture<InformeInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformeInventarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InformeInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
