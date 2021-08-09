import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { AllProjectsComponent } from './all-projects.component';
import {IngestService} from '../shared/services/ingest.service';

describe('AllProjectsComponent', () => {
  let component: AllProjectsComponent;
  let fixture: ComponentFixture<AllProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllProjectsComponent],
      providers: [ { provide: IngestService, useClass: MockIngestService } ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide clear button when searchText is empty', () => {
    expect(component.searchText).toBe('');
    expect(fixture.nativeElement.querySelector('button')).toBeFalsy();
  });

  it('value in searchText should make clear button visible', () => {
    component.searchText = 'sample search text';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('should call onClearSearch', fakeAsync(() => {
    spyOn(component, 'onClearSearch');
    component.searchText = 'sample search text';
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector('button');
    clearButton.click();
    tick();
    expect(component.onClearSearch).toHaveBeenCalled();
  }));

  it('#onClearSearch() should clear search text', () => {
    component.onClearSearch();
    expect(component.searchText).toBe('');
    expect(fixture.nativeElement.querySelector('input').value).toBe('');
  });
});

class MockIngestService {
  getWranglers() {}

  getFilteredProjects() {}
}
