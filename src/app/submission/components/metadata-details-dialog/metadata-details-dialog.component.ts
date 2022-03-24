import {Component, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MetadataFormComponent} from '@metadata-schema-form/metadata-form/metadata-form.component';
import {MetadataFormConfig} from '@metadata-schema-form/models/metadata-form-config';
import {MetadataFormLayout, MetadataFormTab} from '@metadata-schema-form/models/metadata-form-layout';
import {MetadataDocument} from '@shared/models/metadata-document';
import {AlertService} from '@shared/services/alert.service';
import {isEqual} from 'lodash';

@Component({
  selector: 'app-metadata-details',
  templateUrl: './metadata-details-dialog.component.html',
  styleUrls: ['./metadata-details-dialog.component.css']
})
export class MetadataDetailsDialogComponent implements OnInit {
  @ViewChild(MetadataFormComponent)
  metadataFormComponent: MetadataFormComponent;

  @Output()
  metadataSaved = new EventEmitter<any>();

  content: any;
  schema: object;
  schemaUrl: string;
  formTabKey: any;

  domainEntity: string;
  concreteType: string;
  errorMessage: string;
  validationErrors: any[];
  dialogTitle: string;

  config: MetadataFormConfig = {
    hideFields: [
      'describedBy',
      'schema_version',
      'schema_type',
      'provenance'
    ],
    viewMode: false,
    showCancelButton: false,
    showResetButton: false,
    submitButtonLabel: 'Save'
  };

  constructor(private alertService: AlertService,
              public dialogRef: MatDialogRef<MetadataDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public dialogData: any) {
  }

  ngOnInit(): void {
    if (!this.dialogData.hasOwnProperty('schema')) {
      this.alertService.error('Error: No schema to start form!', 'This is probably our fault rather than yours, please contact your wrangler or developer.');
      console.error(`Could not create form since schema is a required field!`, this.dialogData);
      this.dialogRef.close();
      return;
    }
    this.schema = this.dialogData['schema'];
    this.schemaUrl = this.schema['$id'];
    this.setSchemaUrlDependencies();
    if (this.dialogData.hasOwnProperty('metadata')) {
      this.editModeInit(this.dialogData['metadata']);
    } else {
      this.newModeInit();
    }
  }

  onSave() {
    const newContent = this.metadataFormComponent.getFormData()['value'];
    if (isEqual(this.content, newContent)) {
      this.errorMessage = 'There are no changes done.';
      return;
    }
    this.config.viewMode = true;
    this.metadataSaved.emit(newContent);
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private setSchemaUrlDependencies() {
    const slicedUrl = this.schemaUrl.split('/').reverse();
    this.concreteType = slicedUrl[0];
    if (slicedUrl[3] === 'type') {
      this.domainEntity = slicedUrl[2];
    } else {
      this.domainEntity = slicedUrl[3];
    }

    const layout: MetadataFormLayout = {
      tabs: []
    };

    const tab: MetadataFormTab = {
      items: [this.concreteType], key: this.concreteType, title: ''
    };

    layout.tabs = [tab];
    this.config.layout = layout;
  }

  private editModeInit(metadata: MetadataDocument) {
    this.content = metadata.content;
    this.validationErrors = metadata.validationErrors;
    this.dialogTitle = `Edit ${this.domainEntity} - ${metadata['uuid']['uuid']}`;
  }

  private newModeInit() {
    this.content = {
      describedBy: this.schemaUrl,
      schema_type: this.domainEntity,
    };
    this.validationErrors = [];
    this.dialogTitle = `New ${this.domainEntity} - ${this.concreteType}`;
  }
}
