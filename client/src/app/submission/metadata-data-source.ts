import {BehaviorSubject, Observable, Subject, timer} from 'rxjs';
import {pluck, switchMap, takeWhile, tap} from 'rxjs/operators';
import {PagedData} from '../shared/models/page';
import { DataSource } from '../shared/models/data-source';
import {Endpoint, PaginatedEndpoint, QueryData} from '../shared/models/paginatedEndpoint';

export class SimpleDataSource<T> implements  DataSource<T> {
  protected queryData: BehaviorSubject<QueryData>;
  private loading = new Subject<boolean>();
  public loading$ = this.loading.asObservable();
  private polling = new Subject<boolean>();
  public polling$ = this.polling.asObservable();
  private isPolling: boolean;

  constructor(protected endpoint: Endpoint<T>) {
    this.endpoint = endpoint;
    this.queryData = new BehaviorSubject<QueryData>({});
  }

  protected setQueryData(params: QueryData): void {
    this.queryData.next(params);
  }

  protected getQueryData(): QueryData {
    return this.queryData.getValue();
  }

  connect(shouldPoll = false, pollInterval = 5000): Observable<T>  {
    const result$ = this.queryData.pipe(
      tap(() => this.loading.next(true)),
      switchMap(params => {
        // Copy the params to remove side-effects
        return this.endpoint(Object.assign({}, params));
      }),
      tap(() => this.loading.next(false))
    );

    if (shouldPoll) {
      this.isPolling = true;
      return timer(0, pollInterval).pipe(
        tap(() => this.polling.next(true)),
        takeWhile(() => this.isPolling),
        switchMap(() => {
          return result$;
        }),
        tap(() => this.polling.next(false))
      );
    }
    return result$;
  }

  disconnect(): void {
    this.isPolling = false;
  }
}

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
