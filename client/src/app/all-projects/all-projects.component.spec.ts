import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {AllProjectsComponent} from './all-projects.component';
import {IngestService} from '../shared/services/ingest.service';
import {of} from 'rxjs';
import createSpyObj = jasmine.createSpyObj;

describe('AllProjectsComponent', () => {
  let component: AllProjectsComponent;
  let fixture: ComponentFixture<AllProjectsComponent>;
  let mockIngestService;

  beforeEach(waitForAsync(() => {
    mockIngestService = createSpyObj<IngestService>('IngestService', {
      getWranglers: undefined,
      getFilteredProjects: of()
    });
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

  xit('should call getProjects when searchTypeChanges is called, dcp-386 ', fakeAsync(() => {
    spyOn(component, 'onChangeSearchType')
      .and
      .callThrough();

    fixture.detectChanges();

    // const select = fixture.debugElement.query(By.css('.search-type'));
    // select.nativeElement.value = 'AllKeywords';
    // select.triggerEventHandler('change', null);
    // fixture.detectChanges();
    //
    expect(component.dataSource)
      .toBeDefined();
    component.onChangeSearchType({source: null, value: 'AllKeywords'});
    tick();

    expect(component.onChangeSearchType)
      .toHaveBeenCalled();
    expect(mockIngestService.getFilteredProjects)
      .toHaveBeenCalled();
    expect(mockIngestService.getFilteredProjects)
      .toHaveBeenCalledWith({searchType: 'MustFail'});
  }));

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
