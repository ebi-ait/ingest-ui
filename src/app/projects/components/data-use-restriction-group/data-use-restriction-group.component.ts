import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder, FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {MetadataFormService} from "@metadata-schema-form/metadata-form.service";
import {Metadata} from "@metadata-schema-form/models/metadata";
import { MetadataForm } from '@metadata-schema-form/models/metadata-form';
import { MetadataFormHelper } from '@metadata-schema-form/models/metadata-form-helper'

@Component({
  selector: 'app-data-use-restriction-group',
  templateUrl: './data-use-restriction-group.component.html',
  styleUrls: ['./data-use-restriction-group.component.css']
})

export class DataUseRestrictionGroupComponent implements OnInit {
  metadataForm: MetadataForm;
  form: FormGroup;
  dataUseRestrictionMetadata: Metadata;
  dataUseRestrictionControl: FormControl;
  duosIdMetadata: Metadata;
  duosIdControl: FormControl;
  duosIdLabel: string;
  duosIdHelperText: string;

  readonly dataUseRestrictionFullKey = 'project.content.data_use_restriction';
  readonly dataUseRestrictionFormKey = 'data_use_restriction';
  readonly duosIdFullKey = 'project.content.duos_id';
  readonly duosIdFormKey = 'duos_id';

  ignoreExample: boolean = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
    this.subscribeToDataUseRestrictionChanges();
  }

  initializeForms(): void {
    this.setupDataUseRestrictionControl();
    this.setupDuosIdControl();
    this.setupForm();
  }

  private fetchMetadata(key: string): Metadata {
    return this.metadataForm.get(key);
  }

  private setupDataUseRestrictionControl(): void {
    this.dataUseRestrictionMetadata = this.fetchMetadata(this.dataUseRestrictionFullKey);
    this.ignoreExampleValues(this.dataUseRestrictionMetadata, this.ignoreExample);
    this.dataUseRestrictionControl = this.metadataForm.getControl(this.dataUseRestrictionFullKey) as FormControl;
  }

  private setupDuosIdControl(): void {
    this.duosIdMetadata = this.fetchMetadata(this.duosIdFullKey);
    this.duosIdLabel = this.duosIdMetadata.schema.user_friendly;
    this.duosIdHelperText = this.duosIdMetadata.schema.guidelines;
    this.duosIdControl = this.metadataForm.getControl(this.duosIdFullKey) as FormControl;

    this.setupDuosIdValidators(this.duosIdControl);
  }

  private setupDuosIdValidators(control: FormControl): void {
    const validators = Validators.compose([
      Validators.required,
      Validators.pattern(this.duosIdMetadata.schema.pattern)
    ]);

    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      [this.dataUseRestrictionFormKey]: this.dataUseRestrictionControl,
      [this.duosIdFormKey]: this.duosIdControl
    });
  }

  private ignoreExampleValues(metadata: Metadata, ignore: boolean): void {
    if (metadata) {
      metadata.ignoreExample = ignore;
    }
  }

  subscribeToDataUseRestrictionChanges(): void {
    this.form.get(this.dataUseRestrictionFormKey).valueChanges.subscribe(value => {
      const duosControl = this.form.get(this.duosIdFormKey);
      if (value === 'GRU' || value === 'GRU-NCU') {
        duosControl.enable();
      } else {
        duosControl.disable();
      }
    });
  }

  showError(control: AbstractControl, message: string): string {
    if (control.touched && control.errors) {
      const errors = control.errors;

      if (errors['required']) {
        return 'This field is required';
      }
      if (errors['pattern']) {
        return message;
      }
    }
  }
}
