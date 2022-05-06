import { ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from "@angular/router/testing";
import {AlertService} from "@shared/services/alert.service";

import { DataSubmissionGuideComponent } from './data-submission-guide.component';

describe('DataSubmissionGuideComponent', () => {
  let component: DataSubmissionGuideComponent;
  let fixture: ComponentFixture<DataSubmissionGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSubmissionGuideComponent ],
      providers: [ AlertService ],
      imports: [ RouterTestingModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSubmissionGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
