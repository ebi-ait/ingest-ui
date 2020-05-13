import {OntologyInputComponent} from './ontology-input.component';
import {OntologyService} from '../../../services/ontology.service';
import {Metadata} from '../../metadata';
import {JsonSchemaProperty} from '../../json-schema-property';
import {JsonSchema} from '../../json-schema';
import {AbstractControl} from '@angular/forms';
import {MetadataFormHelper} from '../../metadata-form-helper';
import {MetadataFormService} from '../../metadata-form.service';
import {OlsHttpResponse} from '../../../models/ols';
import {Ontology} from './ontology';
import {of} from 'rxjs';

describe('OntologyInputComponent', () => {
  let olsSvc: jasmine.SpyObj<OntologyService>;
  let metadata: Metadata;
  let control: AbstractControl;
  let helper: MetadataFormHelper;
  let schema: JsonSchema;
  let metadataSvc: MetadataFormService;
  let olsResponse: OlsHttpResponse;

  beforeEach(() => {
    olsSvc = jasmine.createSpyObj(['select']);
    schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      '$id': 'https://schema.dev.data.humancellatlas.org/module/ontology/1.0.0/contributor_role_ontology',
      'description': 'A term that describes the role of a contributor in the project.',
      'additionalProperties': false,
      'required': [
        'text'
      ],
      'title': 'Contributor role ontology',
      'name': 'contributor_role_ontology',
      'type': 'object',
      'properties': {
        'describedBy': {
          'description': 'The URL reference to the schema.',
          'pattern': '^(http|https)://schema.(.*?)humancellatlas.org/module/ontology/(([0-9]{1,}.[0-9]{1,}.[0-9]{1,})|([a-zA-Z]*?))/contributor_role_ontology',
          'type': 'string'
        },
        'schema_version': {
          'description': 'Version number in major.minor.patch format.',
          'type': 'string',
          'pattern': '^[0-9]{1,}.[0-9]{1,}.[0-9]{1,}$',
          'example': '4.6.1'
        },
        'text': {
          'description': 'The primary role of the contributor in the project.',
          'type': 'string',
          'example': 'principal investigator; experimental scientist',
          'user_friendly': 'Contributor role'
        },
        'ontology': {
          'description': 'An ontology term identifier in the form prefix:accession.',
          'type': 'string',
          'graph_restriction': {
            'ontologies': [
              'obo:efo'
            ],
            'classes': [
              'EFO:0002012'
            ],
            'relations': [
              'rdfs:subClassOf'
            ],
            'direct': false,
            'include_self': false
          },
          'example': 'EFO:0009736; EFO:0009741',
          'user_friendly': 'Contributor role ontology ID'
        },
        'ontology_label': {
          'description': 'The preferred label for the ontology term referred to in the ontology field. This may differ from the user-supplied value in the text field.',
          'type': 'string',
          'example': 'principal investigator; experimental scientist',
          'user_friendly': 'Contributor role ontology label'
        }
      }
    };
    metadata = new Metadata({
      schema: schema as JsonSchemaProperty,
      key: 'project_role',
      isRequired: false
    });
    helper = new MetadataFormHelper();
    metadataSvc = new MetadataFormService();
    control = helper.toFormGroup(schema);
    const response = {
      'numFound': 1,
      'start': 0,
      'docs': [
        {
          'id': 'efo:class:http://www.ebi.ac.uk/efo/EFO_0009736',
          'iri': 'http://www.ebi.ac.uk/efo/EFO_0009736',
          'short_form': 'EFO_0009736',
          'obo_id': 'EFO:0009736',
          'label': 'principal investigator',
          'ontology_name': 'efo',
          'ontology_prefix': 'EFO',
          'type': 'class'
        }
      ]
    };
    olsResponse = {highlighting: [], response: response, responseHeader: undefined};

  });

  it('should instantiate', () => {
    const component = new OntologyInputComponent(olsSvc);
    expect(component).toBeDefined();
  });

  describe('onInit', () => {
    it('should initialise attributes based on metadata and control', () => {
      // given
      const component = new OntologyInputComponent(olsSvc);
      component.metadata = metadata;
      component.control = control;

      // when
      component.ngOnInit();

      // then
      expect(component.label).toEqual('project_role');
      expect(component.helperText).toEqual(schema['description']);
      expect(component.isRequired).toEqual(metadata.isRequired);
      expect(component.searchParams).toEqual({
        groupField: 'iri',
        start: 0,
        ontology: 'efo',
        allChildrenOf: 'http://www.ebi.ac.uk/efo/EFO_0002012'
      });
      expect(component.searchControl.value).toEqual('');
      expect(component.searchControl.disabled).toEqual(metadata.isDisabled);
    });
  });

  describe('displayOntology', () => {
    let component: OntologyInputComponent;

    beforeEach(() => {
      component = new OntologyInputComponent(olsSvc);
      component.metadata = metadata;
      component.control = control;
      component.ngOnInit();
    });

    it('should return blank when input is blank string', () => {
      // given
      const input = '';

      // when
      const output = component.displayOntology(input);

      // then
      expect(output).toEqual('');
    });

    it('should return blank when input is string', () => {
      // given
      const input = 'notblank';

      // when
      const output = component.displayOntology(input);

      // then
      expect(output).toEqual('');
    });

    it('should return correct output format when input is an ontology object', () => {
      // given
      const input: Ontology = {ontology: 'EFO:123', ontology_label: 'label', text: 'text'};

      // when
      const output = component.displayOntology(input);

      // then
      expect(output).toEqual('label (EFO:123)');
    });

    it('should return blank string format when input is undefined', () => {
      // given
      const input = undefined;

      // when
      const output = component.displayOntology(input);

      // then
      expect(output).toEqual('');
    });
  });


  describe('updateControl', () => {
    let component: OntologyInputComponent;

    beforeEach(() => {
      component = new OntologyInputComponent(olsSvc);
      component.metadata = metadata;
      component.control = control;
      component.ngOnInit();
    });

    it('should reset control when input is blank string', () => {
      // given
      const ontology: Ontology = {ontology: 'EFO:123', ontology_label: 'label', text: 'text'};
      component.control.patchValue(ontology);

      // when
      component.updateControl('');

      // then
      expect(metadataSvc.cleanFormData(control.value)).toEqual({});
    });

    it('should reset control when input is all whitespace', () => {
      // given
      const ontology: Ontology = {ontology: 'EFO:123', ontology_label: 'label', text: 'text'};
      component.control.patchValue(ontology);

      // when
      component.updateControl('     ');

      // then
      expect(metadataSvc.cleanFormData(control.value)).toEqual({});
    });

    it('should reset search control to its original value when input is a string', () => {
      // given
      const ontology: Ontology = {ontology: 'EFO:123', ontology_label: 'label', text: 'text'};
      component.control.patchValue(ontology);

      // when
      component.updateControl('keyword');

      // then
      expect(metadataSvc.cleanFormData(component.searchControl.value)).toEqual(ontology);
    });

    it('should copy search control value to control value when input is an ontology object', () => {
      // given
      const ontology: Ontology = {ontology: 'EFO:123', ontology_label: 'label', text: 'text'};
      component.control.patchValue(ontology);

      const ontology2: Ontology = {ontology: 'EFO:124', ontology_label: 'label2', text: 'text2'};
      component.searchControl.patchValue(ontology2);

      // when
      component.updateControl(ontology2);

      // then
      expect(metadataSvc.cleanFormData(component.control.value)).toEqual(ontology2);
    });

    it('should copy search control value to control value when input is undefined', () => {
      // given
      const ontology: Ontology = {ontology: 'EFO:123', ontology_label: 'label', text: 'text'};
      component.control.patchValue(ontology);

      const ontology2: Ontology = {ontology: 'EFO:124', ontology_label: 'label2', text: 'text2'};
      component.searchControl.patchValue(ontology2);

      // when
      component.updateControl(undefined);

      // then
      expect(metadataSvc.cleanFormData(component.control.value)).toEqual(ontology2);
    });
  });

  describe('createSearchParams', () => {
    let component: OntologyInputComponent;

    beforeEach(() => {
      component = new OntologyInputComponent(olsSvc);
      component.metadata = metadata;
      component.control = control;
      component.ngOnInit();
    });

    it('should return correct search params when given a schema', () => {
      // given

      // when
      const output = component.createSearchParams(schema);

      // then
      expect(output).toEqual({
        groupField: 'iri',
        start: 0,
        ontology: 'efo',
        allChildrenOf: 'http://www.ebi.ac.uk/efo/EFO_0002012'
      });
    });

    it('should return correct search params when schema is undefined', () => {
      // given

      // when
      const output = component.createSearchParams(undefined);

      // then
      expect(output).toEqual({});
    });

  });

  describe('olsLookup', () => {
    let component: OntologyInputComponent;

    beforeEach(() => {
      component = new OntologyInputComponent(olsSvc);
      component.metadata = metadata;
      component.control = control;
      component.ngOnInit();
    });

    it('should set searchParams given a search string', () => {
      // given
      olsSvc.select.and.returnValue(of(olsResponse));

      // when
      const output = component.olsLookup('');

      // then
      expect(component.searchParams['q']).toEqual('*');
    });

    it('should set ontology label as searchParams given an ontology object', () => {
      // given
      const ontology: Ontology = {ontology: 'EFO:0009736', ontology_label: 'principal investigator', text: 'text'};
      olsSvc.select.and.returnValue(of(olsResponse));

      // when
      const output = component.olsLookup(ontology);

      // then
      expect(component.searchParams['q']).toEqual('principal investigator');
    });

    it('should return list of ontology objects based on ols service select response', (done) => {
      // given
      const ontology: Ontology = {
        ontology: 'EFO:0009736',
        ontology_label: 'principal investigator',
        text: 'principal investigator'
      };
      olsSvc.select.and.returnValue(of(olsResponse));

      // when
      const output = component.olsLookup('');

      // then
      expect(component.searchParams['q']).toEqual('*');

      output.subscribe(data => {
        expect(data).toEqual([ontology]);
      });

      done();
    });
  });

  describe('createSearchControl', () => {
    let component: OntologyInputComponent;

    beforeEach(() => {
      component = new OntologyInputComponent(olsSvc);
      component.metadata = metadata;
      component.control = control;
      component.ngOnInit();
    });

    it('should return form control with given ontology value', () => {
      // given
      const ontology: Ontology = {
        ontology: 'EFO:0009736',
        ontology_label: 'principal investigator',
        text: 'principal investigator'
      };
      // when
      const output = component.createSearchControl(ontology);

      // then
      expect(output.value).toEqual(ontology);
    });

    it('should return form control with blank string given undefined', () => {
      // given

      // when
      const output = component.createSearchControl(undefined);

      // then
      expect(output.value).toEqual('');
    });

    it('should return form control with blank string given empty object', () => {
      // given

      // when
      const output = component.createSearchControl({ontology: '', ontology_label: '', text: ''});

      // then
      expect(output.value).toEqual('');
    });
  });
});
