import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl} from '@angular/forms';
import {MetadataForm} from '@metadata-schema-form/models/metadata-form';

import {ExperimentDetailGroupComponent} from './experiment-detail-group.component';

describe('ExperimentGroupComponent', () => {
  let component: ExperimentDetailGroupComponent;
  let fixture: ComponentFixture<ExperimentDetailGroupComponent>;
  let metadataFormSpy: jasmine.SpyObj<MetadataForm>;

  beforeEach(async(() => {
    const control = new FormControl();
    control.setValue([]);
    metadataFormSpy = jasmine.createSpyObj(['getControl', 'get']) as jasmine.SpyObj<MetadataForm>;
    metadataFormSpy.getControl.and.returnValue(control);

    TestBed.configureTestingModule({
      declarations: [ExperimentDetailGroupComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentDetailGroupComponent);
    component = fixture.componentInstance;
    component.metadataForm = metadataFormSpy;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
