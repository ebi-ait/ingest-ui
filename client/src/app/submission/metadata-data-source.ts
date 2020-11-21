import { DataSource } from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {IngestService} from '../shared/services/ingest.service';
import {map, share, startWith, switchMap, tap} from 'rxjs/operators';
import {ListResult} from '../shared/models/hateoas';
import {PagedData} from '../shared/models/page';

// TODO Move these interfacts to another file
export interface MetadataDataSource<T> {
  connect(): Observable<PagedData<T>>;
  fetch(page: number): void;
  disconnect(): void;
}

export class MetadataDataSource<T> implements MetadataDataSource<T> {
  pageNumber: Subject<number>;
  private loading = new Subject<boolean>();
  public loading$ = this.loading.asObservable();

  constructor(protected ingestService: IngestService,
              protected endpoint: string,
              protected resourceType: string) {
    this.endpoint = endpoint;
    this.resourceType = resourceType;
  }

  fetch(page: number): void {
    this.pageNumber.next(page);
  }

  private fetchPage(params?: any): Observable<PagedData<T>> {
    return this.ingestService.get(this.endpoint, {params: params}).pipe(
      map(data => data as ListResult<any>),
      map(data => {
        return {
          data: data && data._embedded ? data._embedded[this.resourceType] : [],
          page: data.page
        };
      })
    );
  }

  connect(): Observable<PagedData<T>>  {
    this.pageNumber = new Subject();
    return this.pageNumber.pipe(
      startWith(0),
      tap(() => this.loading.next(true)),
      switchMap(page => {
        return this.fetchPage({
            page: page,
            size: 20,
            sort: ''
          }
        );
      }),
      tap(() => this.loading.next(false))
    );
  }

  disconnect(): void {}
}
