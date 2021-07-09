import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {Project, ProjectColumn} from '../shared/models/project';
import {IngestService} from '../shared/services/ingest.service';
import {map} from 'rxjs/operators';
import {MetadataDataSource} from '../shared/data-sources/metadata-data-source';
import {PagedData} from '../shared/models/page';
import {MetadataDocument} from '../shared/models/metadata-document';
import * as ingestSchema from '../project-form/project-ingest-schema.json';
import {Observable} from 'rxjs';
import {Account} from '../core/account';

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.css']
})
export class AllProjectsComponent implements OnInit, OnDestroy {
  projects: Project[];
  columns: ProjectColumn[] = [
    ProjectColumn.apiLink,
    ProjectColumn.shortName,
    ProjectColumn.projectTitle,
    ProjectColumn.primaryContributor,
    ProjectColumn.lastUpdated,
    ProjectColumn.primaryWrangler,
    ProjectColumn.wranglingState
  ];
  isWrangler: Boolean = true;

  // MatPaginator Inputs
  pageSizeOptions: number[] = [5, 10, 20, 30];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  searchText: string;

  dataSource: MetadataDataSource<Project>;
  wranglingStates = ingestSchema.properties.wranglingState.enum;
  wranglers$: Observable<Account[]>;
  filterState = {};

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
    this.wranglers$ = this.ingestService.getWranglers();
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
    const urlParams = {
      ...params,
      ...params?.filterState,
      sort: `${params.sort.column},${params.sort.direction}`
    };

    return this.getFilteredProjects(urlParams);
  }

  private getFilteredProjects(params) {
    return this.ingestService.getFilteredProjects(params).pipe(map(
      data => {
        const pagedData: PagedData<MetadataDocument> = {data: [], page: undefined};
        pagedData.data = data._embedded ? data._embedded.projects : [];
        pagedData.page = data.page;
        return pagedData;
      }
    ));
  }
  onKeyEnter(value) {
    this.filterState['search'] = value;
    this.dataSource.filterByState(this.filterState);
  }

  onFilterByState($event) {
    this.filterState['wranglingState'] = $event.value;

    if (!$event.value) { delete this.filterState['wranglingState']; }
    this.dataSource.filterByState(this.filterState);
  }

  onFilterByWrangler($event) {
    this.filterState['wrangler'] = $event.value;
    if (!$event.value) { delete this.filterState['wrangler']; }
    this.dataSource.filterByState(this.filterState);
  }

  onPageChange({ pageIndex, pageSize }) {
    this.dataSource.fetch(pageIndex, pageSize);
  }

  transformWranglingState(wranglingState: String) {
    return wranglingState.replace(/\s+/g, '_').toUpperCase();
  }
}
