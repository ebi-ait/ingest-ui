import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Project} from '../shared/models/project';
import {AlertService} from '../shared/services/alert.service';
import * as metadataSchema from '../project-form/project-metadata-schema.json';
import * as ingestSchema from '../project-form/project-ingest-schema.json';
import {layout} from '../project-form/layout';
import {MetadataFormConfig} from '../metadata-schema-form/models/metadata-form-config';


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

  config: MetadataFormConfig = {
    hideFields: ['describedBy', 'schema_version', 'schema_type', 'provenance'],
    viewMode: true,
    removeEmptyFields: true,
    layout: layout
  };

  constructor(private alertService: AlertService) {
  }

  ngOnInit() {
    this.projectIngestSchema['properties']['content'] = this.projectMetadataSchema;
    this.displayPostValidationErrors();
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