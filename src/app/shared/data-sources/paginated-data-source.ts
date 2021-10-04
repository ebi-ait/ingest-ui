import {Observable} from 'rxjs';
import {pluck} from 'rxjs/operators';
import {Page, PagedData} from '../models/page';
import {PaginatedEndpoint} from '../models/paginatedEndpoint';
import {SimpleDataSource} from './simple-data-source';

export class PaginatedDataSource<T> extends SimpleDataSource<PagedData<T>> {
  public page$: Observable<Page>;
  public requestedOffset$: Observable<number>;

  constructor(protected endpoint: PaginatedEndpoint<T>) {
    super(endpoint);
    this.setQueryData({
      page: 0,
      size: 20
    });

    this.requestedOffset$ = this.queryData.pipe(pluck('page'));
    this.page$ = this.result$.pipe(pluck('page'));
  }

  fetch(page: number, size = 20): void {
    this.setQueryData({ ...this.queryData.getValue(), page, size });
  }

  sortBy(column = '', direction = ''): void {
    this.setQueryData({ ...this.queryData.getValue(), sort: { column, direction }, page: 0 });
  }
}
