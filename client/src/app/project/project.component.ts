import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';

import {AlertService} from '../shared/services/alert.service';
import {IngestService} from '../shared/services/ingest.service';
import {SubmissionEnvelope} from '../shared/models/submissionEnvelope';
import {LoaderService} from '../shared/services/loader.service';
import {Project} from '../shared/models/project';
import {MetadataDataSource} from '../shared/data-sources/metadata-data-source';
import {MetadataDocument} from '../shared/models/metadata-document';
import {map} from 'rxjs/operators';
import {PagedData} from '../shared/models/page';
import {Observable} from 'rxjs';
import {ListResult} from '../shared/models/hateoas';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})


export class ProjectComponent implements OnInit {
  submissionEnvelopes: SubmissionEnvelope[];

  profile: object;

  project: Project;

  projectId: string;
  projectUuid: string;
  upload = false;
  selectedProjectTabKey: string;
  userIsWrangler: boolean;

  biomaterialsDataSource: MetadataDataSource<MetadataDocument>;
  protocolsDataSource: MetadataDataSource<MetadataDocument>;
  processesDataSource: MetadataDataSource<MetadataDocument>;
  filesDataSource: MetadataDataSource<MetadataDocument>;

  sharedTabConfig = [
    {
      key: 'project',
      label: '1. Project'
    },
    {
      key: 'experiment-info',
      label: '2. Experiment Information'
    },
    {
      key: 'upload',
      label: '3. Data upload'
    }
  ];

  wranglerTabConfig = [
      ...this.sharedTabConfig,
    {
      key: 'metadata',
      label: '4. View Metadata'
    },
    {
      key: 'data',
      label: '5. View Data'
    }
  ];

  tabConfig = this.sharedTabConfig;

  constructor(
    private alertService: AlertService,
    private ingestService: IngestService,
    private router: Router,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
  ) {
  }

  ngOnInit() {
    this.initProject();
    this.ingestService.getUserAccount().subscribe(account => {
      this.userIsWrangler = account.isWrangler();
      if (this.userIsWrangler) {
        this.tabConfig = this.wranglerTabConfig;
      }
    });
  }

  getProject(id) {
    this.ingestService.getProject(id).subscribe(projectData => {
      this.setProjectData(projectData);
    }, error => {
      console.error(error);
      this.alertService.error('Project Not Found', `Project could not be found.`, true, true);
      this.router.navigate([`/projects`]);
    });

  }

  getProjectByUuid(uuid) {
    this.ingestService.getProjectByUuid(uuid).subscribe(projectData => {
      this.setProjectData(projectData);
    }, error => {
      console.error(error);
      this.alertService.error('Project Not Found', `Project ${uuid} was not found.`, true, true);
      this.router.navigate([`/projects`]);
    });
  }

  setProjectData(projectData: Project) {
    this.project = projectData;
    this.initDataSources(projectData);
    const submissionsUrl = projectData['_links']['submissionEnvelopes']['href'];
    this.ingestService.get(submissionsUrl).subscribe(
      submissionData => {
        const submissions = submissionData['_embedded'] ? submissionData['_embedded']['submissionEnvelopes'] : [];
        this.submissionEnvelopes = submissions;
      }
    );

  }

  getProjectName() {
    return this.project && this.project['content'] && this.project['content']['project_core'] ?
      this.project['content']['project_core']['project_title'] : '';
  }

  getSubmissionId(submissionEnvelope) {
    const links = submissionEnvelope['_links'];
    return links && links['self'] && links['self']['href'] ? links['self']['href'].split('/').pop() : '';
  }

  getSubmissionUuid(submissionEnvelope) {
    return submissionEnvelope['uuid']['uuid'];
  }

  getProjectId(project) {
    const links = project['_links'];
    return links && links['self'] && links['self']['href'] ? links['self']['href'].split('/').pop() : '';
  }

