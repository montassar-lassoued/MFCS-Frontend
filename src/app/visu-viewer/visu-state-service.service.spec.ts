import { TestBed } from '@angular/core/testing';

import { VisuStateServiceService } from './visu-state-service.service';

describe('VisuStateServiceService', () => {
  let service: VisuStateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisuStateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
