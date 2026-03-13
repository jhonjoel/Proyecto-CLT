import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReubicacionPvComponent } from './reubicacion-pv.component';

describe('ReubicacionPvComponent', () => {
  let component: ReubicacionPvComponent;
  let fixture: ComponentFixture<ReubicacionPvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReubicacionPvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReubicacionPvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
