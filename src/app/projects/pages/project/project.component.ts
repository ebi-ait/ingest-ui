import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuditLog} from "@projects/models/audit-log";
import {GeoService} from "@projects/services/geo.service";
import {MetadataDataSource} from '@shared/data-sources/metadata-data-source';
import {ListResult} from '@shared/models/hateoas';
import {MetadataDocument} from '@shared/models/metadata-document';
import {PagedData} from '@shared/models/page';
import {Project} from '@shared/models/project';
import {SubmissionEnvelope} from '@shared/models/submissionEnvelope';

import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})


export class ProjectComponent implements OnInit {
  submissionEnvelopes: SubmissionEnvelope[];
  auditLogs: AuditLog[];

  profile: object;

  project: Project;

  projectId: string;
  projectUuid: string;
  upload = false;
  selectedProjectTabKey: string;
  selectedMainTabKey: string;
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
    },
    {
      key: 'audit-log',
      label: '5. History'
    }

  ];

  tabConfig = this.sharedTabConfig;

  constructor(
    private alertService: AlertService,
    private ingestService: IngestService,
    private router: Router,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private geoService: GeoService
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
    this.getProjectSubmissions(projectData);
    this.getProjectAuditLogs(projectData);
  }

  getProjectSubmissions(project: Project) {
    this.ingestService.get(project['_links']['submissionEnvelopes']['href']).subscribe(
      submissionData => {
        this.submissionEnvelopes = submissionData['_embedded'] ? submissionData['_embedded']['submissionEnvelopes'] : [];
      }
    );
  }

  getProjectAuditLogs(project: Project) {
    this.ingestService.get<AuditLog[]>(project['_links']['auditLogs']['href']).subscribe(
      auditLogs => {
        this.auditLogs = auditLogs ? auditLogs : [];
      });
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
          this.alertService.error(messageOnError, err.error?.exceptionMessage || err.error?.message || err.message);
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
          this.alertService.error(messageOnError, err.error?.exceptionMessage || err.error?.message || err.message);
          console.error('error deleting project', err);
          this.loaderService.display(false);
        });
    }
  }

  onSwitchUpload() {
    this.upload = !this.upload;
  }

  canSubmit(project: Project) {
    return this.userIsWrangler && !project.hasOpenSubmission;
  }

  projectTabChange(tabKey: string) {
    this.selectedProjectTabKey = tabKey;
  }

  mainTabChange($event) {
    this.selectedMainTabKey = this.tabConfig[$event.index].key;
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {tab: this.selectedMainTabKey},
        queryParamsHandling: 'merge'
      });
  }

  lookupTabIndex(tabKey: string): number {
    if (tabKey) {
      return this.tabConfig.findIndex(tab => tab.key === tabKey);
    } else {
      return 0;
    }
  }

  getProjectGeoAccession() {
    const content: { geo_series_accessions?: string[] } = this.project?.content;
    return content?.geo_series_accessions?.[0];
  }

  getProjectInsdcAccession() {
    const content: { insdc_study_accessions?: string[] } = this.project?.content;
    const accession = content?.insdc_study_accessions?.[0];

    if (this.geoService.isValidAccession(accession)) {
      return accession
    }
  }

  private initProject() {
    this.route.queryParamMap.subscribe(queryParams => {
      this.projectUuid = queryParams.get('uuid');
      this.selectedMainTabKey = queryParams.get('tab') || this.tabConfig[0].key;
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
}
