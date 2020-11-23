import {Observable} from 'rxjs';

export interface DataSource<T> {
  connect(): Observable<any>;
  disconnect(): void;
}
