import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
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
import layout from './layout';
import {Observable, Subject} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {AutofillProjectService} from '../../services/autofill-project.service';
import {ProjectCacheService} from '../../services/project-cache.service';
import {Account} from '../../../core/account';
import {MetadataFormLayout} from '../../../metadata-schema-form/models/metadata-form-layout';
import {AccessionFieldGroupComponent} from '../accession-field-group/accession-field-group.component';

@Component({
  selector: 'app-project-metadata-form',
  templateUrl: './project-metadata-form.component.html',
  styleUrls: ['./project-metadata-form.component.css']
})
export class ProjectMetadataFormComponent implements OnInit, OnDestroy {

  @Input() project: any;
  @Input() autosave = true;
  @Input() create = false;
  @Output() formValueChange = new EventEmitter<Observable<object>>();

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
        this.setUpProjectForm(this.userIsWrangler);
      });

    if (this.project) {
      this.setSchema();
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

  setUpProjectForm(userIsWrangler: boolean) {
    const projectFormLayout = layout;
    if (!userIsWrangler) {
      projectFormLayout.tabs = projectFormLayout.tabs.filter(tab => tab.key !== 'project_admin');
    }
    if (!this.create) {
      projectFormLayout.tabs = projectFormLayout.tabs.filter(tab => tab.key !== 'save');

      const accessionsIndex = projectFormLayout.tabs[0].items.findIndex(item => item?.component === AccessionFieldGroupComponent);
      // @ts-ignore
      const accessionsKeys: [string] = projectFormLayout.tabs[0].items[accessionsIndex].keys;
      projectFormLayout.tabs[0].items.splice(accessionsIndex, 1, ...accessionsKeys);
    }

    this.projectFormLayout = projectFormLayout;
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
        queryParams: { tab },
        queryParamsHandling: 'merge'
      });
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

  private setSchema(): void {
    if (this.project?.content) {
      if (this.project?.content.hasOwnProperty('describedBy')
        && this.project?.content.hasOwnProperty('schema_type')) {
        this.schema = this.project.content['describedBy'];
        return;
      }
    }

    this.schemaService.getUrlOfLatestSchema('project').subscribe(schemaUrl => {
      this.project['content']['describedBy'] = schemaUrl;
      this.project['content']['schema_type'] = 'project';
      this.schema = schemaUrl;
    });
  }

  private saveProject(formValue) {
    this.loaderService.display(true);
    this.alertService.clear();
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
}
