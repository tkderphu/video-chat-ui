import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameVideoComponent } from './frame-video.component';

describe('FrameVideoComponent', () => {
  let component: FrameVideoComponent;
  let fixture: ComponentFixture<FrameVideoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FrameVideoComponent]
    });
    fixture = TestBed.createComponent(FrameVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
