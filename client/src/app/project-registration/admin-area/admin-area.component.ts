import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Metadata} from '../../metadata-schema-form/models/metadata';
import {MetadataForm} from '../../metadata-schema-form/models/metadata-form';

@Component({
  selector: 'app-admin-area',
  templateUrl: './admin-area.component.html',
  styleUrls: ['./admin-area.component.css']
})

export class AdminAreaComponent implements OnInit {

  @Input() metadataForm: MetadataForm;

  primaryWranglersControl: FormControl;
  primaryWranglersMetadata: Metadata;

  constructor() {
  }

  ngOnInit(): void {

    const primaryWranglersSchemaKey = 'project.primaryWrangler';
    this.primaryWranglersMetadata = this.metadataForm.get(primaryWranglersSchemaKey);
    this.primaryWranglersControl = this.metadataForm.getControl(primaryWranglersSchemaKey) as FormControl;
  }
}
