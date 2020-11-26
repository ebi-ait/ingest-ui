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
  private readonly result: Subject<T>;
  public result$: Observable<T>;
  private isPolling: boolean;

  constructor(protected endpoint: Endpoint<T>) {
    this.endpoint = endpoint;
    this.queryData = new BehaviorSubject<QueryData>({});
    this.result = new Subject();
    this.result$ = this.result.asObservable();
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
        switchMap(() => {
          return observable$;
        }),
        tap(() => this.polling.next(false))
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
