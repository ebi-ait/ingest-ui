import {BehaviorSubject, Observable, ReplaySubject, Subject, throwError, timer} from 'rxjs';
import {catchError, mergeMap, retry, switchMap, takeWhile, tap} from 'rxjs/operators';
import {DataSource} from '../models/data-source';
import {Endpoint, QueryData} from '../models/paginatedEndpoint';

export class SimpleDataSource<T> implements  DataSource<T> {
  protected queryData: BehaviorSubject<QueryData>;
  private loading = new Subject<boolean>();
  public loading$ = this.loading.asObservable();
  private polling = new Subject<boolean>();
  public polling$ = this.polling.asObservable();
  private readonly result: ReplaySubject<T>;
  public result$: Observable<T>;
  private isPolling: boolean;
  private maxRetries = 2;
  private retryAttempts: number;

  constructor(protected endpoint: Endpoint<T>) {
    this.endpoint = endpoint;
    this.queryData = new BehaviorSubject<QueryData>({});
    this.result = new ReplaySubject<T>(1);
    this.result$ = this.result.asObservable();
    this.retryAttempts = 0;
  }

  /**
   * Set the data to send to the endpoint function.
   * @param params
   * @protected
   */
  protected setQueryData(params: QueryData): void {
    this.queryData.next(params);
  }

  /**
   * Get the data that is sent to the endpoint function.
   * @protected
   */
  protected getQueryData(): QueryData {
    return this.queryData.getValue();
  }

  /**
   * Begin connection to data source. This will start streaming data to this.result$
   * @param shouldPoll
   * @param pollInterval
   * @return observable of data (same as this.result$)
   */
  connect(shouldPoll = false, pollInterval = 5000): Observable<T>  {
    const observable$ = this.queryData.pipe(
      tap(() => this.loading.next(true)),
      switchMap(params => {
        // Copy the params to remove side-effects
        return this.endpoint(Object.assign({}, params));
      }),
      tap(() => this.loading.next(false))
    );

    if (shouldPoll) {
      this.isPolling = true;
      timer(0, pollInterval).pipe(
        tap(() => this.polling.next(true)),
        takeWhile(() => this.isPolling),
        mergeMap(() => {
          return observable$;
        }),
        tap(() => this.polling.next(false)),
        catchError(err => {
          this.retryAttempts++;
          if (this.retryAttempts > this.maxRetries) {
            console.warn('Maximum retries exceeded, disconnecting from data source.');
            this.disconnect();
          }
          return throwError(err);
        }),
        retry(this.maxRetries)
      ).subscribe(this.result);
    } else {
      observable$.subscribe(this.result);
    }

    return this.result$;
  }

  disconnect(): void {
    this.isPolling = false;
  }
}
