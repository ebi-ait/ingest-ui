import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Project} from '../shared/models/project';
import {AlertService} from '../shared/services/alert.service';
// TODO refactor these imports
// Ideally the project "view" components (this one) should be in the same module as the project edit components
import * as metadataSchema from '../project-create-edit/schemas/project-metadata-schema.json';
import * as ingestSchema from '../project-create-edit/schemas/project-ingest-schema.json';
import layout from '../project-create-edit/components/project-metadata-form/layout';
import {MetadataFormConfig} from '../metadata-schema-form/models/metadata-form-config';
import {Observable} from 'rxjs';
import {IngestService} from '../shared/services/ingest.service';
import {Account} from '../core/account';


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
  projectMetadataSchema: any = (metadataSchema as any).default;
  projectIngestSchema: any = (ingestSchema as any).default;
  userAccount$: Observable<Account>;
  config: MetadataFormConfig;
  private userAccount: Account;

  constructor(private alertService: AlertService, private ingestService: IngestService) {
  }

  ngOnInit() {
    this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;
    this.displayPostValidationErrors();

    this.userAccount$ = this.ingestService.getUserAccount();
    this.userAccount$
      .subscribe((account) => {
        const userIsWrangler = account.isWrangler();
        if (!userIsWrangler) {
          layout.tabs = layout.tabs.filter(tab => tab.key !== 'project_admin');
        }
        this.config = {
          hideFields: ['describedBy', 'schema_version', 'schema_type', 'provenance'],
          viewMode: true,
          removeEmptyFields: true,
          layout: layout
        };
        this.userAccount = account;
      });
  }

  isInitialised(): boolean {
    return !!(this.project && this.userAccount && this.config);
  }


  displayPostValidationErrors() {
    if (!this.project) {
      return null;
    }
    if (this.project.validationState !== 'Invalid') {
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
