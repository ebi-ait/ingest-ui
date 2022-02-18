import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
// TODO move these into shared
import {Metadata} from '@metadata-schema-form/models/metadata';
import {MetadataForm} from '@metadata-schema-form/models/metadata-form';
import Utils from "@projects/utils";
import {MAX_DCP_RELEASE_NUMBER, WRANGLING_PRIORITIES} from "@projects/constants";

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
  wranglingPriorityOptions: string[]

  wranglingNotesControl: FormControl;
  wranglingNotesMetadata: Metadata;

  releaseControl: FormControl;
  releaseMetadata: Metadata;
  releaseOptions: string[]

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
    this.wranglingPriorityOptions = WRANGLING_PRIORITIES.map(String)

    const wranglingNotesSchemaKey = 'project.wranglingNotes';
    this.wranglingNotesMetadata = this.metadataForm.get(wranglingNotesSchemaKey);
    this.wranglingNotesControl = this.metadataForm.getControl(wranglingNotesSchemaKey) as FormControl;

    const releaseSchemaKey = 'project.dcpReleaseNumber';
    this.releaseMetadata = this.metadataForm.get(releaseSchemaKey);
    this.releaseControl = this.metadataForm.getControl(releaseSchemaKey) as FormControl;
    this.releaseOptions = Utils.generateNumbers1toN(MAX_DCP_RELEASE_NUMBER).map(String)
  }
}
