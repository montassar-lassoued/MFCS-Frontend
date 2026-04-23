import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let service: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
