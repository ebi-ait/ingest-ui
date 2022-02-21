import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MetadataDocument} from "@shared/models/metadata-document";

import {ProcessNodeDetailsComponent} from './process-node-details.component';

describe('ProcessNodeDetailsComponent', () => {
  let component: ProcessNodeDetailsComponent;
  let fixture: ComponentFixture<ProcessNodeDetailsComponent>;
  let metadata: MetadataDocument;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessNodeDetailsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessNodeDetailsComponent);
    component = fixture.componentInstance;
    metadata = {
      _links: undefined,
      dcpVersion: '',
      events: [],
      isUpdate: false,
      lastModifiedUser: '',
      submissionDate: '',
      type: '',
      updateDate: '',
      uuid: {uuid: 'uuid'},
      validationErrors: [],
      validationState: '',
      content: {
        'id': 'id',
        'name': 'name',
        'description': 'desc'
      }
    }

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set attributes', () => {
    component.metadata = metadata;
    component.idPath = 'content.id';
    component.namePath = 'content.name';
    component.descriptionPath = 'content.description';

    fixture.detectChanges();
    expect(component.id).toEqual('id')
    expect(component.name).toEqual('name')
    expect(component.description).toEqual('desc')
  });

  it('should not set attributes when paths not given', () => {
    component.metadata = metadata;
    component.idPath = undefined;
    component.namePath = undefined;
    fixture.detectChanges();
    expect(component.id).toEqual(undefined)
    expect(component.name).toEqual(undefined)
    expect(component.description).toEqual(undefined)
  });

  it('should create when path is given but path is missing in the object', () => {
    component.metadata = {} as MetadataDocument;
    component.idPath = 'content.id';
    component.namePath = 'content.name';
    component.descriptionPath = 'content.description'
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.id).toEqual(undefined)
    expect(component.name).toEqual(undefined)
    expect(component.description).toEqual(undefined)
  });
});
