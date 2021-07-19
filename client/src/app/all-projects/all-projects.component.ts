import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {Project, ProjectColumn} from '../shared/models/project';
import {IngestService} from '../shared/services/ingest.service';
import {map} from 'rxjs/operators';
import {PagedData} from '../shared/models/page';
import * as ingestSchema from '../project-form/project-ingest-schema.json';
import {Observable} from 'rxjs';
import {Account} from '../core/account';
import {ProjectDataSource} from '../shared/data-sources/project-data-source';

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

  dataSource: ProjectDataSource;
  wranglingStates = ingestSchema.properties.wranglingState.enum;
  wranglers$: Observable<Account[]>;

  constructor(private ingestService: IngestService) {
  }

  ngOnInit() {
    this.dataSource = new ProjectDataSource(this.getProjects.bind(this));
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

  getProjects(params): Observable<PagedData<Project>> {
    const urlParams = {
      ...params,
      sort: `${params.sort.column},${params.sort.direction}`
    };

    delete params.sort;

    return this.getFilteredProjects(urlParams);
  }

  private getFilteredProjects(params): Observable<PagedData<Project>> {
    return this.ingestService.getFilteredProjects(params).pipe(map(
      data => {
        const pagedData: PagedData<Project> = {data: [], page: undefined};
        pagedData.data = data._embedded ? data._embedded.projects : [];
        pagedData.page = data.page;
        return pagedData;
      }
    ));
  }
  onKeyEnter(value) {
    this.dataSource.search(value);
  }

  onFilterByState($event) {
    this.dataSource.filterByWranglingState($event.value);
  }

  onFilterByWrangler($event) {
    this.dataSource.filterByWrangler($event.value);
  }

  onPageChange({ pageIndex, pageSize }) {
    this.dataSource.fetch(pageIndex, pageSize);
  }

  transformWranglingState(wranglingState: String) {
    return wranglingState.replace(/\s+/g, '_').toUpperCase();
  }
}
