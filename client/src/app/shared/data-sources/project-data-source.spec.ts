import SpyObj = jasmine.SpyObj;
import {of} from 'rxjs';
import {IngestService} from '../services/ingest.service';
import {PaginatedDataSource} from './paginated-data-source';
import {ProjectDataSource} from './project-data-source';

describe('ProjectDataSource', () => {

  beforeEach(() => {
  });

  xdescribe('filterByFieldAndValue', () => {
    it('filterByFieldAndValue', (done) => {
      const ds = new ProjectDataSource(null);
      ds.filterByFieldAndValue('x', 'y');
    });
  });
});

