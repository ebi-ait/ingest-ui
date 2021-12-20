import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {Account} from '@app/core/account';
import {MetadataFormConfig} from '@metadata-schema-form/models/metadata-form-config';
import {MetadataFormLayout} from '@metadata-schema-form/models/metadata-form-layout';
import {Project} from '@shared/models/project';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {Observable, of, Subject} from 'rxjs';
import {concatMap, tap} from 'rxjs/operators';
import * as ingestSchema from '../../schemas/project-ingest-schema.json';
import {ProjectCacheService} from '../../services/project-cache.service';
import getLayout from './layout';

@Component({
  selector: 'app-project-metadata-form',
  templateUrl: './project-metadata-form.component.html',
  styleUrls: ['./project-metadata-form.component.css']
})
export class ProjectMetadataFormComponent implements OnInit, OnDestroy {

  @Input() project: any;
  @Input() create = false;
  @Output() formValueChange = new EventEmitter<Observable<object>>();

  projectMetadataSchema: object;
  projectIngestSchema: any = (ingestSchema as any).default;
  projectFormTabKey: string;
  projectFormLayout: MetadataFormLayout;

  config: MetadataFormConfig;

  patch: object = {};

  schemaUrl: string;

  userAccount$: Observable<Account>;
  userIsWrangler: boolean;

  userAccount: Account;

  @ViewChild('mf') formTabGroup: MatTabGroup;
  private unsubscribe = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ingestService: IngestService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private schemaService: SchemaService,
              private projectCacheService: ProjectCacheService,
  ) {
  }

  ngOnInit() {
    this.userAccount$ = this.ingestService.getUserAccount();
    this.userAccount$
      .subscribe((account) => {
        this.userAccount = account;
        this.userIsWrangler = account.isWrangler();
        this.setUpProjectForm();
      });

    if (this.project) {
      this.setSchema();
    }

  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  setUpProjectForm() {
    this.projectFormLayout = getLayout(this.create, this.userIsWrangler);
    this.setFormConfig();

    if (this.route.snapshot.queryParamMap.has('tab')) {
      this.setCurrentTab(this.route.snapshot.queryParamMap.get('tab'));
    } else {
      this.setCurrentTab(this.projectFormLayout.tabs[0].key);
    }
  }

  setFormConfig() {
    this.config = {
      hideFields: [
        'describedBy',
        'schema_version',
        'schema_type',
        'provenance'
      ],
      layout: this.projectFormLayout,
      inputType: {
        'project_description': 'textarea',
        'notes': 'textarea',
        'wranglingNotes': 'textarea'
      },
      overrideRequiredFields: {
        'project.content.contributors.project_role.text': false
      },
      overrideGuidelines: {
        'project.content.publications.official_hca_publication': 'Has the publication been accepted as an official HCA publication,\ ' +
          'according to the process described in https://www.humancellatlas.org/publications/ ?'
      },
      submitButtonLabel: this.create ? 'Register Project' : 'Save',
      cancelButtonLabel: this.create ? 'Or Cancel project registration' : ' Cancel'
    };
  }

  setCurrentTab(tab: string) {
    this.projectFormTabKey = tab;
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {tab},
        queryParamsHandling: 'merge'
      });
  }

  onSave({ valid, validationSkipped, value }) {
    if (!this.incrementProjectTab()) {
      if (valid) {
        this.saveProject(value);
      } else if (validationSkipped) {
        if (this.create) {
          value.isInCatalogue = false;
        }
        this.saveProject(value);
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

  incrementProjectTab() {
    let index = this.findCurrentTabIndex();
    if (index + 1 < this.projectFormLayout.tabs.length) {
      index++;
      this.setCurrentTab(this.projectFormLayout.tabs[index].key);
      return true;
    }
    return false;
  }

  decrementProjectTab() {
    let index = this.findCurrentTabIndex();
    if (index > 0) {
      index--;
      this.setCurrentTab(this.projectFormLayout.tabs[index].key);
      return true;
    }
    return false;
  }

  private findCurrentTabIndex() {
    return this.projectFormLayout.tabs.findIndex(tab => tab.key === this.projectFormTabKey);
  }

  private getSchemaUrl(): Observable<string> {
    let schemaUrl$;
    if (this.project?.content &&
      this.project?.content.hasOwnProperty('describedBy') &&
      this.project?.content.hasOwnProperty('schema_type')) {
      schemaUrl$ = of(this.project.content['describedBy']);
    } else {
      schemaUrl$ = this.schemaService.getUrlOfLatestSchema('project');
    }
    return schemaUrl$;
  }

  private setSchema(): void {
    this.getSchemaUrl().pipe(
      tap(schemaUrl => {
        this.schemaUrl = schemaUrl;
        this.project['content']['describedBy'] = schemaUrl;
        this.project['content']['schema_type'] = 'project';
      }),
      concatMap(schemaUrl => this.schemaService.getDereferencedSchema(this.schemaUrl))
    ).subscribe(schema => {
      this.projectMetadataSchema = schema;
      this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;
    });
  }

  private saveProject(formValue) {
    this.loaderService.display(true);
    this.createOrUpdateProject(formValue).subscribe(project => {
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

  private createOrUpdateProject(formValue: object): Observable<Project> {
    console.log('formValue', formValue);
    const patch = formValue;
    if (this.create) {
      return this.ingestService
        .postProject(patch)
        .pipe(
          // save fields outside content
          concatMap(createdProject => this.ingestService.partiallyPatchProject(createdProject, patch))
        );
    }
    return this.ingestService.partiallyPatchProject(this.project, patch);
  }

  onFormValueChange($event) {
    this.formValueChange.emit($event);
  }

  isFormDataComplete() {
    return !!(
      this.userAccount &&
      this.project &&
      this.config &&
      this.schemaUrl &&
      this.projectMetadataSchema);
  }
}
