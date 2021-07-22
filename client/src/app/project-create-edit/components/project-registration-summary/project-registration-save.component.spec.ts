import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRegistrationSaveComponent } from './project-registration-save.component';

describe('ProjectRegistrationSummaryComponent', () => {
  let component: ProjectRegistrationSaveComponent;
  let fixture: ComponentFixture<ProjectRegistrationSaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectRegistrationSaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectRegistrationSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
