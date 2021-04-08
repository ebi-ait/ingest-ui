import {Component, OnInit, ViewChild} from '@angular/core';
import * as metadataSchema from '../../project-form/project-metadata-schema.json';
import * as ingestSchema from '../../project-form/project-ingest-schema.json';
import {Project} from '../../shared/models/project';
import {MetadataFormConfig} from '../../metadata-schema-form/models/metadata-form-config';
import {MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {IngestService} from '../../shared/services/ingest.service';
import {AlertService} from '../../shared/services/alert.service';
import {LoaderService} from '../../shared/services/loader.service';
import {SchemaService} from '../../shared/services/schema.service';
import {projectRegLayout} from './project-reg-layout';
import {Observable, of} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {AutofillProjectService} from '../services/autofill-project.service';
import {Identifier} from '../models/europe-pmc-search';
import {AutofillProject} from '../models/autofill-project';

@Component({
  selector: 'app-project-registration-form',
  templateUrl: './project-registration-form.component.html',
  styleUrls: ['./project-registration-form.component.css']
})
export class ProjectRegistrationFormComponent implements OnInit {

  //  TODO This code needs a bit of refactoring.
  //  There are some code duplication here with Project form component.

  title: string;

  projectMetadataSchema: any = (metadataSchema as any).default;
  projectIngestSchema: any = (ingestSchema as any).default;

  projectFormData$: Observable<object>;
  projectFormData: object;
  projectFormTabKey: string;

  config: MetadataFormConfig;

  patch: object = {};

  schema: string;

  userIsWrangler = false;

  @ViewChild('mf') formTabGroup: MatTabGroup;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private ingestService: IngestService,
              private alertService: AlertService,
              private loaderService: LoaderService,
              private schemaService: SchemaService,
              private autofillProjectService: AutofillProjectService,
  ) {
  }

  ngOnInit() {
    const queryParam = this.route.snapshot.queryParamMap;
    const emptyProject = {content: {}};
    this.projectFormData$ = of(emptyProject);

    if (queryParam.has(Identifier.DOI)) {
      this.projectFormData$ = this.autofillProjectDetails(Identifier.DOI, queryParam.get(Identifier.DOI));
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
        this.projectFormData = emptyProject;
      }
    );

    this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;
    this.config = {
      hideFields: [
        'describedBy',
        'schema_version',
        'schema_type',
        'provenance'
      ],
      layout: projectRegLayout,
      inputType: {
        'project_description': 'textarea',
        'notes': 'textarea'
      },
      overrideRequiredFields: {
        'project.content.contributors.project_role.text': false
      },
      submitButtonLabel: 'Register Project',
      cancelButtonLabel: 'Or Cancel project registration'
    };

    this.projectFormTabKey = this.config.layout.tabs[0].key;


    this.title = 'New Project';
    this.ingestService.getUserAccount().subscribe(account => this.userIsWrangler = account.isWrangler());
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
    this.projectFormTabKey = $tabKey;
  }

  incrementProjectTab() {
    let index = projectRegLayout.tabs.findIndex(tab => tab.key === this.projectFormTabKey);
    if (index + 1 < projectRegLayout.tabs.length) {
      index++;
      this.projectFormTabKey = projectRegLayout.tabs[index].key;
      return true;
    }
    return false;
  }

  decrementProjectTab() {
    let index = projectRegLayout.tabs.findIndex(tab => tab.key === this.projectFormTabKey);
    if (index > 0) {
      index--;
      this.projectFormTabKey = projectRegLayout.tabs[index].key;
      return true;
    }
    return false;
  }

  private autofillProjectDetails(id, search): Observable<object> {
    return this.autofillProjectService.getProjectDetails(id, search)
      .pipe(
        map(
          (data: AutofillProject) => {
            const project_core = {};
            const publication = {};

            const projectFormData = {
              content: {}
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
