import {BehaviorSubject, Observable, ReplaySubject, Subject, throwError, timer} from 'rxjs';
import {catchError, mergeMap, retry, switchMap, takeWhile, tap, last} from 'rxjs/operators';
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

  private poll(observable$: Observable<any>, pollInterval): Observable<any> {
    this.isPolling = true;
    return timer(0, pollInterval).pipe(
      tap(() => this.polling.next(true)),
      takeWhile(() => this.isPolling),
      // User mergeMap since the inner observable (request) may take longer than the pollInterval to resolve
      // If using switchMap, the inner observable would be cancelled with a new value from the outer observable
      // i.e. when the pollInterval has been exceeded
      mergeMap(() => {
        // Only take most recent value of inner observable since we only want to poll on the most recent set of
        // parameters (from this.queryData) for this.endpoint
        return observable$.pipe(last());
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
    );
  }

  /**
   * Begin connection to data source. This will start streaming data to this.result$
   * @param shouldPoll
   * @param pollInterval
   * @return observable of data (same as this.result$)
   */
  connect(shouldPoll = false, pollInterval = 5000): Observable<T>  {
    this.queryData.pipe(
      tap(() => this.loading.next(true)),
      switchMap(params => {
        // Copy the params to remove side-effects
        const endpoint$ = this.endpoint(Object.assign({}, params));
        if (shouldPoll) {
          return this.poll(endpoint$, pollInterval);
        }
        // Copy the params to remove side-effects
        return endpoint$;
      }),
      tap(() => this.loading.next(false))
    ).subscribe(this.result);

    return this.result$;
  }

  disconnect(): void {
    this.isPolling = false;
  }
}
