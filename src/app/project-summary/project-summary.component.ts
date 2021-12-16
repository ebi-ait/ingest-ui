import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MetadataFormConfig} from '@metadata-schema-form/models/metadata-form-config';
import {SUBMISSION_STATES} from "@shared/constants";
import {Project} from '@shared/models/project';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {SchemaService} from '@shared/services/schema.service';
import {Observable} from 'rxjs';
import {Account} from '../core/account';
import getLayout from '../projects/components/project-metadata-form/layout';
import * as ingestSchema from '../projects/schemas/project-ingest-schema.json';


@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit {
  @Input() project: Project;
  @Output() tabChange = new EventEmitter<string>();
  title: string;
  subtitle: string;
  projectMetadataSchema: any;
  projectIngestSchema: any = (ingestSchema as any).default;
  userAccount$: Observable<Account>;
  config: MetadataFormConfig;
  private userAccount: Account;

  constructor(private alertService: AlertService,
              private ingestService: IngestService,
              private schemaService: SchemaService) {
  }

  ngOnInit() {
    const schemaUrl = this.project.content['describedBy'];
    this.schemaService.getDereferencedSchema(schemaUrl)
      .subscribe(schema => {
        this.projectMetadataSchema = schema;
        this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;
      });
    this.displayPostValidationErrors();

    this.userAccount$ = this.ingestService.getUserAccount();
    this.userAccount$
      .subscribe((account) => {

        this.config = {
          hideFields: ['describedBy', 'schema_version', 'schema_type', 'provenance'],
          viewMode: true,
          removeEmptyFields: true,
          layout: getLayout(false, account.isWrangler())
        };
        this.userAccount = account;
      });
  }

  isInitialised(): boolean {
    return !!(this.project && this.projectMetadataSchema && this.userAccount && this.config);
  }


  displayPostValidationErrors() {
    if (!this.project) {
      return null;
    }
    if (this.project.validationState !== SUBMISSION_STATES.Invalid) {
      return null;
    }
    const errorArray = [];
    for (const error of this.project.validationErrors) {
      if (error.userFriendlyMessage) {
        errorArray.push(error.userFriendlyMessage);
      } else {
        errorArray.push(error.message);
      }
    }
    const message = '<ul><li>' + errorArray.join('</li><li>') + '</li>';
    this.alertService.error('JSON Validation Error', message, false, false);
  }

  onTabChange($tabKey: string) {
    this.tabChange.emit($tabKey);
  }
}
