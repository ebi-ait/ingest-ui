import {DataSource} from '../models/data-source';
import {BehaviorSubject, Observable, Subject, timer} from 'rxjs';
import {Endpoint, QueryData} from '../models/paginatedEndpoint';
import {switchMap, takeWhile, tap} from 'rxjs/operators';

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
