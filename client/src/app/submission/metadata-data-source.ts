import { DataSource } from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {IngestService} from '../shared/services/ingest.service';
import {map, share, startWith, switchMap} from 'rxjs/operators';
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
  constructor(protected ingestService: IngestService,
              protected endpoint: string,
              protected resourceType: string,) {
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
      switchMap(page => {
        return this.fetchPage({
            page: page,
            size: 20,
            sort: ''
          }
        );
      })
    );
  }

  disconnect(): void {}
}
