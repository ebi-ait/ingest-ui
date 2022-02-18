import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {MetadataFormComponent} from '@metadata-schema-form/metadata-form/metadata-form.component';
import {MetadataFormConfig} from '@metadata-schema-form/models/metadata-form-config';
import {MetadataFormLayout, MetadataFormTab} from '@metadata-schema-form/models/metadata-form-layout';
import {MetadataDocument} from '@shared/models/metadata-document';
import {AlertService} from '@shared/services/alert.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import isEqual from 'lodash/isEqual';

@Component({
  selector: 'app-metadata-details',
  templateUrl: './metadata-details-dialog.component.html',
  styleUrls: ['./metadata-details-dialog.component.css']
})
export class MetadataDetailsDialogComponent implements OnInit {
  content: any;
  metadata: MetadataDocument;

  @ViewChild(MetadataFormComponent) metadataFormComponent: MetadataFormComponent;

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

  schema: object;
  schemaUrl: string;
  formTabKey: any;

  type: string;
  id: string;
  errorMessage: string;


  constructor(private route: ActivatedRoute,
              private ingestService: IngestService,
              private schemaService: SchemaService,
              private loaderService: LoaderService,
              private alertService: AlertService,
              public dialogRef: MatDialogRef<MetadataDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public dialogData: any) {
  }

  ngOnInit(): void {
    this.metadata = this.dialogData['metadata'];
    this.content = this.metadata.content;
    this.type = this.metadata['type'];
    this.id = this.metadata['uuid']['uuid'];

    this.schemaUrl = this.dialogData['metadata']['content']['describedBy'];
    this.schema = this.dialogData['schema'];
    const concreteType = this.schemaUrl.split('/').pop();
    const layout: MetadataFormLayout = {
      tabs: []
    };

    const tab: MetadataFormTab = {
      items: [concreteType], key: concreteType, title: ''
    };

    layout.tabs = [tab];
    this.config.layout = layout;


  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    const formData = this.metadataFormComponent.getFormData();
    const selfLink = this.metadata._links['self']['href'];
    const newContent = formData['value'];
    if (isEqual(this.metadata['content'], newContent)) {
      this.errorMessage = 'There are no changes done.';
    } else {
      this.metadata['content'] = newContent;
      const patch = {'content': newContent};
      this.ingestService.patch<MetadataDocument>(selfLink, patch)
        .subscribe(response => {
          this.alertService.clear();
          this.alertService.success('Success',
            `${this.type} ${this.id} has been successfully updated`);
          this.dialogRef.close();
        }, err => {
          console.error(err);
          this.alertService.clear();
          this.alertService.error('Error',
            `${this.type} ${this.id} has not been updated due to ${err.toString()}`);
          this.dialogRef.close();
        });
    }
  }
}
