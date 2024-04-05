import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formHelper = new MetadataFormHelper();
    this.initializeForms();
    this.subscribeToDataUseRestrictionChanges();
  }

  initializeForms(): void {
    const dataUseRestrictionMetadata = this.metadataForm.get('project.content.data_use_restriction');

    // Ignore example values for DUO codes
    if (dataUseRestrictionMetadata) {
      dataUseRestrictionMetadata.ignoreExample = true;
    }

    // Get the control for 'data_use_restriction'
    const dataUseRestrictionControl = this.metadataForm.getControl('project.content.data_use_restriction');
    this.form = this.fb.group({
      'data_use_restriction': dataUseRestrictionControl,

      duos_id: [{value: '', disabled: true}, Validators.compose([
        Validators.required,
        Validators.pattern(/^DUOS-\d{6}$/)
      ])]
    });
  }


  subscribeToDataUseRestrictionChanges(): void {
    this.form.get('data_use_restriction').valueChanges.subscribe(value => {
      const duosControl = this.form.get('duos_id');
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
