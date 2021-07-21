import {Observable} from 'rxjs';
import {pluck} from 'rxjs/operators';
import {PaginatedEndpoint} from '../models/paginatedEndpoint';
import {MetadataDataSource} from './metadata-data-source';
import {Project} from '../models/project';

export class ProjectDataSource extends MetadataDataSource<Project> {
    public wranglingState$: Observable<string>;
    public wrangler$: Observable<string>;
    public search$: Observable<string>;
    constructor(protected endpoint: PaginatedEndpoint<Project>) {
        super(endpoint, 'projects');
        this.wranglingState$ = this.queryData.pipe(pluck('wranglingState'));
        this.wrangler$ = this.queryData.pipe(pluck('wrangler'));
        this.search$ = this.queryData.pipe(pluck('search'));
    }

    public filterByWranglingState(wranglingState: string): void {
        const queryData = { ...this.getQueryData(), wranglingState, page: 0 };
        if (!wranglingState) {
            delete queryData['wranglingState'];
        }
        this.setQueryData(queryData);
    }

    public filterByWrangler(wrangler: string): void {
        const queryData = { ...this.getQueryData(), wrangler, page: 0 };
        if (!wrangler) {
            delete queryData['wrangler'];
        }
        this.setQueryData(queryData);
    }

    public search(searchString: string): void {
        const queryData = { ...this.getQueryData(), search: searchString, page: 0 };
        if (searchString === '') {
            delete queryData['search'];
        }
        this.setQueryData(queryData);
    }
}
