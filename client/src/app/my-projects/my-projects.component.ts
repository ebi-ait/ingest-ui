import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {AaiService} from '../aai/aai.service';
import {IngestService} from '../shared/services/ingest.service';
import {Project, ProjectColumn} from '../shared/models/project';
import {Account} from '../core/account';
import {PaginatedDataSource} from '../shared/data-sources/paginated-data-source';
import {PagedData} from '../shared/models/page';
import {SimpleDataSource} from '../shared/data-sources/simple-data-source';

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
    this.projectsDataSource = new PaginatedDataSource(this.ingestService.getUserProjects.bind(this.ingestService));

    this.accountDataSource.connect(true)
      .subscribe((data: Account) => {
        this.isWrangler = data.isWrangler();
        if (this.isWrangler) {
          this.introduction = 'These are your assigned projects.';
          this.columns = [
            ProjectColumn.api_link,
            ProjectColumn.short_name,
            ProjectColumn.project_title,
            ProjectColumn.primary_contributor,
            ProjectColumn.last_updated
          ];
        } else {
          this.introduction = 'These are your projects created for the Human Cell Atlas.';
          this.columns = [
            ProjectColumn.short_name,
            ProjectColumn.project_title,
            ProjectColumn.last_updated
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
