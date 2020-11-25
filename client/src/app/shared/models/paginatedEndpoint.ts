import {Observable} from 'rxjs';
import {PagedData} from './page';

export interface Sort {
  column: string;
  direction: string;
}

export interface QueryData {
  sort?: Sort;
  page: number;
  size: number;
  [x: string]: any;
}

export type PaginatedEndpoint<T> = (params: QueryData) => Observable<PagedData<T>>;
