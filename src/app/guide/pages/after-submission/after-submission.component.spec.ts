import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterSubmissionComponent } from './after-submission.component';

describe('AfterSubmissionComponent', () => {
  let component: AfterSubmissionComponent;
  let fixture: ComponentFixture<AfterSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AfterSubmissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AfterSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
