import { TestBed } from '@angular/core/testing';

import { VisuDataService } from './visu-data.service';

describe('VisuDataService', () => {
  let service: VisuDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisuDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
