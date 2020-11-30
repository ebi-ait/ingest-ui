import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {IngestService} from '../shared/services/ingest.service';
import {SubmissionEnvelope} from '../shared/models/submissionEnvelope';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '../shared/services/alert.service';
import {map, takeWhile, tap} from 'rxjs/operators';
import {LoaderService} from '../shared/services/loader.service';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Observable, Subscription, timer} from 'rxjs';
import {PaginatedDataSource} from '../shared/data-sources/paginated-data-source';
import {PagedData} from '../shared/models/page';
import {MetadataDocument} from '../shared/models/metadata-document';

@Component({
  selector: 'app-submission-list',
  templateUrl: './submission-list.component.html',
  styleUrls: ['./submission-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SubmissionListComponent implements OnInit, OnDestroy {
  submissionProjects: Object;
  submissionEnvelopes: SubmissionEnvelope[];
  links: Object;

  private showAll;
  // MatPaginator Inputs
  pageSizeOptions: number[] = [5, 10, 20, 30];

  dataSource: PaginatedDataSource<SubmissionEnvelope>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  upload = false;

  constructor(private ingestService: IngestService,
              private router: Router,
              private route: ActivatedRoute,
              private alertService: AlertService,
              private loaderService: LoaderService
  ) {
    this.submissionProjects = {};

    route.params.subscribe(() => {
      this.showAll = this.route.snapshot.paramMap.get('all');
    });
  }

  ngOnInit() {
    this.dataSource = new PaginatedDataSource<SubmissionEnvelope>(this.getSubmissions.bind(this));
    this.dataSource.sortBy('submissionDate', 'desc');
    this.dataSource.connect(true).subscribe(data => {
      const submissions = data.data;
      this.submissionEnvelopes = submissions;
      this.initSubmissionProjects(submissions);
    });
  }

  ngOnDestroy() {
    this.dataSource.disconnect();
  }

  getSubmissions(params) {
    const urlParams = {
      ...params,
      sort: `${params.sort.column},${params.sort.direction}`
    };
    return (this.showAll ? this.ingestService.getAllSubmissions(urlParams) : this.ingestService.getUserSubmissions(urlParams))
        .pipe(
            tap(result => {
              // TODO Refactor to use ListResult instead of PagedData and then don't need this
              this.links = result._links;
            }),
            map(result => {
              // TODO Refactor to use ListResult instead of PagedData
              const pagedData: PagedData<MetadataDocument> = {data: [], page: undefined};
              pagedData.data = result._embedded ? result._embedded.submissionEnvelopes : [];
              pagedData.page = result.page;
              return pagedData;
            })
        );
  }

  getSubmitLink(submissionEnvelope) {
    const links = submissionEnvelope['_links'];
    return links && links['submit'] ? links['submit']['href'] : null;
  }

  getSubmissionId(submissionEnvelope) {
    const links = submissionEnvelope['_links'];
    return links && links['self'] && links['self']['href'] ? links['self']['href'].split('/').pop() : '';
  }

  getSubmissionUuid(submissionEnvelope) {
    return submissionEnvelope['uuid']['uuid'];
  }

  initSubmissionProjects(submissions) {
    for (const submission of submissions) {
      const submissionId = this.getSubmissionId(submission);

      if (this.submissionProjects[submissionId] === undefined) {
        this.submissionProjects[submissionId] = '';
        this.ingestService.getSubmissionProject(submissionId)
          .subscribe(data => {
            this.submissionProjects[submissionId] = {};
            this.submissionProjects[submissionId]['name'] = this.extractProjectName(data);
            this.submissionProjects[submissionId]['id'] = this.extractProjectId(data);
          });
      }
    }
  }

  getProjectName(submission) {
    return this.submissionProjects[this.getSubmissionId(submission)]['name'];
  }

  getProjectId(submission) {
    return this.submissionProjects[this.getSubmissionId(submission)]['id'];
  }

  extractProjectName(project) {
    const content = project ? project['content'] : null;
    return content ? project['content']['project_core']['project_title'] : '';
  }

  extractProjectId(project) {
    const content = project ? project['content'] : null;
    return content ? project['content']['project_core']['project_short_name'] : '';
  }

  onDeleteSubmission(submissionEnvelope: SubmissionEnvelope) {
    // TODO Check this works
    const submissionId: String = this.getSubmissionId(submissionEnvelope);
    const projectName = this.getProjectName(submissionEnvelope);
    const projectInfo = projectName ? `(${projectName})` : '';
    const submissionUuid = submissionEnvelope['uuid']['uuid'];
    const message = `Are you sure you want to delete the submission with UUID ${submissionUuid} ${projectInfo} ?`;
    const messageOnSuccess = `The submission with UUID ${submissionUuid} ${projectInfo} was deleted!`;
    const messageOnError = `An error has occurred while deleting the submission w/UUID ${submissionUuid} ${projectInfo}`;

    if (confirm(message)) {
      this.loaderService.display(true);
      this.ingestService.deleteSubmission(submissionId).subscribe(
        () => {
          this.alertService.clear();
          this.alertService.success('', messageOnSuccess);
          this.dataSource.fetch(0);
          this.loaderService.display(false);
        },
        err => {
          this.alertService.clear();
          this.alertService.error(messageOnError, err.error.message);
          console.error('error deleting submission', err);
          this.loaderService.display(false);
        });
    }
  }

  onSwitchUpload() {
    this.upload = !this.upload;
  }

  onPageChange({ pageIndex, pageSize }) {
    this.dataSource.fetch(pageIndex, pageSize);
  }
}


