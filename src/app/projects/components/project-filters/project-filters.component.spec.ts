import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';
import {MaterialModule} from '../../../material.module';
import {IngestService} from '../../../shared/services/ingest.service';
import {OntologyService} from '../../../shared/services/ontology.service';
import {ProjectFiltersComponent} from './project-filters.component';
import createSpyObj = jasmine.createSpyObj;

describe('ProjectFiltersComponent', () => {
  let component: ProjectFiltersComponent;
  let fixture: ComponentFixture<ProjectFiltersComponent>;
  let mockIngestService, mockOntologyService;

  beforeEach(waitForAsync(() => {
    mockIngestService = createSpyObj<IngestService>('IngestService', ['getWranglers', 'getFilteredProjects']);
    mockIngestService.getFilteredProjects.and.returnValue(of());
    mockOntologyService = createSpyObj<OntologyService>('OntologyService', ['lookup']);
    mockOntologyService.lookup.and.returnValue(of());
    TestBed.configureTestingModule({
      declarations: [ProjectFiltersComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, MatFormFieldModule, FormsModule, MaterialModule, NoopAnimationsModule],
      providers: [
        {provide: IngestService, useValue: mockIngestService},
        {provide: OntologyService, useValue: mockOntologyService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });

  it('should hide clear button when searchText is empty', () => {
    expect(component.filtersForm.controls['search'].value)
      .toBe('');
    expect(fixture.nativeElement.querySelector('.search-bar button'))
      .toBeFalsy();
  });

  it('value in searchText should make clear button visible', () => {
    component.filtersForm.patchValue({ search: 'sample' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.search-bar button'))
      .toBeTruthy();
  });

  it('should call onClearSearch', () => {
    spyOn(component, 'onClearSearch');
    component.filtersForm.patchValue({ search: 'sample' });
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector('.search-bar button');
    clearButton.click();
    expect(component.onClearSearch)
      .toHaveBeenCalled();
  });

  it('#onClearSearch() should clear search text', () => {
    component.onClearSearch();
    expect(component.filtersForm.controls['search'].value)
      .toBe('');
    expect(fixture.nativeElement.querySelector('input').value)
      .toBe('');
  });


  it('should emit from filters when a value in the form changes', fakeAsync(() => {
    const FIELDS = ['search', 'searchType', 'wranglingState', 'primaryWrangler', 'wranglingPriority',
      'hasOfficialHcaPublication', 'minCellCount', 'maxCellCount', 'indentifyingOrganism', 'organOntology',
      'dataAccess'];
    spyOn(component.filtersChange, 'emit');

    FIELDS.forEach(field => {
      component.filtersForm.patchValue({[field]: 'test'});
      tick(500);
      expect(component.filtersChange.emit).toHaveBeenCalled();
    });
  }));

  it('should not emit when organSearchValue changes', fakeAsync(() => {
    // Need to patch the value of the form originally so that the second time the value is not emitted
    component.filtersForm.patchValue({ hasOfficialHcaPublication: true });
    tick(500);

    spyOn(component.filtersChange, 'emit');

    component.filtersForm.get('controlsForm').patchValue({ organSearchValue: 'test'});
    tick(500);
    expect(component.filtersChange.emit).not.toHaveBeenCalled();
  }));

  it('should add maxCellCount and minCellCount when filterByCellCount is enabled', fakeAsync(() => {
    component.filtersForm.get('controlsForm').patchValue({ filterByCellCount: true});
    tick(500);
    expect(component.filtersForm.controls.maxCellCount).toBeDefined();
    expect(component.filtersForm.controls.minCellCount).toBeDefined();
  }));

  it('should call the OLS service when organSearchValue changes', fakeAsync(() => {
    spyOn(component, 'fetchOrgans').and.callThrough();
    component.organs$.subscribe(() => {}); // noop to trigger actions in observable
    component.filtersForm.get('controlsForm').patchValue({ organSearchValue: 'test' });
    tick(500);
    expect(component.fetchOrgans).toHaveBeenCalledWith('test');
    expect(mockOntologyService.lookup).toHaveBeenCalled();
  }));
});
