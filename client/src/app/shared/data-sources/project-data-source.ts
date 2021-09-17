import {Observable} from 'rxjs';
import {pluck} from 'rxjs/operators';
import {PaginatedEndpoint} from '../models/paginatedEndpoint';
import {Project} from '../models/project';
import {MetadataDataSource} from './metadata-data-source';

export class ProjectDataSource extends MetadataDataSource<Project> {
  public wranglingState$: Observable<string>;
  public wrangler$: Observable<string>;
  public search$: Observable<string>;
  public organ$: Observable<string>;

  constructor(protected endpoint: PaginatedEndpoint<Project>) {
    super(endpoint, 'projects');
    this.wranglingState$ = this.queryData.pipe(pluck('wranglingState'));
    this.wrangler$ = this.queryData.pipe(pluck('wrangler'));
    this.search$ = this.queryData.pipe(pluck('search'));
    this.organ$ = this.queryData.pipe(pluck('organ'));
  }

  private filterByFieldAndValue = (fieldName: string) =>
    (fieldValue: string) => {
      const queryData = {...this.getQueryData(), page: 0};
      queryData[fieldName] = fieldValue;
      if (!fieldValue || fieldValue === '') {
        delete queryData[fieldName];
      }
      this.setQueryData(queryData);
    };

  public filterByWrangler = this.filterByFieldAndValue('wrangler');
  public filterByWranglingState = this.filterByFieldAndValue('wranglingState');
  public changeSearchType = this.filterByFieldAndValue('searchType');
  public search = this.filterByFieldAndValue('search');

}
