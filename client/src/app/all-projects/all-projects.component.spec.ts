import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { AllProjectsComponent } from './all-projects.component';
import {IngestService} from '../shared/services/ingest.service';

describe('AllProjectsComponent', () => {
  let component: AllProjectsComponent;
  let fixture: ComponentFixture<AllProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllProjectsComponent],
      providers: [ IngestService ]
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

  it('should call onClearSearch', fakeAsync(() => {
    spyOn(component, 'onClearSearch');
    const button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    tick();
    expect(component.onClearSearch).toHaveBeenCalled();
  }));

  it('#onClearSearch() should clear search text', () => {
    component.onClearSearch();
    expect(component.searchText).toBe('');
  });
});
