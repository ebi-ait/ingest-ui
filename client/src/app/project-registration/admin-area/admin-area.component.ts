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

  primaryWranglerControl: FormControl;
  primaryWranglerMetadata: Metadata;

  secondaryWranglersControl: FormControl;
  secondaryWranglerMetadata: Metadata;

  wranglingStatusControl: FormControl;
  wranglingStatusMetadata: Metadata;

  wranglingPriorityControl: FormControl;
  wranglingPriorityMetadata: Metadata;

  wranglingNotesControl: FormControl;
  wranglingNotesMetadata: Metadata;

  wranglingStatusMapping: Map<string, string>;

  constructor() {
  }

  ngOnInit(): void {

    const primaryWranglerSchemaKey = 'project.primaryWrangler';
    this.primaryWranglerMetadata = this.metadataForm.get(primaryWranglerSchemaKey);
    this.primaryWranglerControl = this.metadataForm.getControl(primaryWranglerSchemaKey) as FormControl;

    const secondaryWranglerSchemaKey = 'project.secondaryWrangler';
    this.secondaryWranglerMetadata = this.metadataForm.get(secondaryWranglerSchemaKey);
    this.secondaryWranglersControl = this.metadataForm.getControl(secondaryWranglerSchemaKey) as FormControl;

    const wranglingStatusSchemaKey = 'project.wranglingState';
    this.wranglingStatusMetadata = this.metadataForm.get(wranglingStatusSchemaKey);
    this.wranglingStatusControl = this.metadataForm.getControl(wranglingStatusSchemaKey) as FormControl;

    const wranglingPrioritySchemaKey = 'project.wranglingPriority';
    this.wranglingPriorityMetadata = this.metadataForm.get(wranglingPrioritySchemaKey);
    this.wranglingPriorityControl = this.metadataForm.getControl(wranglingPrioritySchemaKey) as FormControl;

    const wranglingNotesSchemaKey = 'project.wranglingNotes';
    this.wranglingNotesMetadata = this.metadataForm.get(wranglingNotesSchemaKey);
    this.wranglingNotesControl = this.metadataForm.getControl(wranglingNotesSchemaKey) as FormControl;

  }

}
