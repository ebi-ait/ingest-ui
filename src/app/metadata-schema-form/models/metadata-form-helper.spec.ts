import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {MetadataFormService} from '../metadata-form.service';
import * as jsonSchema from '../test-json-files/test-json-schema.json';
import {JsonSchema} from './json-schema';
import {JsonSchemaProperty} from './json-schema-property';
import {Metadata} from './metadata';
import {MetadataFormHelper} from './metadata-form-helper';
import {MetadataRegistry} from './metadata-registry';
import {SchemaHelper} from './schema-helper';

describe('MetadataFormHelper', () => {

  let metadataFormHelper: MetadataFormHelper;
  let metadataFormSvc: MetadataFormService;
  let testSchema: JsonSchema;
  let metadataRegistry: MetadataRegistry;

  beforeEach(() => {
    testSchema = (jsonSchema as any).default;
    metadataFormHelper = new MetadataFormHelper({});
    metadataFormSvc = new MetadataFormService();
    metadataRegistry = new MetadataRegistry('project', testSchema);
  });

  it('should be created', () => {
    expect(metadataFormHelper).toBeTruthy();
  });

  describe('toFormGroup', () => {
    it('return a FormGroup object', () => {
      // given testSchema
      const metadata = metadataRegistry.get('project');
      // when
      const formGroup = metadataFormHelper.toFormGroup(metadata);

      // then
      expect(formGroup).toBeTruthy();
      expect(formGroup.get('array_express_accessions') instanceof FormArray).toEqual(true);
      expect(formGroup.get('schema_type') instanceof FormControl).toEqual(true);
      expect(formGroup.get('contributors') instanceof FormArray).toEqual(true);
      expect(formGroup.get('project_core') instanceof FormGroup).toEqual(true);
    });


    it('return a FormGroup object with initialised data', () => {
      // given
      const schema = SchemaHelper.getProperty('contributors', testSchema).items as JsonSchema;
      const data = {
        'name': 'Nathan Smith',
        'institution': 'MRCN',
        'corresponding_contributor': false
      };
      // when
      const metadata = metadataRegistry.get('project.contributors');
      const formGroup = metadataFormHelper.toFormGroup(metadata.itemMetadata, data);

      // then
      expect(formGroup instanceof FormGroup).toEqual(true);
      expect(Object.keys(formGroup.controls).length).toEqual(12);
      expect(formGroup.controls['name'] instanceof FormControl).toEqual(true);
      expect(metadataFormSvc.cleanFormData(formGroup.value)).toEqual(data);
    });

  });

  describe('toFormControl', () => {
    it('return a toFormControl object', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: false
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field);

      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual(undefined);
      expect(formControl.validator).toEqual(null);
    });

    it('return a toFormControl object with undefined value and validator', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field);
      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual(undefined);
      expect(formControl.validator).toEqual(Validators.required);
    });

    it('return a toFormControl object with string data', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field, 'string');

      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual('string');
    });

    it('return a toFormControl object with blank string', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field, '');

      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual('');
    });

    it('return a toFormControl object with empty array', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field, []);

      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual([]);
    });

    it('return a toFormControl object with empty object', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field, {});

      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual({});
    });

    it('return a toFormControl object with number data', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field, 100);

      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual(100);
    });

    it('return a toFormControl object with boolean data', () => {
      // given
      const field: Metadata = new Metadata({
        schema: undefined,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formControl = metadataFormHelper.toFormControl(field, false);

      // then
      expect(formControl instanceof FormControl).toEqual(true);
      expect(formControl.value).toEqual(false);
    });
  });

  describe('toFormGroupArray', () => {
    it('return a FormArray of FormGroup', () => {
      // given
      const schema = SchemaHelper.getProperty('contributors', testSchema);

      // when
      const metadata = metadataRegistry.get('project.contributors');
      const formArray = metadataFormHelper.toFormGroupArray(metadata, undefined);

      // then
      expect(formArray instanceof FormArray).toEqual(true);
      expect(formArray.controls[0] instanceof FormGroup).toEqual(false);
      expect(metadataFormSvc.cleanFormData(formArray.value)).toEqual(null);
    });

    it('return a FormArray of FormGroup with data', () => {
      // given
      const schema = SchemaHelper.getProperty('contributors', testSchema);
      const data = [
        {
          'name': 'Nathan Smith',
          'institution': 'MRCN',
          'corresponding_contributor': false
        },
        {
          'name': 'Jules-Pierre Mao',
          'institution': 'Protogen',
          'corresponding_contributor': false
        },
        {
          'name': 'Lawrence Strickland',
          'institution': 'Protogen',
          'corresponding_contributor': true
        }
      ];
      // when
      const metadata = metadataRegistry.get('project.contributors');
      const formArray = metadataFormHelper.toFormGroupArray(metadata, data);

      // then
      expect(formArray instanceof FormArray).toEqual(true);
      expect(formArray.controls[0] instanceof FormGroup).toEqual(true);
      expect(metadataFormSvc.cleanFormData(formArray.value)).toEqual(data);
    });
  });

  describe('toFormControlArray', () => {
    it('return a FormArray of FormControl', () => {
      // given
      const schema = SchemaHelper.getProperty('insdc_study_accessions', testSchema);
      const field: Metadata = new Metadata({
        schema: schema,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });

      // when
      const formArray = metadataFormHelper.toFormControlArray(field, undefined);

      // then
      expect(formArray instanceof FormArray).toEqual(true);
      expect(formArray.controls.length).toEqual(0);
    });

    it('return a FormArray of FormControl with initialised data', () => {
      // given
      const schema = SchemaHelper.getProperty('insdc_study_accessions', testSchema);
      const field: Metadata = new Metadata({
        schema: schema,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });
      const data = ['string1', 'string2', 'string3'];
      // when
      const formArray = metadataFormHelper.toFormControlArray(field, data);

      // then
      expect(formArray instanceof FormArray).toEqual(true);
      expect(formArray.controls[0] instanceof FormControl).toEqual(true);
      expect(metadataFormSvc.cleanFormData(formArray.value)).toEqual(data);
    });

    it('return a FormArray of FormControl with initialised boolean data array', () => {
      // given
      const schema = {
        'description': '',
        'example': '',
        'guidelines': '',
        'items': {
          'type': 'boolean'
        },
        'type': 'array',
        'user_friendly': ''
      } as JsonSchemaProperty;

      const field: Metadata = new Metadata({
        schema: schema,
        key: 'project',
        isRequired: true,
        isDisabled: true,
        isHidden: true
      });
      const data = [false, false, false];
      // when
      const formArray = metadataFormHelper.toFormControlArray(field, data);

      // then
      expect(formArray instanceof FormArray).toEqual(true);
      expect(formArray.controls[0] instanceof FormControl).toEqual(true);
      expect(metadataFormSvc.cleanFormData(formArray.value)).toEqual(data);
    });
  });
});
