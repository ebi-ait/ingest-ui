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

    const data = {
      content: null,
      admin: {
        key: 'value'
      }
    };

    beforeEach(() => {
      configureFormAndSvc({config: config});
      formGroupSpy.getRawValue.and.returnValue(data);
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
      component.data = cleanTest;
    });

    const defaultBehaviourTest = test => {
      it(`cleanFields ${test.name} (default) behaviour: should send all data to be cleaned`, () => {
        // Given
        configureFormAndSvc({config: test.case});
        fixture.detectChanges();

        // When
        component.getFormData();

        // Then
        expect(metadataFormSvc.cleanFormData).toHaveBeenCalledOnceWith(cleanTest);
      });
    };

    [
      {name: 'undefined', case: {}},
      {name: 'null', case: {cleanFields: null}},
      {name: 'true', case: {cleanFields: true}}
    ].forEach(defaultBehaviourTest);

    const falseBehaviourTest = test => {
      it(`cleanFields ${test.name} (false) behaviour, should send no data to be cleaned`, () => {
        // Given
        configureFormAndSvc({config: test.case});
        fixture.detectChanges();

        // When
        component.getFormData();

        // Then
        expect(metadataFormSvc.cleanFormData).not.toHaveBeenCalled();
      });
    };

    [
      {name: 'false', case: {cleanFields: false}},
      {name: 'empty Array', case: {cleanFields: []}},
    ].forEach(falseBehaviourTest);

    it('cleanFields array behaviour, should send matching attributes to be cleaned', () => {
      // Given
      const unsetAttribute = cleanTest.unsetAttribute;
      const setObject = cleanTest.setObject;
      const testCase = {cleanFields: ['unsetAttribute', 'setObject']};
      configureFormAndSvc({config: testCase});
      fixture.detectChanges();

      // When
      component.getFormData();

      // Then
      expect(metadataFormSvc.cleanFormData).toHaveBeenCalledWith(unsetAttribute);
      expect(metadataFormSvc.cleanFormData).toHaveBeenCalledWith(setObject);
    });

    it('cleanFields array behaviour, should only send attributes to be cleaned if they exist', () => {
      // Given
      const testCase = {cleanFields: ['missingAttribute', 'unsetAttribute']};
      const unsetAttribute = cleanTest.unsetAttribute;
      configureFormAndSvc({config: testCase});
      fixture.detectChanges();

      // When
      component.getFormData();

      // Then
      expect(metadataFormSvc.cleanFormData).toHaveBeenCalledOnceWith(unsetAttribute);
    });
  });
});
