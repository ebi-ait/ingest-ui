import {Observable} from 'rxjs';
import {pluck} from 'rxjs/operators';
import {PaginatedEndpoint} from '../shared/models/paginatedEndpoint';
import {PaginatedDataSource} from '../shared/data-sources/paginated-data-source';

export class MetadataDataSource<T> extends PaginatedDataSource<T> {
  public resourceType: string;
  public filterState$: Observable<string>;
  constructor(protected endpoint: PaginatedEndpoint<T>,
              resourceType: string) {
    super(endpoint);
    this.resourceType = resourceType;
    this.filterState$ = this.queryData.pipe(pluck('filterState'));
  }

  public filterByState(state: string) {
    this.setQueryData({ ...this.getQueryData(), filterState: state, page: 0 });
  }
}
