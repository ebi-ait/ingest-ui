import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {ProjectDataSource} from '@shared/data-sources/project-data-source';
import {PagedData} from '@shared/models/page';
import {Project, ProjectColumn} from '@shared/models/project';
import {IngestService} from '@shared/services/ingest.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ProjectFilters} from '../../models/project-filters';

const THIRTY_SECONDS = 30000;

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
    ProjectColumn.wranglingState,
    ProjectColumn.release
  ];


  // MatPaginator Inputs
  pageSizeOptions: number[] = [5, 10, 20, 30];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  dataSource: ProjectDataSource;

  constructor(private ingestService: IngestService) {
  }

  ngOnInit() {
    this.dataSource = new ProjectDataSource(this.getProjects.bind(this));
    this.dataSource.sortBy('updateDate', 'desc');
    const pollingPeriod = THIRTY_SECONDS;
    this.dataSource.connect(true, pollingPeriod).subscribe({
      next: data => {
        this.projects = data.data;
      },
      error: err => {
        console.error('err', err);
      }
    });
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

  onPageChange({ pageIndex, pageSize }) {
    this.dataSource.fetch(pageIndex, pageSize);
  }

  onFilter(filters: ProjectFilters) {
    this.dataSource.applyFilters(filters);
  }
}
