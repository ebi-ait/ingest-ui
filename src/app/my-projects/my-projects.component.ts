import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {PaginatedDataSource} from '@shared/data-sources/paginated-data-source';
import {SimpleDataSource} from '@shared/data-sources/simple-data-source';
import {PagedData} from '@shared/models/page';
import {Project, ProjectColumn} from '@shared/models/project';
import {IngestService} from '@shared/services/ingest.service';
import {AaiService} from '../aai/aai.service';
import {Account} from '../core/account';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit, OnDestroy {
  isWrangler: Boolean;
  introduction: String;
  columns: ProjectColumn[];

  projects: Project[];
  projectsDataSource: PaginatedDataSource<Project>;
  accountDataSource: SimpleDataSource<Account>;

  // MatPaginator Inputs
  pageSizeOptions: number[] = [5, 10, 20, 30];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private aai: AaiService, private ingestService: IngestService) {}

  ngOnInit() {
    // protected against null user by the user-is-logged-in guard
    this.accountDataSource =  new SimpleDataSource(this.ingestService.getUserAccount.bind(this.ingestService));
    this.projectsDataSource = new PaginatedDataSource(params => {
      return this.ingestService.getUserProjects({ ...params, sort: `${params.sort.column},${params.sort.direction}`});
    });
    this.projectsDataSource.sortBy('updateDate', 'desc');

    this.accountDataSource.connect()
      .subscribe((data: Account) => {
        this.isWrangler = data.isWrangler();
        if (this.isWrangler) {
          this.introduction = 'These are your assigned projects.';
          this.columns = [
            ProjectColumn.apiLink,
            ProjectColumn.shortName,
            ProjectColumn.projectTitle,
            ProjectColumn.primaryContributor,
            ProjectColumn.lastUpdated,
            ProjectColumn.primaryWrangler,
            ProjectColumn.wranglingState,
            ProjectColumn.dcpReleaseNumber,
            ProjectColumn.labels
          ];
        } else {
          this.introduction = 'These are your projects created for the Human Cell Atlas.';
          this.columns = [
            ProjectColumn.shortName,
            ProjectColumn.projectTitle,
            ProjectColumn.lastUpdated
          ];
        }
      });

    this.projectsDataSource.connect(true)
      .subscribe((result: PagedData<Project>) => {
        this.projects = result.data;
      });
  }

  onPageChange({ pageIndex, pageSize }) {
    this.projectsDataSource.fetch(pageIndex, pageSize);
  }

  ngOnDestroy() {
    this.projectsDataSource.disconnect();
    this.accountDataSource.disconnect();
  }
}
