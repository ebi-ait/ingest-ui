import {PagedData} from '../../../models/page';
import {DataSource} from './data-source';
import {IngestService} from '../../../services/ingest.service';
import {map} from 'rxjs/operators';
import {ListResult} from '../../../models/hateoas';
import {Observable} from 'rxjs';

export class IngestDataSource<T> implements DataSource<T> {

  constructor(protected ingestService: IngestService,
              protected endpoint: string,
              protected resourceType: string) {
    this.endpoint = endpoint;
    this.resourceType = resourceType;
  }

  fetchData(params?: any): Observable<PagedData<T>> {
    return this.ingestService.get(this.endpoint, {params: params}).pipe(
      map(data => data as ListResult<any>),
      map(data => {
        return {
          data: data && data._embedded ? data._embedded[this.resourceType] : [],
          page: data.page
        };
      })
    );
  }
}
