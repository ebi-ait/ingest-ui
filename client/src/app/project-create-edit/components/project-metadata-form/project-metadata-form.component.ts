import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as metadataSchema from '../../schemas/project-metadata-schema.json';
import * as ingestSchema from '../../schemas/project-ingest-schema.json';
import {Project} from '../../../shared/models/project';
import {MetadataFormConfig} from '../../../metadata-schema-form/models/metadata-form-config';
import {MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {IngestService} from '../../../shared/services/ingest.service';
import {AlertService} from '../../../shared/services/alert.service';
import {LoaderService} from '../../../shared/services/loader.service';
import {SchemaService} from '../../../shared/services/schema.service';
import {layout} from './layout';
import {Observable, Subject} from 'rxjs';
import {concatMap, delay, map, takeUntil} from 'rxjs/operators';
import {AutofillProjectService} from '../../services/autofill-project.service';
import {ProjectCacheService} from '../../services/project-cache.service';
import {Account} from '../../../core/account';
import {MetadataFormLayout} from '../../../metadata-schema-form/models/metadata-form-layout';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-project-metadata-form',
  templateUrl: './project-metadata-form.component.html',
  styleUrls: ['./project-metadata-form.component.css']
})
export class ProjectMetadataFormComponent implements OnInit, OnDestroy {

  @Input() project: any;
  @Input() autosave = true;

  projectMetadataSchema: any = (metadataSchema as any).default;
  projectIngestSchema: any = (ingestSchema as any).default;
  projectFormTabKey: string;
  projectFormLayout: MetadataFormLayout;

  config: MetadataFormConfig;

  patch: object = {};

  schema: string;

  userAccount$: Observable<Account>;
  userIsWrangler: boolean;

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
    this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;
    this.userAccount$ = this.ingestService.getUserAccount();
    this.userAccount$
      .subscribe((account) => {
        this.userIsWrangler = account.isWrangler();
        this.setUpProjectForm(this.userIsWrangler, layout);
      });

    if (this.project) {
      this.setSchema();
    }
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

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  private setSchema(): void {
    if (this.project?.content) {
      if (this.project?.content.hasOwnProperty('describedBy')
        && this.project?.content.hasOwnProperty('schema_type')) {
        this.schema = this.project.content['describedBy'];
        return;
      }
    }

    this.schemaService.getUrlOfLatestSchema('project').pipe(
      map(schemaUrl => {
        this.project['content']['describedBy'] = schemaUrl;
        this.project['content']['schema_type'] = 'project';
        this.schema = schemaUrl;
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

  saveProjectInCache(formData: Observable<object>) {
    if (!this.autosave) {
      return;
    }
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
}