  onDeleteSubmission(submissionEnvelope: SubmissionEnvelope) {
    const submissionId: String = this.getSubmissionId(submissionEnvelope);
    const projectName = this.getProjectName();
    const projectInfo = projectName ? `(${projectName})` : '';
    const submissionUuid = submissionEnvelope['uuid']['uuid'];
    const message = `This may take some time. Are you sure you want to delete the submission with UUID ${submissionUuid} ${projectInfo} ?`;
    const messageOnSuccess = `The submission with UUID ${submissionUuid} ${projectInfo} was deleted!`;
    const messageOnError = `An error has occurred while deleting the submission w/UUID ${submissionUuid} ${projectInfo}`;
    if (confirm(message)) {
      this.loaderService.display(true);
      this.ingestService.deleteSubmission(submissionId).subscribe(
        () => {
          this.alertService.clear();
          this.alertService.success('', messageOnSuccess);
          this.initProject();
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

  onDeleteProject() {
    if (!this.projectId) {
      this.projectId = this.getProjectId(this.project);
    }
    const projectName = this.getProjectName();
    const message = `Delete ${projectName}?`;
    const messageOnSuccess = `Project ${projectName} was deleted!`;
    const messageOnError = `An error has occurred while deleting project ${projectName}`;

    if (confirm(message)) {
      this.loaderService.display(true);
      this.ingestService.deleteProject(this.projectId).subscribe(
        () => {
          this.alertService.clear();
          this.alertService.success('', messageOnSuccess);
          this.loaderService.display(false);
          this.router.navigate(['/projects']);
        },
        err => {
          this.alertService.clear();
          this.alertService.error(messageOnError, err.error.message);
          console.error('error deleting project', err);
          this.loaderService.display(false);
        });
    }
  }

  onSwitchUpload() {
    this.upload = !this.upload;
  }

  canSubmit(project: Project) {
    return this.userIsWrangler &&
      !project.hasOpenSubmission &&
      project.validationState.toUpperCase() !== 'INVALID' &&
      !(project.validationErrors && project.validationErrors.length > 0);
  }

  private initProject() {
    this.route.queryParamMap.subscribe(queryParams => {
      this.projectUuid = queryParams.get('uuid');
      this.selectedProjectTabKey = queryParams.get('tab') || this.tabConfig[0].key;
    });

    this.projectId = this.route.snapshot.paramMap.get('id');

    if (this.projectId) {
      this.getProject(this.projectId);
    }

    if (this.projectUuid) {
      this.getProjectByUuid(this.projectUuid);
    }

    if (!this.projectId && !this.projectUuid) {
      this.router.navigate([`/projects`]);
    }
  }

  projectTabChange(tabKey: string) {
    if (!this.tabConfig.map(tab => tab.key).includes(tabKey)) {
      return;
    }
    this.selectedProjectTabKey = tabKey;
  }

  private fetchProjectEntities(projectData, entityType: string, params?): Observable<PagedData<any>> {
    const projectUrl = projectData._links['self']['href'];
    return this.ingestService.get(`${projectUrl}/${entityType}`, {params}).pipe(
        map(data => data as ListResult<any>),
        map(data => {
              // TODO always get the content for now
              return {
                data: (data && data._embedded ? data._embedded[entityType] : []).map(resource => resource['content']),
                page: data.page
              };
            }
        ));
  }

  private initDataSources(projectData: Project) {
    // TODO changes needed in Ingest Core so that these project entity endpoints can be in found in _links
    ['biomaterials', 'protocols', 'processes', 'files'].forEach(entityType => {
      this[`${entityType}DataSource`] = new MetadataDataSource(
          params => this.fetchProjectEntities(projectData, entityType, params),
          entityType
      );
    });
  }

  lookupTabIndex(tabKey: string): number {
    if (tabKey) {
      return this.tabConfig.findIndex(tab => tab.key === tabKey);
    } else {
      return 0;
    }
  }
}
