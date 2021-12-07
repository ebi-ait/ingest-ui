import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SUBMISSION_STATES, SUBMITTED_STATES} from "@shared/constants";
import {MetadataDataSource} from '@shared/data-sources/metadata-data-source';
import {PaginatedDataSource} from '@shared/data-sources/paginated-data-source';
import {SimpleDataSource} from '@shared/data-sources/simple-data-source';
import {ArchiveEntity} from '@shared/models/archiveEntity';
import {ListResult} from '@shared/models/hateoas';
import {MetadataDocument} from '@shared/models/metadata-document';
import {Project} from '@shared/models/project';
import {SubmissionEnvelope} from '@shared/models/submissionEnvelope';
import {SubmissionSummary} from '@shared/models/submissionSummary';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';

enum SubmissionTab {
  BIOMATERIALS = 0,
  PROCESSES = 1,
  PROTOCOLS = 2,
  FILES = 3
}

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit, OnDestroy {

  submissionEnvelopeId: string;
  submissionEnvelopeUuid: string;
  submissionEnvelope$: Observable<any>;
  submissionEnvelope;
  submissionState: string;
  isValid: boolean;
  isLinkingDone: boolean;
  isSubmitted: boolean;
  submitLink: string;
  exportLink: string;
  cleanupLink: string;
  url: string;
  project: Project;
  project$: Observable<Project>;
  projectUuid: string;
  projectTitle: string;
  projectShortName: string;
  manifest: Object;
  submissionErrors: Object[];
  selectedIndex: any = 0;
  validationSummary: SubmissionSummary;
  isLoading: boolean;

  submissionDataSource: SimpleDataSource<SubmissionEnvelope>;
  projectDataSource: SimpleDataSource<Project>;

  biomaterialsDataSource: MetadataDataSource<MetadataDocument>;
  processesDataSource: MetadataDataSource<MetadataDocument>;
  protocolsDataSource: MetadataDataSource<MetadataDocument>;
  bundleManifestsDataSource: MetadataDataSource<MetadataDocument>;
  filesDataSource: MetadataDataSource<MetadataDocument>;
  archiveEntityDataSource: PaginatedDataSource<ArchiveEntity>;

  SUBMISSION_STATES = SUBMISSION_STATES;

  private MAX_ERRORS = 1;
  submissionTab = SubmissionTab;

  constructor(
    private alertService: AlertService,
    private ingestService: IngestService,
    private brokerService: BrokerService,
    private route: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService
  ) {
  }

  private static getSubmissionId(submissionEnvelope) {
    const links = submissionEnvelope['_links'];
    return links && links['self'] && links['self']['href'] ? links['self']['href'].split('/').pop() : '';
  }

  ngOnInit() {
    this.isLoading = true;
    this.route.queryParamMap.subscribe(queryParams => {
      this.submissionEnvelopeUuid = queryParams.get('uuid');
      this.submissionEnvelopeId = queryParams.get('id');
      this.projectUuid = queryParams.get('project');

      this.connectSubmissionEnvelope();
    });

    this.initArchiveEntityDataSource(this.submissionEnvelopeUuid);
  }

  connectSubmissionEnvelope() {
    this.submissionDataSource = new SimpleDataSource<SubmissionEnvelope>(this.submissionEnvelopeEndpoint.bind(this));
    this.submissionDataSource.connect(true, 15000).subscribe(submissionEnvelope => {
      this.initSubmissionAttributes(submissionEnvelope);
      this.displaySubmissionErrors(submissionEnvelope);
      this.checkFromManifestIfLinkingIsDone(submissionEnvelope);
      this.validationSummary = submissionEnvelope['summary'];
      this.initDataSources();
      this.connectProject(this.submissionEnvelopeId);
    });
  }

  private checkFromManifestIfLinkingIsDone(submissionEnvelope: SubmissionEnvelope) {
    this.manifest = submissionEnvelope['manifest'];
    const actualLinks = this.manifest['actualLinks'];
    const expectedLinks = this.manifest['expectedLinks'];
    if (!expectedLinks || (actualLinks === expectedLinks)) {
      this.isLinkingDone = true;
    }
  }

  displaySubmissionErrors(submissionEnvelope: SubmissionEnvelope) {
    this.submissionErrors = submissionEnvelope['errors'];
    if (this.submissionErrors.length >= 0) {
      this.alertService.clear();
    }
    if (this.submissionErrors.length > this.MAX_ERRORS) {
      const link = this.submissionEnvelope._links.submissionEnvelopeErrors.href;
      const message = `Cannot show more than ${this.MAX_ERRORS} errors.`;
      this.alertService.error(
        `${this.submissionErrors.length - this.MAX_ERRORS} Other Errors`,
        `${message} <a href="${link}">View all ${this.submissionErrors.length} errors.</a>`,
        false,
        false);
    }
    let errors_displayed = 0;
    for (const err of this.submissionErrors) {
      if (errors_displayed >= this.MAX_ERRORS) {
        break;
      }
      this.alertService.error(err['title'], err['detail'], false, false);
      errors_displayed++;
    }
  }

  private initSubmissionAttributes(submissionEnvelope: SubmissionEnvelope) {
    // NOTE: this should be broken up and/or just use dataSource attributes directly in template but
    // we're getting rid of submissions anyway.
    this.submissionEnvelope = submissionEnvelope;
    this.submissionEnvelopeId = SubmissionComponent.getSubmissionId(submissionEnvelope);
    this.isValid = this.checkIfValid(submissionEnvelope);
    this.submissionState = submissionEnvelope['submissionState'];
    this.isSubmitted = this.isStateSubmitted(SUBMISSION_STATES[submissionEnvelope.submissionState]);
    this.submitLink = this.getLink(submissionEnvelope, 'submit');
    this.exportLink = this.getLink(submissionEnvelope, 'export');
    this.cleanupLink = this.getLink(submissionEnvelope, 'cleanup');
    this.url = this.getLink(submissionEnvelope, 'self');
  }

  private submissionEnvelopeEndpoint() {
    if (!this.submissionEnvelopeId && !this.submissionEnvelopeUuid) {
      throw new Error('No ID or UUID for submissionEnvelope.');
    }

    const submissionEnvelope$ = this.submissionEnvelopeId ?
      this.ingestService.getSubmission(this.submissionEnvelopeId) :
      this.ingestService.getSubmissionByUuid(this.submissionEnvelopeUuid);

    return submissionEnvelope$.pipe(
      mergeMap(
        this.submissionErrorsEndpoint.bind(this),
        (submissionEnvelope, errors) => ({...submissionEnvelope, errors})
      ),
      mergeMap(
        this.submissionManifestEndpoint.bind(this),
        (submissionEnvelope, manifest) => ({...submissionEnvelope, manifest})
      ),
      mergeMap(
        submissionEnvelope => this.ingestService.getSubmissionSummary(SubmissionComponent.getSubmissionId(submissionEnvelope)),
        (submissionEnvelope, summary) => ({...submissionEnvelope, summary})
      )
    );
  }

  private submissionErrorsEndpoint(submissionEnvelope) {
    return this.ingestService.get(submissionEnvelope['_links']['submissionEnvelopeErrors']['href']).pipe(
      map(data => {
        return data['_embedded'] ? data['_embedded']['submissionErrors'] : [];
      })
    );
  }

  private submissionManifestEndpoint(submissionEnvelope) {
    return this.ingestService.get(submissionEnvelope['_links']['submissionManifest']['href']).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          // do nothing, the endpoint throws error when no submission manifest is found
          this.isLinkingDone = true;
        } else {
          console.error(err);
        }
        // do nothing
        return of([]);
      })
    );
  }

  private connectProject(submissionId) {
    this.projectDataSource = new SimpleDataSource<Project>(() => this.ingestService.getSubmissionProject(submissionId));
    this.projectDataSource.connect(true, 15000).subscribe(project => {
      this.setProject(project);
      // Finished loading once project is retrieved.
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.submissionDataSource.disconnect();
    this.projectDataSource.disconnect();
    this.protocolsDataSource.disconnect();
    this.processesDataSource.disconnect();
    this.biomaterialsDataSource.disconnect();
    this.filesDataSource.disconnect();
  }

  checkIfValid(submission) {
    const status = submission['submissionState'];
    const VALID = 'Graph valid';
    return (status === VALID || this.isStateSubmitted(SUBMISSION_STATES[status]));
  }

  setProject(project) {
    if (project) {
      this.project = project;
      this.projectShortName = this.getProjectShortName();
      this.projectTitle = this.getProjectTitle();
      this.projectUuid = this.getProjectUuid();
    }
  }

  getProjectShortName() {
    return this.project && this.project['content'] && this.project['content']['project_core'] ?
      this.project['content']['project_core']['project_short_name'] : '';
  }

  getProjectTitle() {
    return this.project && this.project['content'] && this.project['content']['project_core'] ?
      this.project['content']['project_core']['project_title'] : '';
  }

  getProjectUuid() {
    return this.project && this.project['uuid'] ? this.project['uuid']['uuid'] : '';
  }

  isStateSubmitted(state) {
    return (SUBMITTED_STATES.indexOf(state) >= 0);
  }

  getLink(submissionEnvelope, linkName) {
    const links = submissionEnvelope['_links'];
    return links && links[linkName] ? links[linkName]['href'] : null;
  }

  downloadFile() {
    const uuid = this.submissionEnvelope['uuid']['uuid'];
    this.loaderService.display(true);
    this.brokerService.downloadSpreadsheet(uuid).subscribe(response => {
      const filename = response['filename'];
      const newBlob = new Blob([response['data']]);

      // For other browsers:
      // Create a link pointing to the ObjectURL containing the blob.
      const data = window.URL.createObjectURL(newBlob);

      const link = document.createElement('a');
      link.href = data;
      link.download = filename;
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
        link.remove();
      }, 100);

      this.loaderService.display(false);
    });
  }

  onDeleteSubmission(submissionEnvelope: SubmissionEnvelope) {
    const submissionId: String = SubmissionComponent.getSubmissionId(submissionEnvelope);
    const projectInfo = this.projectTitle ? `(${this.projectTitle})` : '';
    const submissionUuid = submissionEnvelope['uuid']['uuid'];
    const message = `This may take some time. Are you sure you want to delete the submission with UUID ${submissionUuid} ${projectInfo} ?`;
    const messageOnSuccess = `The submission with UUID ${submissionUuid} ${projectInfo} was deleted!`;
    const messageOnError = `An error has occurred while deleting the submission w/UUID ${submissionUuid} ${projectInfo}`;

    if (confirm(message)) {
      this.loaderService.display(true);
      this.ingestService.deleteSubmission(submissionId).subscribe(
        () => {
          this.alertService.clear();
          this.alertService.success('', messageOnSuccess, true, true);
          this.loaderService.display(false);
          this.router.navigate(['/projects/detail'], {queryParams: {uuid: this.projectUuid}});
        },
        err => {
          this.alertService.clear();
          this.alertService.error(messageOnError, err.error.message, true, true);
          console.log('error deleting submission', err);
          this.loaderService.display(false);
          this.router.navigate(['/projects/detail'], {queryParams: {uuid: this.projectUuid}});
        }
      );
    }
  }

  getContributors(project: Project) {
    let contributors = project && project.content && project.content['contributors'];
    contributors = contributors ? project.content['contributors'] : [];
    const correspondents = contributors.filter(contributor => contributor['corresponding_contributor'] === true);
    return correspondents.map(c => c['name']).join(' | ');
  }

  private initArchiveEntityDataSource(submissionUuid: string) {
    this.ingestService.getArchiveSubmission(submissionUuid)
      .subscribe(
        archiveSubmission => {
          if (archiveSubmission) {
            const entitiesUrl = archiveSubmission['_links']['entities']['href'];
            this.archiveEntityDataSource = new PaginatedDataSource<ArchiveEntity>(
              params => this.ingestService.get(entitiesUrl, {params}).pipe(
                // TODO: This gets done a lot, refactor
                map(data => data as ListResult<any>),
                map(data => {
                  return {
                    data: data && data._embedded ? data._embedded['archiveEntities'] : [],
                    page: data.page
                  };
                })
              )
            );
          }
        }
      );
  }

  private initDataSources() {
    const submissionTypes = ['biomaterials', 'processes', 'protocols', 'files', 'bundleManifests'];
    submissionTypes.forEach(type => {
      if (this[`${type}DataSource`]) {
        return;
      }
      this[`${type}DataSource`] = new MetadataDataSource<any>(
        (params) => this.ingestService.fetchSubmissionData(this.submissionEnvelopeId, type, params),
        type
      );
    });
  }

  onErrorClick({ source, validationState }): void {
    const index = SubmissionTab[source.toUpperCase()].valueOf();
    this.selectedIndex = index;

    const dataSource = this[`${source}DataSource`];

    if(validationState === 'Invalid Graph') {
      // No way to filter by invalid graph for now until dcp-546
      dataSource.filterByState('')
    } else {
      dataSource.filterByState(validationState)
    }
  }

  displayValidateAndSubmitTabs(): boolean {
    return [
      SUBMISSION_STATES.Submitted,
      SUBMISSION_STATES.Processing,
      SUBMISSION_STATES.Archiving,
      SUBMISSION_STATES.Exporting,
      SUBMISSION_STATES.Cleanup,
      SUBMISSION_STATES.Complete
    ].indexOf(SUBMISSION_STATES[this.submissionState]) < 0;
  }

  displayAccessionTab(): boolean {
    return [
      SUBMISSION_STATES.Archiving,
      SUBMISSION_STATES.Archived,
      SUBMISSION_STATES.Exported,
      SUBMISSION_STATES.Cleanup,
      SUBMISSION_STATES.Cleanup,
      SUBMISSION_STATES.Complete
    ].indexOf(SUBMISSION_STATES[this.submissionState]) >= 0;
  }

  triggerGraphValidation(): void {
    const url = `${this.submissionEnvelope['_links']['self']['href']}/graphValidationRequestedEvent`
    this.ingestService.put(url, {}).subscribe(
      (submissionEnvelope) => {
        // Pre-emptively set the validation state
        this.submissionState = SUBMISSION_STATES.GraphValidationRequested;
      },
      err => {
        // Pre-emptively set the validation state
        this.submissionState = SUBMISSION_STATES.Valid;
        this.alertService.error('An error occurred while triggering validation', err.message)
      }
    )
  }
}
