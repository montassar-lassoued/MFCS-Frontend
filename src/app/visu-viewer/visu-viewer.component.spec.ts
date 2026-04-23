import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisuViewerComponent } from './visu-viewer.component';

describe('VisuViewerComponent', () => {
  let component: VisuViewerComponent;
  let fixture: ComponentFixture<VisuViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisuViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisuViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
