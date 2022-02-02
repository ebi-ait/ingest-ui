import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MetadataFormService} from '../metadata-form.service';
import {JsonSchema} from '../models/json-schema';
import {MetadataForm} from '../models/metadata-form';
import {MetadataFormConfig} from '../models/metadata-form-config';
import {MetadataFormTab} from '../models/metadata-form-layout';
import {MetadataFormComponent} from './metadata-form.component';
import {MetadataRegistry} from '@metadata-schema-form/models/metadata-registry';

describe('MetadataFormComponent', () => {
  let component: MetadataFormComponent;
  let fixture: ComponentFixture<MetadataFormComponent>;

  let metadataFormSvc;
  let metadataRegistrySpy;
  let formGroupSpy;

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
                                 config = {}
                               }: metadataFormDependencies) {
    if (!config.layout) {
      config.layout = {tabs: [createTab('tab')]};
    }
    if (!config.layout.tabs) {
      config.layout.tabs = [createTab('tab')];
    }
    const form = {
      key: key,
      jsonSchema: schema as JsonSchema,
      config: config as MetadataFormConfig,
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
    metadataFormSvc = jasmine.createSpyObj('MetadataFormService', ['createForm', 'cleanFormData']);
    metadataRegistrySpy = jasmine.createSpyObj('MetadataRegistry', ['buildMetadataRegistry']);
    formGroupSpy = jasmine.createSpyObj('FormGroup', ['getRawValue', 'valueChanges'], ['valid']);
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
      component.data = data;
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
    });

    function setupCleanAttributesTest(config: MetadataFormConfig) {
      configureFormAndSvc({config: config});
      component.data = cleanTest;
      fixture.detectChanges();

      component.getFormData();
    }

    const defaultBehaviourTest = test => {
      it(`cleanAttributes ${test.name} (default) behaviour: send all data to be cleaned`, () => {
        setupCleanAttributesTest(test.value);

        expect(metadataFormSvc.cleanFormData).toHaveBeenCalledOnceWith(cleanTest);
      });
    };

    [
      {name: 'undefined', value: {}},
      {name: 'null', value: {cleanAttributes: null}},
      {name: 'true', value: {cleanAttributes: true}}
    ].forEach(defaultBehaviourTest);

    const falseBehaviourTest = test => {
      it(`cleanAttributes ${test.name} (false) behaviour, send no data to be cleaned`, () => {
        setupCleanAttributesTest(test.value);

        expect(metadataFormSvc.cleanFormData).not.toHaveBeenCalled();
      });
    };

    [
      {name: 'false', value: {cleanAttributes: false}},
      {name: 'empty Array', value: {cleanAttributes: []}},
    ].forEach(falseBehaviourTest);

    it('cleanAttributes array behaviour, send matching attributes to be cleaned', () => {
      setupCleanAttributesTest({cleanAttributes: ['unsetAttribute', 'setObject']});

      expect(metadataFormSvc.cleanFormData).toHaveBeenCalledWith([cleanTest.unsetAttribute, cleanTest.setObject]);
    });
  });
});
