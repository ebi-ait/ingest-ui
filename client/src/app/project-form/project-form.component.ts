import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {IngestService} from '../shared/services/ingest.service';
import {AlertService} from '../shared/services/alert.service';
import {SchemaService} from '../shared/services/schema.service';
import {Project} from '../shared/models/project';
import * as metadataSchema from './project-metadata-schema.json';
import * as ingestSchema from './project-ingest-schema.json';
import {layout} from './layout';
import {LoaderService} from '../shared/services/loader.service';
import {Observable} from 'rxjs';
import {MatTabGroup} from '@angular/material/tabs';
import {MetadataFormConfig} from '../metadata-schema-form/models/metadata-form-config';
import {concatMap} from 'rxjs/operators';
import {MetadataFormLayout} from '../metadata-schema-form/models/metadata-form-layout';
import {Account} from '../core/account';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {
  title: string;
  subtitle: string;

  projectMetadataSchema: any = (metadataSchema as any).default;
  projectIngestSchema: any = (ingestSchema as any).default;

  projectResource: Project;
  projectContent: object;

  projectFormData: object;

  createMode = true;
  formValidationErrors: any = null;
  formIsValid: boolean = null;
  formTabKey: string;
  projectFormLayout: MetadataFormLayout;
  userAccount$: Observable<Account>;
  userIsWrangler: boolean;
  config: MetadataFormConfig;

  patch: object = {};

  schema: string;

  @ViewChild('mf') formTabGroup: MatTabGroup;
  private userAccount: Account;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ingestService: IngestService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private schemaService: SchemaService) {
  }

  ngOnInit() {
    this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;

    const pathVariables = this.route.snapshot.paramMap;
    const projectUuid: string = pathVariables.get('uuid');

    this.projectResource = null;
    this.formIsValid = null;
    this.formValidationErrors = null;
    this.projectContent = {};
    this.projectFormData = {
      content: {}
    };

    if (projectUuid) {
      this.createMode = false;
      this.setProjectContent(projectUuid);
    } else {
      this.setSchema(this.projectFormData['content']);
    }

    this.title = this.createMode ? 'New Project' : 'Edit Project';
    this.subtitle = this.createMode ? 'Please provide initial information about your HCA project.\n' +
      '  You will be able to edit this information as your project develops.' : '';

    this.userAccount$ = this.ingestService.getUserAccount();
    this.userAccount$
      .subscribe((account) => {
        this.userIsWrangler = account.isWrangler();
        this.setUpProjectForm(this.userIsWrangler, layout, this.createMode, pathVariables);
        this.userAccount = account;
      });
  }

  isInitialised(): boolean {
    return !!(this.schema && (this.projectResource || this.createMode) && this.userAccount && this.config);
  }

  setUpProjectForm(userIsWrangler: boolean, tabLayout: MetadataFormLayout, createMode: boolean, pathVariables: ParamMap) {
    let tabs = tabLayout.tabs;
    if (!userIsWrangler) {
      tabs = tabs.filter(tab => tab.key !== 'project_admin');
    }

    tabLayout.tabs = tabs;
    this.setTabLayout(tabLayout);
    this.createFormConfig(this.getTabLayout(), createMode);
    if (pathVariables.has('tab')) {
      this.setCurrentTab(pathVariables.get('tab'));
    } else {
      this.setCurrentTab(this.getTabLayout().tabs[0].key);
    }
  }

  setCurrentTab(tab: string) {
    this.formTabKey = tab;
  }

  getCurrentTab(): string {
    return this.formTabKey;
  }

  setTabLayout(tabLayout: MetadataFormLayout) {
    this.projectFormLayout = tabLayout;
  }

  getTabLayout(): MetadataFormLayout {
    return this.projectFormLayout;
  }

  createFormConfig(tabLayout: MetadataFormLayout, createMode: boolean) {
    this.config = {
      hideFields: [
        'describedBy',
        'schema_version',
        'schema_type',
        'provenance'
      ],
      layout: tabLayout,
      inputType: {
        'project_description': 'textarea',
        'notes': 'textarea',
        'wranglingNotes': 'textarea'
      },
      showCancelButton: !createMode,
      showResetButton: false
    };
  }

  getFormConfig(): MetadataFormConfig {
    return this.config;
  }

  setProjectContent(projectUuid) {
    this.ingestService.getProjectByUuid(projectUuid)
      .subscribe(projectResource => {
          console.log('Retrieved project', projectResource);
          this.projectResource = projectResource;
          if (projectResource?.content) {
            if (!projectResource?.content.hasOwnProperty('describedBy')
              || !projectResource?.content.hasOwnProperty('schema_type')) {
              this.schemaService.getUrlOfLatestSchema('project').subscribe(schemaUrl => {
                projectResource.content['describedBy'] = schemaUrl;
                projectResource.content['schema_type'] = 'project';
                this.schema = projectResource.content['describedBy'];
              });
            } else {
              this.schema = projectResource.content['describedBy'];
            }
          }

          this.projectContent = projectResource.content;
          this.projectFormData = this.projectResource;
          this.displayPostValidationErrors();
        },
        error => {
          this.alertService.error('Project could not be retrieved.', error.message);
        });
  }

  onTabChange($tabKey: string) {
    this.setCurrentTab($tabKey);
  }

  onSave(formData: object) {
    const formValue = formData['value'];
    this.loaderService.display(true);
    this.alertService.clear();
    this.createOrSaveProject(formValue)
      .subscribe(project => {
          console.log('Project saved', project);
          this.updateProjectContent(project);
          this.loaderService.display(false);
          this.incrementTab();
        },
        error => {
          this.loaderService.display(false);
          this.alertService.error('Error', error.message);
        });
  }

  onBack($event: boolean) {
    this.decrementTab();
  }

  onCancel($event: boolean) {
    if ($event) {
      if (this.createMode) {
        this.router.navigate(['/projects']);
      } else {
        this.router.navigateByUrl(`/projects/detail?uuid=${this.projectResource['uuid']['uuid']}`);
      }
    }
  }

  displayPostValidationErrors() {
    if (!this.projectResource) {
      return null;
    }
    if (this.projectResource.validationState !== 'Invalid') {
      return null;
    }
    const errorArray = [];
    for (const error of this.projectResource.validationErrors) {
      errorArray.push(error.userFriendlyMessage);
    }
    const message = '<ul><li>' + errorArray.join('</li><li>') + '</li>';
    this.alertService.error('JSON Validation Error', message, false, false);
  }

  setSchema(obj: object) {
    this.schemaService.getUrlOfLatestSchema('project')
      .subscribe(schemaUrl => {
        obj['describedBy'] = schemaUrl;
        obj['schema_type'] = 'project';
        this.schema = schemaUrl;
      });
  }

  private updateProjectContent(projectResource: Project) {
    this.createMode = false;
    this.projectResource = projectResource;
    this.projectContent = this.projectResource.content;
  }

  private incrementTab() {
    let index = layout.tabs.findIndex(tab => tab.key === this.getCurrentTab());
    index++;
    if (index >= layout.tabs.length) {
      this.router.navigateByUrl(`/projects/detail?uuid=${this.projectResource['uuid']['uuid']}`);
    } else {
      this.setCurrentTab(layout.tabs[index].key);
    }
  }

  private decrementTab() {
    const index = layout.tabs.findIndex(tab => tab.key === this.getCurrentTab());
    if (index > 0) {
      this.setCurrentTab(layout.tabs[index - 1].key);
    }
  }

  private createOrSaveProject(formValue: object): Observable<Project> {
    console.log('formValue', formValue);
    if (this.createMode) {
      this.patch = formValue;
      return this.ingestService
        .postProject(this.patch)
        .pipe(
          // save fields outside content
          concatMap(createdProject => this.ingestService.partiallyPatchProject(createdProject, this.patch))
        );
    } else {
      this.patch = formValue;
      return this.ingestService.partiallyPatchProject(this.projectResource, this.patch);
    }
  }
}
