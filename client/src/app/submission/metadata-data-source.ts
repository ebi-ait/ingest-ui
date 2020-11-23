import {BehaviorSubject, Observable, Subject, timer} from 'rxjs';
import {switchMap, takeWhile, tap} from 'rxjs/operators';
import {PagedData} from '../shared/models/page';
import { DataSource } from '../shared/models/data-source';
import {PaginatedEndpoint, Params} from '../shared/models/paginatedEndpoint';

export class PaginatedDataSource<T> implements DataSource<T> {
  protected params: BehaviorSubject<Params>;
  private loading = new Subject<boolean>();
  public loading$ = this.loading.asObservable();
  private polling = new Subject<boolean>();
  public polling$ = this.polling.asObservable();
  private isPolling: boolean;

  constructor(protected endpoint: PaginatedEndpoint<T>) {
    this.endpoint = endpoint;
  }

  fetch(page: number): void {
    this.setParams({ ...this.params.getValue(), page });
  }

  sortBy(column = '', direction = ''): void {
    this.setParams({ ...this.params.getValue(), sort: { column, direction }});
  }

  protected setParams(params: Params): void {
    this.params.next(params);
  }

  connect(shouldPoll = false, pollInterval = 5000): Observable<PagedData<T>>  {
    this.params = new BehaviorSubject<Params>({
      page: 0,
      size: 20
    });

    const page$ = this.params.pipe(
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
          return page$;
        }),
        tap(() => this.polling.next(false))
      );
    }
    return page$;
  }

  disconnect(): void {
    this.isPolling = false;
  }
}

export class MetadataDataSource<T> extends PaginatedDataSource<T> {
  public resourceType: string;
  constructor(protected endpoint: PaginatedEndpoint<T>,
              resourceType: string) {
    super(endpoint);
    this.resourceType = resourceType;
  }

  public filterByState(state: string) {
    this.setParams({ ...this.params.getValue(), filterState: state });
  }
}
