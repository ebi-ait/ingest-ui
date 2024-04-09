import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
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
  formHelper: MetadataFormHelper;
  duosIdLabel: string;
  duosIdHelperText: string;

  private readonly DATA_USE_RESTRICTION_FULL_KEY = 'project.content.data_use_restriction';
  private readonly DATA_USE_RESTRICTION_FORM_KEY = 'data_use_restriction';
  private readonly DUOS_ID_FULL_KEY = 'project.content.duos_id';
  private readonly DUOS_ID_FORM_KEY = 'duos_id';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formHelper = new MetadataFormHelper();
    this.initializeForms();
    this.subscribeToDataUseRestrictionChanges();
  }

  initializeForms(): void {
    const dataUseRestrictionMetadata = this.metadataForm.get(this.DATA_USE_RESTRICTION_FULL_KEY);
    this.ignoreExampleValues(dataUseRestrictionMetadata);

    const dataUseRestrictionControl = this.metadataForm.getControl(this.DATA_USE_RESTRICTION_FULL_KEY);
    const duosIdMetadata = this.metadataForm.get(this.DUOS_ID_FULL_KEY);
    this.duosIdLabel = duosIdMetadata.schema.user_friendly;
    this.duosIdHelperText = duosIdMetadata.schema.guidelines;

    this.form = this.fb.group({
      [this.DATA_USE_RESTRICTION_FORM_KEY]: dataUseRestrictionControl,

      duos_id: [{value: '', disabled: true}, Validators.compose([
        Validators.required,
        Validators.pattern(/^DUOS-\d{6}$/)
      ])]
    });
  }

  private ignoreExampleValues(dataUseRestrictionMetadata: Metadata) {
    if (dataUseRestrictionMetadata) {
      dataUseRestrictionMetadata.ignoreExample = true;
    }
  }

  subscribeToDataUseRestrictionChanges(): void {
    this.form.get(this.DATA_USE_RESTRICTION_FORM_KEY).valueChanges.subscribe(value => {
      const duosControl = this.form.get(this.DUOS_ID_FORM_KEY);
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
