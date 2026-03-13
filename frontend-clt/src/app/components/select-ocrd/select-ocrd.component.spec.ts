import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOcrdComponent } from './select-ocrd.component';

describe('SelectOcrdComponent', () => {
  let component: SelectOcrdComponent;
  let fixture: ComponentFixture<SelectOcrdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectOcrdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectOcrdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
