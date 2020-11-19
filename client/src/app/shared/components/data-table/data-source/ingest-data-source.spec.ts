import {IngestService} from '../../../services/ingest.service';
import SpyObj = jasmine.SpyObj;
import {of} from 'rxjs';
import {IngestDataSource} from './ingest-data-source';

describe('IngestDataSource', () => {
  let ingestSvc: SpyObj<IngestService>;
  let ingestDataSource: IngestDataSource<any>;

  beforeEach(() => {
    ingestSvc = jasmine.createSpyObj('IngestService', ['get']);
    ingestDataSource = new IngestDataSource(ingestSvc, '/biomaterials', 'biomaterials');
  });

  describe('fetchData', () => {
    it('return paged data object', (done) => {
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
                'biomaterial_core': 'donor_ID_1'
              }
            },
            '_links': {}
          },
            {
              'content': {
                'biomaterial_core': {
                  'biomaterial_core': 'specimen_ID_1'
                }
              },
              '_links': {}
            },
            {
              'content': {
                'biomaterial_core': {
                  'biomaterial_core': 'cell_ID_1'
                }
              },
              '_links': {}
            }
          ]
        }
      };

      ingestSvc.get.and.returnValue(of(mockedResponse));
      const response = ingestDataSource.fetchData({});
      response.subscribe(
        data => {
          expect(data.data.length).toBe(3);
          expect(data.page.size).toBe(20);
          expect(data.page.totalElements).toBe(3);
          done();
        }
      );
    });

  });

});
