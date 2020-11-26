import {Observable} from 'rxjs';
import {PaginatedEndpoint} from '../models/paginatedEndpoint';
import {pluck} from 'rxjs/operators';
import {SimpleDataSource} from './simple-data-source';

export class PaginatedDataSource<T> extends SimpleDataSource<T> {
  public page$: Observable<number>;

  constructor(protected endpoint: PaginatedEndpoint<T>) {
    super(endpoint);
    this.setQueryData({
      page: 0,
      size: 20
    });

    this.page$ = this.queryData.pipe(pluck('page'));
  }

  fetch(page: number): void {
    this.setQueryData({ ...this.queryData.getValue(), page });
  }

  sortBy(column = '', direction = ''): void {
    this.setQueryData({ ...this.queryData.getValue(), sort: { column, direction }});
  }
}
