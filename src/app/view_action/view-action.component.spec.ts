import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewActionComponent } from './view-action.component';

describe('ViewActionComponent', () => {
  let component: ViewActionComponent;
  let fixture: ComponentFixture<ViewActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
