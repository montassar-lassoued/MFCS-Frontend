import { TestBed } from '@angular/core/testing';

import { ViewActionService } from './view-action.service';

describe('ViewActionService', () => {
  let service: ViewActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
