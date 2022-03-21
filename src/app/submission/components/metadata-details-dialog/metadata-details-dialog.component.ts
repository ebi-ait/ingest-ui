import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MetadataFormComponent} from '@metadata-schema-form/metadata-form/metadata-form.component';
import {MetadataFormConfig} from '@metadata-schema-form/models/metadata-form-config';
import {MetadataFormLayout, MetadataFormTab} from '@metadata-schema-form/models/metadata-form-layout';
import {MetadataDocument} from '@shared/models/metadata-document';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

enum SaveAction{
  PATCH,
  POST
}

@Component({
  selector: 'app-metadata-details',
  templateUrl: './metadata-details-dialog.component.html',
  styleUrls: ['./metadata-details-dialog.component.css']
})
export class MetadataDetailsDialogComponent implements OnInit {
  @ViewChild(MetadataFormComponent) metadataFormComponent: MetadataFormComponent;
  content: any;
  schema: object;
  schemaUrl: string;
  formTabKey: any;
  saveLink: string;
  saveAction: SaveAction;

  domainEntity: string;
  version: string;
  concreteType: string;
  errorMessage: string;
  validationErrors: any[];
  projectId: string;

  dialogTitle: string;

  config: MetadataFormConfig = {
    hideFields: [
      'describedBy',
      'schema_version',
      'schema_type',
      'provenance'
    ],
    showCancelButton: false,
    showResetButton: false,
    submitButtonLabel: 'Save'
  };

  constructor(private ingestService: IngestService,
              private alertService: AlertService,
              public dialogRef: MatDialogRef<MetadataDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public dialogData: any) {
  }

  ngOnInit(): void {
    this.schema = this.dialogData['schema'];
    this.schemaUrl = this.schema['$id'];
    this.setSchemaUrlDependencies();
    if (this.dialogData.hasOwnProperty('metadata')) {
      this.editModeInit(this.dialogData['metadata']);
    } else if (this.dialogData.hasOwnProperty('postUrl') && this.dialogData.hasOwnProperty('projectId')) {
      this.newModeInit(this.dialogData.postUrl, this.dialogData.projectId);
    } else {
      const err = `${this.dialogTitle} has not been successful since either metadata or postUrl and projectId are required.`;
      console.error(err);
      this.alertService.error('Error', err);
    }
  }

  private editModeInit(metadata: MetadataDocument){
    this.content = metadata.content;
    this.validationErrors = metadata.validationErrors;
    this.dialogTitle = `Edit ${this.domainEntity} - ${metadata['uuid']['uuid']}`;
    this.saveLink = metadata._links['self']['href'];
    this.saveAction = SaveAction.PATCH;
  }

  private newModeInit(saveLink: string, projectId: string) {
    this.projectId = projectId
    this.content = {
      describedBy: this.schemaUrl,
      schema_type: this.domainEntity,
    };
    this.validationErrors = [];
    this.dialogTitle = `New ${this.domainEntity} - ${this.concreteType}`;
    this.saveLink = saveLink;
    this.saveAction = SaveAction.POST;
  }

  private setSchemaUrlDependencies() {
    const slicedUrl = this.schemaUrl.split('/').reverse();
    this.concreteType = slicedUrl[0];
    this.version = slicedUrl[1];
    if (slicedUrl[3] === 'type'){
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

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave() {
    const newContent = this.metadataFormComponent.getFormData()['value'];
    if (isEqual(this.content, newContent)) {
      this.errorMessage = 'There are no changes done.';
      return
    }
    let response: Observable<any>;
    const patch = {'content': newContent};
    if (this.saveAction == SaveAction.POST){
      response = this.ingestService.post<MetadataDocument>(this.saveLink, patch).pipe(
        switchMap(newDocument => this.ingestService.linkProjectToMetadata<Object>(newDocument._links.self.href, this.projectId))
      );
    } else if (this.saveAction == SaveAction.PATCH) {
      response = this.ingestService.patch<MetadataDocument>(this.saveLink, patch);
    }
    response.subscribe(() => {
      this.content = newContent;
      this.alertService.clear();
      this.alertService.success('Success',
        `${this.dialogTitle} has been successful`);
      this.dialogRef.close();
    }, err => {
      console.error(err);
      this.alertService.clear();
      this.alertService.error('Error',
        `${this.dialogTitle} has not been successful due to ${err.toString()}`);
      this.dialogRef.close();
    });
  }
}
