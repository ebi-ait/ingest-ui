import {IngestService} from '../../../services/ingest.service';
import SpyObj = jasmine.SpyObj;
import {MetadataDataSource} from './metadata-data-source';
import {of} from 'rxjs';

describe('MetadataDataSource', () => {
  let ingestSvc: SpyObj<IngestService>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['get']);
  });

  it('creates a new instance successfully', () => {
    const metadataDataSource = new MetadataDataSource(ingestSvc, 'endpoint', 'biomaterials');
    expect(metadataDataSource).toBeDefined();
  });

  it('fails to create an instance given an incorrect resource type', () => {
    let metadataDataSource: MetadataDataSource;

    try {
      metadataDataSource = new MetadataDataSource(ingestSvc, 'endpoint', 'unknown');

    } catch (error) {
      expect(error).toMatch('not a valid metadata resource type');
    }

    expect(metadataDataSource).toBeFalsy();
  });

  describe('fetchData', () => {
    it('return paged data which only contains the content obj', (done) => {
      const mockedResponse = {
        'page': {
          'size': 20,
          'totalElements': 3,
          'totalPages': 1,
          'number': 0
        },
        '_embedded': {
          'biomaterials': [{
            'content': {
              'biomaterial_core': {
                'biomaterial_id': 'donor_ID_1'
              }
            },
            '_links': {}
          },
            {
              'content': {
                'biomaterial_core': {
                  'biomaterial_id': 'specimen_ID_1'
                }
              },
              '_links': {}
            },
            {
              'content': {
                'biomaterial_core': {
                  'biomaterial_id': 'cell_ID_1'
                }
              },
              '_links': {}
            }
          ]
        }
      };
      ingestSvc.get.and.returnValue(of(mockedResponse));
      const metadataDataSource = new MetadataDataSource(ingestSvc, '/biomaterials', 'biomaterials');
      const response = metadataDataSource.fetchData({});
      response.subscribe(
        data => {
          expect(data.data.length).toBe(3);
          expect(data.data[0]['biomaterial_core']).toBeDefined();
          expect(data.data[1]['biomaterial_core']).toBeDefined();
          expect(data.data[2]['biomaterial_core']).toBeDefined();
          expect(data.data[0]['biomaterial_core']['biomaterial_id']).toBe('donor_ID_1');
          expect(data.data[1]['biomaterial_core']['biomaterial_id']).toBe('specimen_ID_1');
          expect(data.data[2]['biomaterial_core']['biomaterial_id']).toBe('cell_ID_1');
          expect(data.page.size).toBe(20);
          expect(data.page.totalElements).toBe(3);
          done();
        }
      );
    });
  });

});
