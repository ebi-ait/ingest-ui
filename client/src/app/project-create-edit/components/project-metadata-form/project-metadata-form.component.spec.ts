import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMetadataFormComponent } from './project-metadata-form.component';

describe('ProjectMetadataFormComponent', () => {
  let component: ProjectMetadataFormComponent;
  let fixture: ComponentFixture<ProjectMetadataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectMetadataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMetadataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
