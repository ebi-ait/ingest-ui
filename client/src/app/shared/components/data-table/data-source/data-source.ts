import {PagedData} from '../../../models/page';
import {Observable} from 'rxjs';

export interface DataSource<T> {
  fetchData(options?: any): Observable<PagedData<T>>;
}
