import {MetadataFormService} from './metadata-form.service';
import {JsonSchema} from './models/json-schema';
import * as jsonSchema from './test-json-files/test-json-schema.json';

describe('MetadataFormService', () => {

  let service: MetadataFormService;
  let testSchema: JsonSchema;

  beforeEach(() => {
    service = new MetadataFormService();
    testSchema = (jsonSchema as any).default;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('copy', () => {
    it('return copy', () => {
      // given
      const obj = {
        'k1': 'v1',
        'k2': {
          'k3': null,
          'k4': null,
          'k5': [],
          'k0': {}
        },
        'k6': ['v2', 'v3'],
        'k7': {
          'k8': 'v4',
          'k9': null,
          'k10': null
        },
        'k11': [{
          'k12': 'v5',
          'k13': 'v6',
        }, {
          'k14': 'v7'
        }],
        'k15': [{}, {}],
        'k16': [null, null],
        'k17': {
          'k18': 8,
          'k19': null
        },
        'k20': {
          'k21': 'v9',
          'k22': null
        }
      };

      // when
      const copy = service.copyValues(obj);

      const expected = {
        'k1': 'v1',
        'k6': ['v2', 'v3'],
        'k7': {
          'k8': 'v4',
        },
        'k11': [{
          'k12': 'v5',
          'k13': 'v6',
        }, {
          'k14': 'v7'
        }],
        'k17': {
          'k18': 8
        },
        'k20': {
          'k21': 'v9'
        }
      };

      // then
      expect(copy).toEqual(expected);
    });
  });

  it('should clean publications if only has official_hca_publication set', () => {
    const testArray = {
      'publications': [{
        'official_hca_publication': true
      }, {
        'official_hca_publication': false
      }]
    };

    expect(service.cleanFormData(testArray)).toEqual({});

    const testSingle = {
      'publication': {
        'official_hca_publication': false
      }
    };

    expect(service.cleanFormData(testSingle)).toEqual({});

    const testNestedArray = {
      'content': {
        'title': 'Test',
        'biomaterial_core': {
          ...testSingle
        },
        ...testArray
      }
    };

    expect(service.cleanFormData(testNestedArray)).toEqual({
      'content': {
        'title': 'Test',
        'biomaterial_core': {}
      }
    });
  });

  it('should not clean publications that have more than just official_hca_publication', () => {
    const testArray = {
      'publications': [{
        'official_hca_publication': false
      }, {
        'title': 'Test',
        'official_hca_publication': true
      }, {
        'title': 'Hithhikers guide',
        'authors': ['Douglas Adams'],
      }]
    };

    expect(service.cleanFormData(testArray)).toEqual({
      'publications': [
        testArray['publications'][1],
        testArray['publications'][2]
      ]
    });

    const testSingle = {
      'publication': {
        'official_hca_publication': false,
        'Title': '42'
      }
    };

    expect(service.cleanFormData(testSingle)).toEqual(testSingle);

    const testNested = {
      'content': {
        'title': 'Zorgon',
        'biomaterial_core': {
          ...testSingle
        },
        ...testArray
      }
    };

    expect(service.cleanFormData(testNested)).toEqual({
      'content': {
        'title': 'Zorgon',
        'biomaterial_core': {
          ...testSingle
        },
        'publications': [
          testArray['publications'][1],
          testArray['publications'][2]
        ]
      }
    });
  });
});
