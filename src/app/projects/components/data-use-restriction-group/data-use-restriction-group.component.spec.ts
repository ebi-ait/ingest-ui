import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {ReactiveFormsModule, FormBuilder} from '@angular/forms';
import { DataUseRestrictionGroupComponent } from './data-use-restriction-group.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import {MetadataForm} from '@metadata-schema-form/models/metadata-form';

describe('DataUseRestrictionGroupComponent', () => {
  let component: DataUseRestrictionGroupComponent;
  let fixture: ComponentFixture<DataUseRestrictionGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataUseRestrictionGroupComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'additionalProperties': false,
      'description': 'A ingest project entity contains information about the ingestion of the project.',
      'name': 'project',
      'properties': {
        'identifyingOrganisms': {
          'description': 'Organism the samples were generated from',
          'guidelines': 'You can select multiple entries',
          'type': 'array',
          'items': {
            'type': 'string'
          },
          'enum': [
            'Human',
            'Mouse',
            'Other'
          ],
          'user_friendly': 'Organism the samples were generated from'
        },
        'content': {
          '$id': 'https://schema.dev.data.humancellatlas.org/type/project/19.0.0/project',
          '$schema': 'http://json-schema.org/draft-07/schema#',
          'additionalProperties': false,
          'description': 'A project entity contains information about the overall project.',
          'name': 'project',
          'type': 'object',
          'properties': {
            'project_core': {
              '$schema': 'http://json-schema.org/draft-07/schema#',
              '$id': 'http://schema.dev.data.humancellatlas.org/core/project/7.0.5/project_core',
              'description': 'Information about the project.',
              'additionalProperties': false,
              'required': [
                'project_short_name'
              ],
              'title': 'Project core',
              'name': 'project_core',
              'type': 'object',
              'properties': {
                'project_short_name': {
                  'description': 'A short name for the project.',
                  'type': 'string',
                  'example': 'CoolOrganProject.',
                  'user_friendly': 'Project label'
                }
              }
            },
            "data_use_restriction": {
              "description": "Data use restrictions that apply to the project.",
              "type": "string",
              "enum": [
                "NRES",
                "GRU",
                "GRU-NCU"
              ],
              "user_friendly": "Data use restriction",
              "guidelines": "Must be one of: NRES, GRU, GRU-NCU. The use restriction codes are based on the DUO ontology where NRES corresponds to DUO:0000004, GRU corresponds to DUO:0000042, GRU-NCU corresponds to a combination of DUO:0000042 and DUO:0000046",
              "example": "GRU"
            },
            "duos_id": {
              "description": "A DUOS dataset id.",
              "type": "string",
              "pattern": "^DUOS-\\d{6}$",
              "example": "DUOS-000108; DUOS-000114",
              "user_friendly": "DUOS ID",
              "guidelines": "Managed access projects are registered in DUOS to regulate access. If the project is managed access record the corresponding DUOS ID here."
            }
          }
        }
      },
      'required': [],
      'title': 'Ingest Project',
      'type': 'object',
      '$id': ''
    };

    const metadataForm = new MetadataForm('project', schema);
    fixture = TestBed.createComponent(DataUseRestrictionGroupComponent);
    component = fixture.componentInstance;
    component.metadataForm = metadataForm;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('duosIdCtrl enabled/disabled based on data_use_restriction value', () => {

    it('should enable duosIdCtrl when data_use_restriction is GRU', () => {
      component.dataUseRestrictionControl.setValue('GRU');
      expect(component.duosIdControl.enabled).toBeTrue();
    });

    it('should enable duosIdCtrl when data_use_restriction is GRU-NCU', () => {
      component.dataUseRestrictionControl.setValue('GRU-NCU');
      expect(component.duosIdControl.enabled).toBeTrue();
    });

    it('should disable duosIdCtrl when data_use_restriction is NRES', () => {
      component.dataUseRestrictionControl.setValue('NRES');
      expect(component.duosIdControl.disabled).toBeTrue();
    });

    it('should reset duosIdControl when data_use_restriction is NRES', () => {
      component.dataUseRestrictionControl.setValue('GRU');
      component.duosIdControl.setValue('DUOS-123456');
      component.dataUseRestrictionControl.setValue('NRES');
      expect(component.duosIdControl.value).toBeNull();
    });

    it('should add duosIdControl to the metadataForm when data_use_restriction is GRU', () => {
      component.dataUseRestrictionControl.setValue('NRES');
      expect(component.duosIdControl.disabled).toBeTrue();
      component.dataUseRestrictionControl.setValue('GRU');
      expect(component.duosIdControl.enabled).toBeTrue();
    });

    it('should add duosIdControl to the metadataForm when data_use_restriction is GRU-NCU', () => {
      component.dataUseRestrictionControl.setValue('NRES');
      expect(component.duosIdControl.disabled).toBeTrue();
      component.dataUseRestrictionControl.setValue('GRU-NCU');
      expect(component.duosIdControl.enabled).toBeTrue();
    });
  });

  describe('duosIdCtrl validators', () => {

    let duosIdControl;

    beforeEach(() => {
      duosIdControl = component.duosIdControl;
      duosIdControl.enable(); // Make sure control is enabled for validation tests
    });

    it('should be invalid with a non-matching pattern', () => {
      duosIdControl.setValue('invalid');
      expect(duosIdControl.valid).toBeFalse();
    });

    it('should be valid with a correctly formatted DUOS ID', () => {
      duosIdControl.setValue('DUOS-123456');
      expect(duosIdControl.valid).toBeTrue();
    });

  });

  describe('DataUseRestrictionGroupComponent with ignoreExample', () => {
    function initializeFormControls(ignoreExample: boolean) {
      // Simulate initializing form controls based on ignoreExample
      component.ignoreExample = ignoreExample;
      component.ngOnInit();

      const exampleValue = ignoreExample ? null : 'GRU';
      component.dataUseRestrictionControl.setValue(exampleValue);
    }

    it('should default to null when ignoreExample is true', () => {
      initializeFormControls(true);
      expect(component.dataUseRestrictionControl.value).toBeNull();
    });

    it('should default to the example value when ignoreExample is false', () => {
      initializeFormControls(false);
      expect(component.dataUseRestrictionControl.value).toEqual('GRU');
    });

  });

});
