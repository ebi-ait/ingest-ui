import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as metadataSchema from '../../project-form/project-metadata-schema.json';
import * as ingestSchema from '../../project-form/project-ingest-schema.json';
import {Project} from '../../shared/models/project';
import {MetadataFormConfig} from '../../metadata-schema-form/models/metadata-form-config';
import {MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {IngestService} from '../../shared/services/ingest.service';
import {AlertService} from '../../shared/services/alert.service';
import {LoaderService} from '../../shared/services/loader.service';
import {SchemaService} from '../../shared/services/schema.service';
import {projectRegLayout} from './project-reg-layout';
import {Observable, of, Subject} from 'rxjs';
import {concatMap, delay, map, takeUntil} from 'rxjs/operators';
import {AutofillProjectService} from '../services/autofill-project.service';
import {Identifier} from '../models/europe-pmc-search';
import {AutofillProject} from '../models/autofill-project';
import {ProjectCacheService} from '../services/project-cache.service';
import {environment} from '../../../environments/environment';
import {Account} from '../../core/account';
import {MetadataFormLayout} from '../../metadata-schema-form/models/metadata-form-layout';

@Component({
  selector: 'app-project-registration-form',
  templateUrl: './project-registration-form.component.html',
  styleUrls: ['./project-registration-form.component.css']
})

export class ProjectRegistrationFormComponent implements OnInit, OnDestroy {

  //  TODO This code needs a bit of refactoring.
  //  There are some code duplication here with Project form component.

  title: string;

  projectMetadataSchema: any = (metadataSchema as any).default;
  projectIngestSchema: any = (ingestSchema as any).default;

  projectFormData$: Observable<object>;
  projectFormData: object;
  projectFormTabKey: string;
  projectFormLayout: MetadataFormLayout;

  config: MetadataFormConfig;

  patch: object = {};

  schema: string;

  userAccount$: Observable<Account>;
  userIsWrangler: boolean;

  private readonly _emptyProject = {
    content: {},
    isInCatalogue: true,
  };

  @ViewChild('mf') formTabGroup: MatTabGroup;
  private unsubscribe = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ingestService: IngestService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private schemaService: SchemaService,
              private autofillProjectService: AutofillProjectService,
              private projectCacheService: ProjectCacheService,
  ) {
  }

  ngOnInit() {
    const queryParam = this.route.snapshot.queryParamMap;

    this.title = 'New Project';
    this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;
    this.userAccount$ = this.ingestService.getUserAccount();
    this.userAccount$
      .subscribe((account) => {
        this.userIsWrangler = account.isWrangler();
        this.setUpProjectForm(this.userIsWrangler, projectRegLayout);
      });
    this.loadProjectData(queryParam);
  }

  setUpProjectForm(userIsWrangler: boolean, layout: MetadataFormLayout) {
    let tabs = layout.tabs;
    if (!userIsWrangler) {
      tabs = tabs.filter(tab => tab.key !== 'project_admin');
    }

    layout.tabs = tabs;
    this.setTabLayout(layout);
    this.setFormConfig(this.getTabLayout());
    this.setCurrentTab(this.getTabLayout().tabs[0].key);
  }

  loadProjectData(args: ParamMap) {
    this.projectFormData$ = of(this._emptyProject);

    if (args.has(Identifier.DOI)) {
      this.projectFormData$ = this.autofillProjectDetails(Identifier.DOI, args.get(Identifier.DOI));
    } else if (args.has('restore')) {
      this.projectCacheService.getProject().subscribe(() =>
        this.projectFormData$ = this.loadProjectFromCache());
    }

    this.projectFormData$
      .pipe(
        concatMap(project => this.setSchema(project))
      ).subscribe(
      data => {
        this.projectFormData = data;
      },
      error => {
        this.alertService.error('An error occurred, unable to load project details', error.message);
        this.projectFormData = this._emptyProject;
      }
    );
  }

  setFormConfig(layout: MetadataFormLayout) {
    this.config = {
      hideFields: [
        'describedBy',
        'schema_version',
        'schema_type',
        'provenance'
      ],
      layout: layout,
      inputType: {
        'project_description': 'textarea',
        'notes': 'textarea',
        'wranglingNotes': 'textarea'
      },
      overrideRequiredFields: {
        'project.content.contributors.project_role.text': false
      },
      submitButtonLabel: 'Register Project',
      cancelButtonLabel: 'Or Cancel project registration'
    };
  }

  getFormConfig(): MetadataFormConfig {
    return this.config;
  }

  setCurrentTab(tab: string) {
    this.projectFormTabKey = tab;
  }

  getCurrentTab(): string {
    return this.projectFormTabKey;
  }

  onSave(formData: object) {
    const formValue = formData['value'];
    const valid = formData['valid'];

    if (!this.incrementProjectTab()) {
      if (valid) {
        this.saveProject(formValue);
      } else {
        {
          this.alertService.clear();
          const message = 'Some fields in the form are invalid. Please go back through the form to check the errors and resolve them.';
          this.alertService.error('Invalid Form', message);
        }
      }
    }
  }

  onCancel($event: boolean) {
    if ($event) {
      this.router.navigate(['/projects']);
    }
  }

  onTabChange($tabKey: string) {
    this.setCurrentTab($tabKey);
  }

  setTabLayout(layout: MetadataFormLayout) {
    this.projectFormLayout = layout;
  }

  getTabLayout(): MetadataFormLayout {
    return this.projectFormLayout;
  }

  incrementProjectTab() {
    let index = this.findCurrentTabIndex();
    if (index + 1 < this.getTabLayout().tabs.length) {
      index++;
      this.setCurrentTab(this.getTabLayout().tabs[index].key);
      return true;
    }
    return false;
  }

  decrementProjectTab() {
    let index = this.findCurrentTabIndex();
    if (index > 0) {
      index--;
      this.setCurrentTab(this.getTabLayout().tabs[index].key);
      return true;
    }
    return false;
  }

  private findCurrentTabIndex() {
    return this.getTabLayout().tabs.findIndex(tab => tab.key === this.getCurrentTab());
  }

  saveProjectInCache(formData: Observable<object>) {
    formData.pipe(
      delay(environment.AUTOSAVE_PERIOD_MILLIS),
      takeUntil(this.unsubscribe)
    ).subscribe(
      (formValue) => {
        console.log('cached project to local storage');
        this.projectCacheService.saveProject(formValue['value']);
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  loadProjectFromCache(): Observable<Project> {
    console.log('fetching project from cache');
    return this.projectCacheService.getProject();
  }

  private autofillProjectDetails(id, search): Observable<object> {
    return this.autofillProjectService.getProjectDetails(id, search)
      .pipe(
        map(
          (data: AutofillProject) => {
            const project_core = {};
            const publication = {};

            const projectFormData = {
              ...this._emptyProject
            };

            project_core['project_title'] = data.title;
            project_core['project_description'] = data.description;

            projectFormData['content']['project_core'] = project_core;

            publication['doi'] = data.doi;
            publication['pmid'] = data.pmid;
            publication['title'] = data.title;
            publication['authors'] = data.authors;
            publication['url'] = data.url;

            projectFormData['content']['publications'] = [publication];
            projectFormData['content']['funders'] = data.funders;
            projectFormData['content']['contributors'] = data.contributors.map(contributor => ({
              name: contributor.first_name + ',,' + contributor.last_name,
              institution: contributor.institution,
              orcid_id: contributor.orcid_id
            }));
            return projectFormData;
          }
        ));
  }

  private setSchema(project): Observable<object> {
    return this.schemaService.getUrlOfLatestSchema('project').pipe(
      map(schemaUrl => {
        project['content']['describedBy'] = schemaUrl;
        project['content']['schema_type'] = 'project';
        this.schema = schemaUrl;
        return project;
      })
    );
  }

  private saveProject(formValue) {
    this.loaderService.display(true);
    this.alertService.clear();
    this.createProject(formValue).subscribe(project => {
        console.log('Project saved', project);
        this.loaderService.display(false);
        this.projectCacheService.removeProject();
        this.router.navigate(['projects', 'detail'], {
          queryParams: {
            uuid: project.uuid.uuid,
            tab: 'experiment-info'
          }
        });
      },
      error => {
        this.loaderService.display(false);
        this.alertService.error('Error', error.message);
      });
  }

  private createProject(formValue: object): Observable<Project> {
    console.log('formValue', formValue);
    this.patch = formValue;
    return this.ingestService
      .postProject(this.patch)
      .pipe(
        // save fields outside content
        concatMap(createdProject => this.ingestService.partiallyPatchProject(createdProject, this.patch))
      );
  }
}
