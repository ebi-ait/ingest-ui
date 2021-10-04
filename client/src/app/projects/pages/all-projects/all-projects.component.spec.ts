import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';
import {MaterialModule} from '../../../material.module';
import {IngestService} from '../../../shared/services/ingest.service';
import {ProjectFiltersComponent} from '../../components/project-filters/project-filters.component';

import {AllProjectsComponent} from './all-projects.component';
import createSpyObj = jasmine.createSpyObj;

describe('AllProjectsComponent', () => {
  let component: AllProjectsComponent;
  let fixture: ComponentFixture<AllProjectsComponent>;
  let mockIngestService;

  beforeEach(waitForAsync(() => {
    mockIngestService = createSpyObj<IngestService>('IngestService', ['getWranglers', 'getFilteredProjects']);
    mockIngestService.getFilteredProjects.and.returnValue(of());
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, MatFormFieldModule, FormsModule, MaterialModule, NoopAnimationsModule],
      declarations: [AllProjectsComponent, ProjectFiltersComponent],
      providers: [{provide: IngestService, useValue: mockIngestService}]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });

  it('should call getProjects when onFilter is called, dcp-386 ', (done) => {
    spyOn(component, 'onFilter')
      .and
      .callThrough();
    spyOn(component, 'getProjects').and.callThrough();
    component.ngOnInit();

    const filters = {
      searchType: 'AllKeywords',
      organOntology: 'AN_ONTOLOGY'
    };
    const filtersComponent: ProjectFiltersComponent = fixture.debugElement.query(By.directive(ProjectFiltersComponent)).componentInstance;
    filtersComponent.filtersChange.emit(filters);
    fixture.detectChanges();

    setTimeout(() => {
      // Messy solution: Works by moving this expectation to the task queue so that it is executed after everything
      // else has finished
      expect(component.onFilter).toHaveBeenCalled();
      expect(component.getProjects)
        .toHaveBeenCalled();
      expect(mockIngestService.getFilteredProjects)
        .toHaveBeenCalledWith({ page: 0, size: 20, sort: 'updateDate,desc', ...filters });
      done();
    }, 0);
  });
});
