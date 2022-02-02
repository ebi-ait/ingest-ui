import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MetadataFormService} from '../metadata-form.service';
import {JsonSchema} from '../models/json-schema';
import {MetadataForm} from '../models/metadata-form';
import {MetadataFormConfig} from '../models/metadata-form-config';
import {MetadataFormTab} from '../models/metadata-form-layout';
import {MetadataFormComponent} from './metadata-form.component';

describe('MetadataFormComponent', () => {
  let component: MetadataFormComponent;
  let fixture: ComponentFixture<MetadataFormComponent>;

  const metadataFormSvc = jasmine.createSpyObj('MetadataFormService', ['createForm', 'cleanFormData']);
  const metadataRegistrySpy = jasmine.createSpyObj('MetadataRegistry', ['buildMetadataRegistry']);
  const formGroupSpy = jasmine.createSpyObj('FormGroup', ['getRawValue', 'valueChanges'], ['valid']);

  interface metadataFormDependencies {
    key?: string;
    schema?: JsonSchema;
    config?: MetadataFormConfig;
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

  function configureFormAndSvc({
                                 key = 'test key',
                                 schema = {'name': 'project'} as JsonSchema,
                                 config = {layout: {tabs: [createTab('tab')]}}
                               }: metadataFormDependencies) {
    const form = {
      key: key,
      jsonSchema: schema as JsonSchema,
      config: config,
      metadataRegistry: metadataRegistrySpy,
      formGroup: formGroupSpy
    } as MetadataForm;
    metadataFormSvc.createForm.and.returnValue(form);
    component.form = form;
    component.formGroup = formGroupSpy;
    component.schema = schema;
    component.config = config;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: MetadataFormService, useValue: metadataFormSvc},
      ],
      declarations: [MetadataFormComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(MetadataFormComponent);
    component = fixture.componentInstance;
    spyOn(component, 'onFormChange');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tab tests', () => {
    const contentTab = createTab('content.contributors');
    const adminTab = createTab('admin');
    const tabs = [contentTab, adminTab];

    const config = {
      viewMode: true,
      hideEmptyFields: true,
      layout: {
        tabs: tabs
      }
    } as MetadataFormConfig;

    const schema = {
      'name': 'project'
    } as JsonSchema;

    const data = {
      content: null,
      admin: {
        key: 'value'
      }
    };

    beforeEach(() => {
      configureFormAndSvc({schema: schema, config: config});
      component.schema = schema;
      component.data = data;
      component.config = config;
      component.selectedTabKey = 'content';
      component.visibleTabs = tabs;
      fixture.detectChanges();
    });

    it('tabIsVisible should pass with null content', () => {
      expect(component.tabIsVisible(contentTab)).toBe(false);
    });
  });

  describe('cleanFormData tests', () => {
    const cleanTest = {
      unsetAttribute: null,
      setAttribute: 'value',
      unsetObject: {},
      setObject: {
        unsetObjectAttribute: null,
        setObjectAttribute: 'objectValue'
      }
    };

    beforeEach(() => {
      formGroupSpy.getRawValue.and.returnValue(cleanTest);
      formGroupSpy.valid = true;

      configureFormAndSvc({});
      component.data = cleanTest;

      fixture.detectChanges();
    });

    it('cleanAttributes default behaviour, clean all attributes', () => {
      component.getFormData();

      expect(metadataFormSvc.cleanFormData).toHaveBeenCalledOnceWith(cleanTest);
    });

  });
});
