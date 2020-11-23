import { DataSource } from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject, timer} from 'rxjs';
import {IngestService} from '../shared/services/ingest.service';
import {map, switchMap, takeWhile, tap} from 'rxjs/operators';
import {ListResult} from '../shared/models/hateoas';
import {PagedData} from '../shared/models/page';

// TODO Move these interfacts to another file
export interface MetadataDataSource<T> {
  connect(): Observable<PagedData<T>>;
  fetch(page: number): void;
  disconnect(): void;
}

export interface Sort {
  column: string;
  direction: string;
}

export interface Params {
  sort?: Sort;
  page: number;
  size: number;
  [x: string]: any;
}

export type PaginatedEndpoint<T> = (params: Params) => Observable<T>;

export class MetadataDataSource<T> implements MetadataDataSource<T> {
  protected params: BehaviorSubject<Params>;
  private loading = new Subject<boolean>();
  public loading$ = this.loading.asObservable();
  private isPolling: boolean;

  constructor(protected endpoint: PaginatedEndpoint<PagedData<T>>) {
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
        return this.endpoint(params);
      }),
      tap(() => this.loading.next(false))
    );

    if (shouldPoll) {
      this.isPolling = true;
      return timer(0, pollInterval).pipe(
        takeWhile(() => this.isPolling),
        switchMap(() => {
          return page$;
        })
      );
    }
    return page$;
  }

  disconnect(): void {
    this.isPolling = false;
  }
}

export class SubmissionDataSource<T> extends MetadataDataSource<T> {
  public resourceType: string;
  constructor(protected endpoint: PaginatedEndpoint<PagedData<T>>,
              resourceType: string) {
    super(endpoint);
    this.resourceType = resourceType;
  }

  public filterByState(state: string) {
    this.setParams({ ...this.params.getValue(), filterState: state });
  }
}
