import { TestBed } from '@angular/core/testing';

import { Crd1GetService } from './crd1-get.service';

describe('Crd1GetService', () => {
  let service: Crd1GetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Crd1GetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
