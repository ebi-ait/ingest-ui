import {Observable} from 'rxjs';
import {pluck} from 'rxjs/operators';
import {PaginatedEndpoint} from '../models/paginatedEndpoint';
import {Project} from '../models/project';
import {MetadataDataSource} from './metadata-data-source';
import { omit, omitBy, isNil, keys } from 'lodash';

export class ProjectDataSource extends MetadataDataSource<Project> {
  public wranglingState$: Observable<string>;
  public wrangler$: Observable<string>;
  public search$: Observable<string>;
  public organ$: Observable<string>;
  private prevFilters: object;

  constructor(protected endpoint: PaginatedEndpoint<Project>) {
    super(endpoint, 'projects');
    this.wranglingState$ = this.queryData.pipe(pluck('wranglingState'));
    this.wrangler$ = this.queryData.pipe(pluck('wrangler'));
    this.search$ = this.queryData.pipe(pluck('search'));
    this.organ$ = this.queryData.pipe(pluck('organ'));
  }

  public applyFilters(filters: object) {
    const withoutNil = omitBy(filters, isNil);
    if (!this.prevFilters) {
      this.prevFilters = withoutNil;
    }
    const removedFilterKeys = keys(this.prevFilters).filter(key => !keys(withoutNil).includes(key));
    const withoutRemoved = omit({ ...this.getQueryData(), ...withoutNil }, removedFilterKeys);
    if (withoutRemoved['search'] === '') {
      delete withoutRemoved['search'];
    }
    this.setQueryData(withoutRemoved);
    this.prevFilters = withoutNil;
  }
}
