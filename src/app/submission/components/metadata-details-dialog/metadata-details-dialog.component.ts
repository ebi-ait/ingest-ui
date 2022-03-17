import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MetadataFormComponent} from '@metadata-schema-form/metadata-form/metadata-form.component';
import {MetadataFormConfig} from '@metadata-schema-form/models/metadata-form-config';
import {MetadataFormLayout, MetadataFormTab} from '@metadata-schema-form/models/metadata-form-layout';
import {MetadataDocument} from '@shared/models/metadata-document';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import isEqual from 'lodash/isEqual';
import {Observable} from 'rxjs';

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

  type: string;
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
    } else if (this.dialogData.hasOwnProperty('postUrl')) {
      this.newModeInit(this.dialogData['postUrl']);
    } else {
      //throw error
    }
  }

  private editModeInit(metadata: MetadataDocument){
    this.content = metadata.content;
    this.validationErrors = metadata.validationErrors;
    this.dialogTitle = `Edit ${this.type} - ${metadata['uuid']['uuid']}`;
    this.saveLink = metadata._links['self']['href']
  }

  private newModeInit(saveLink: string) {
    this.content = {}
    this.validationErrors = []
    this.dialogTitle = `New ${this.type} - ${this.concreteType}`;
    this.saveLink = saveLink
  }

  private setSchemaUrlDependencies() {
    const slicedUrl = this.schemaUrl.split('/').reverse();
    this.type = slicedUrl[2];
    this.concreteType = slicedUrl[0];

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
    let saveFunc;
    if (this.content){
      saveFunc = this.SaveExisting;
    } else {
      saveFunc =  this.CreateNew;
    }
    saveFunc(newContent).subscribe(response => {
      this.content = newContent;
      this.alertService.clear();
      this.alertService.success('Success',
        `${this.dialogTitle} has been successful`);
      this.dialogRef.close();
    }, err => {
      console.error(err);
      this.alertService.clear();
      this.alertService.error('Error',
        `${this.type} has not been successful due to ${err.toString()}`);
      this.dialogRef.close();
    });
  }

  private SaveExisting(newContent): Observable<MetadataDocument> {
    const patch = {'content': newContent};
    return this.ingestService.patch<MetadataDocument>(this.saveLink, patch);
  }

  private CreateNew(newContent): Observable<MetadataDocument> {
    return this.ingestService.post<MetadataDocument>(this.saveLink, newContent);
  }
}
