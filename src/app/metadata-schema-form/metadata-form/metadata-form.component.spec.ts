import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MetadataFormService} from '../metadata-form.service';
import {JsonSchema} from '../models/json-schema';
import {MetadataForm} from '../models/metadata-form';
import {MetadataFormConfig} from '../models/metadata-form-config';
import {MetadataFormTab} from '../models/metadata-form-layout';
import {MetadataFormComponent} from './metadata-form.component';
import SpyObj = jasmine.SpyObj;

function getSchema() {
  return {
    'name': 'project'
  } as JsonSchema;
}

function getData() {
  return {
    content: null,
    admin: {
      key: 'value'
    }
  };
}

function createTab(title) {
  return {
    title: title,
    key: 'project.' + title,
    items: [
      'project.' + title
    ]
  } as MetadataFormTab;
}

function createMetadataFormConfig(tabs: MetadataFormTab[]) {
  return {
    viewMode: true,
    removeEmptyFields: true,
    layout: {
      tabs: tabs
    }
  } as MetadataFormConfig;
}

function createFormGroup() {
  return new FormGroup({
    x: new FormControl('', Validators.required),
    y: new FormControl('', Validators.required),
    z: new FormControl('', Validators.required),
  });
}

function createMetadataForm(tabs: MetadataFormTab[]): MetadataForm {
  return {
    key: 'test key',
    jsonSchema: getSchema(),
    config: createMetadataFormConfig(tabs),
    metadataRegistry: jasmine.createSpyObj('MetadataRegistry', ['buildMetadataRegistry']),
    formGroup: createFormGroup()
  } as MetadataForm;
}

describe('MetadataFormComponent', () => {
  let component: MetadataFormComponent;
  let fixture: ComponentFixture<MetadataFormComponent>;

  let metadataFormSvc: SpyObj<MetadataFormService>;

  const contentTab = createTab('content.contributors');
  const adminTab = createTab('admin');
  const tabs = [contentTab, adminTab];

  beforeEach(async(() => {
    metadataFormSvc = jasmine.createSpyObj('MetadataFormService', ['createForm']);
    metadataFormSvc.createForm.and.returnValue(createMetadataForm(tabs));
    TestBed.configureTestingModule({
      providers: [
        { provide: MetadataFormService, useValue: metadataFormSvc},
      ],
      declarations: [MetadataFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataFormComponent);
    component = fixture.componentInstance;
    component.schema = getSchema();
    component.data = getData();
    component.config = createMetadataFormConfig(tabs);
    component.selectedTabKey = 'content';
    component.visibleTabs = tabs;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('tabIsVisible should pass with null content', () => {
    expect(component.tabIsVisible(contentTab)).toBe(false);
  });
});
