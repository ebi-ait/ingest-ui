import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {By} from "@angular/platform-browser";

import {AllProjectsComponent} from './all-projects.component';
import {IngestService} from '../shared/services/ingest.service';
import {of} from 'rxjs';
import createSpyObj = jasmine.createSpyObj;

describe('AllProjectsComponent', () => {
  let component: AllProjectsComponent;
  let fixture: ComponentFixture<AllProjectsComponent>;
  let mockIngestService;

  beforeEach(waitForAsync(() => {
    mockIngestService = createSpyObj<IngestService>('IngestService', ['getWranglers', 'getFilteredProjects']);
    mockIngestService.getFilteredProjects.and.returnValue(of());
    TestBed.configureTestingModule({
                                     declarations: [AllProjectsComponent],
                                     providers: [{provide: IngestService, useValue: mockIngestService}]
                                   })
           .compileComponents();
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

  it('should hide clear button when searchText is empty', () => {
    expect(component.searchText)
      .toBe('');
    expect(fixture.nativeElement.querySelector('button'))
      .toBeFalsy();
  });

  it('value in searchText should make clear button visible', () => {
    component.searchText = 'sample search text';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button'))
      .toBeTruthy();
  });

  it('should call onClearSearch', fakeAsync(() => {
    spyOn(component, 'onClearSearch');
    component.searchText = 'sample search text';
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector('button');
    clearButton.click();
    tick();
    expect(component.onClearSearch)
      .toHaveBeenCalled();
  }));

  it('should call getProjects when searchTypeChanges is called, dcp-386 ', (done) => {
    spyOn(component, 'onChangeSearchType')
      .and
      .callThrough();

    const select = fixture.debugElement.query(By.css('.search-type'));
    select.triggerEventHandler('selectionChange', { source: null, value: 'AllKeywords' });
    expect(component.onChangeSearchType).toHaveBeenCalled();

    setTimeout(() => {
      // Messy solution: Works by removing this expectation to the task queue so that it is executed after everything
      // else has finished
      expect(mockIngestService.getFilteredProjects)
        .toHaveBeenCalledWith({ page: 0, size: 20, sort: 'updateDate,desc', searchType: 'AllKeywords' });
      done();
    }, 0);
  });

  it('#onClearSearch() should clear search text', () => {
    component.onClearSearch();
    expect(component.searchText)
      .toBe('');
    expect(fixture.nativeElement.querySelector('input').value)
      .toBe('');
  });
});

class MockIngestService {
  getWranglers() {
  }

  getFilteredProjects() {
    return of([{}]);
  }
}
