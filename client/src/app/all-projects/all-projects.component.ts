import {AfterViewInit, Component, OnDestroy, OnInit, Query, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Project, ProjectColumn} from '../shared/models/project';
import {IngestService} from '../shared/services/ingest.service';
import {timer} from 'rxjs';
import {map, takeWhile, tap} from 'rxjs/operators';
import {Criteria} from '../shared/models/criteria';
import {ListResult} from '../shared/models/hateoas';
import {PaginatedDataSource} from '../shared/data-sources/paginated-data-source';
import {MetadataDataSource} from '../submission/metadata-data-source';
import {PagedData} from '../shared/models/page';
import {MetadataDocument} from '../shared/models/metadata-document';

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.css']
})
export class AllProjectsComponent implements OnInit, OnDestroy {
  projects: Project[];
  columns: ProjectColumn[] = [
    ProjectColumn.api_link,
    ProjectColumn.short_name,
    ProjectColumn.project_title,
    ProjectColumn.primary_contributor,
    ProjectColumn.last_updated
  ];
  isWrangler: Boolean = true;

  // MatPaginator Inputs
  pageSizeOptions: number[] = [5, 10, 20, 30];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  searchText: string;
  value: any;

  dataSource: MetadataDataSource<Project>;

  constructor(private ingestService: IngestService) {
  }

  ngOnInit() {
    this.dataSource = new MetadataDataSource<Project>(this.getProjects.bind(this), 'projects');
    this.dataSource.sortBy('updateDate', 'desc');
    this.dataSource.connect(true).subscribe({
      next: data => {
        this.projects = data.data;
      },
      error: err => {
        console.error('err', err);
      }
    });
  }

  getProjectId(project) {
    let links: any;
    links = project['_links'];
    return links && links['self'] && links['self']['href'] ? links['self']['href'].split('/').pop() : '';
  }

  getProjectUuid(project) {
    return project['uuid'] ? project['uuid']['uuid'] : '';
  }

  ngOnDestroy() {
    this.dataSource.disconnect();
  }

  getProjects(params) {
    // TODO: Check changing page size works
    // this.params['page'] = this.paginator.pageIndex;
    // this.params['size'] = this.paginator.pageSize;

    if (params.filterState) {
      return this.searchProjects(params);
    }
    return this.getDefaultProjects(params);
  }

  searchProjects(params) {
    const query = [];
    const fields = [
      'content.project_core.project_description',
      'content.project_core.project_title',
      'content.project_core.project_short_name'
    ];

    for (const field of fields) {
      const criteria = {
        'field': field,
        'operator': 'REGEX',
        'value': params.filterState.replace(/\s+/g, '\\s+')
      };
      query.push(criteria);
    }

    delete params.filterState;

    params['operator'] = 'or';
    return this.queryProjects(query, params);
  }

  getDefaultProjects(params) {
    const criteria = {
      field: 'isUpdate',
      operator: 'IS',
      value: false
    } as Criteria;
    params['operator'] = 'and';
    return this.queryProjects([criteria], params);
  }

  private queryProjects(query: Criteria[], params) {
    return this.ingestService.queryProjects(query, params).pipe(map(data => {
      // TODO: Merge ListResult and PagedData and get rid of PagedData
      const pagedData: PagedData<MetadataDocument> = {data: [], page: undefined};
      pagedData.data = data._embedded ? data._embedded.projects : [];
      pagedData.page = data.page;
      return pagedData;
    }));
  }

  onKeyEnter(value) {
    this.dataSource.filterByState(value);
  }

  onPageChange({ pageIndex, pageSize }) {
    this.dataSource.fetch(pageIndex, pageSize);
  }
}
