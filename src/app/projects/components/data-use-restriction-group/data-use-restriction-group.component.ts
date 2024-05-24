import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {MetadataFormService} from "@metadata-schema-form/metadata-form.service";
import {Metadata} from "@metadata-schema-form/models/metadata";
import { MetadataForm } from '@metadata-schema-form/models/metadata-form';

@Component({
  selector: 'app-data-use-restriction-group',
  templateUrl: './data-use-restriction-group.component.html',
  styleUrls: ['./data-use-restriction-group.component.css']
})

export class DataUseRestrictionGroupComponent implements OnInit {
  metadataForm: MetadataForm;
  dataUseRestrictionMetadata: Metadata;
  dataUseRestrictionControl: FormControl;
  duosIdMetadata: Metadata;
  duosIdControl: FormControl;
  duosIdLabel: string;
  duosIdHelperText: string;

  readonly dataUseRestrictionFullKey = 'project.content.data_use_restriction';
  readonly duosIdFullKey = 'project.content.duos_id';

  ignoreExample: boolean = true;

  constructor(private metadataFormService: MetadataFormService) {}

  ngOnInit(): void {
    this.setupDataUseRestrictionControl();
    this.setupDuosIdControl();
    this.setUpValueChangeHandlers();
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
    const patternValidator = Validators.compose([
      Validators.required,
      Validators.pattern(this.duosIdMetadata.schema.pattern)
    ]);

    const customValidator = requireItemValidator(this.metadataFormService);
    const validators = Validators.compose([Validators.required, patternValidator, customValidator]);

    control.setValidators(validators);
    control.updateValueAndValidity();
    this.duosIdControl.disable();
  }

  private ignoreExampleValues(metadata: Metadata, ignore: boolean): void {
    if (metadata) {
      metadata.ignoreExample = ignore;
    }
  }

  private setUpValueChangeHandlers() {
    this.metadataForm.getControl(this.dataUseRestrictionFullKey)
      .valueChanges
      .subscribe(val => {
        const duosId = this.metadataFormService.cleanFormData(val);
        if (duosId === 'GRU' || duosId === 'GRU-NCU') {
          this.duosIdControl.enable();
        } else {
          this.duosIdControl.disable();
          this.duosIdControl.reset();
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

export const requireItemValidator = (metadataFormService: MetadataFormService) => {
  return (input: FormControl) => {
    const item = metadataFormService.cleanFormData(input.value);
    if (metadataFormService.isEmpty(item)) {
      return {required: true} as ValidationErrors;
    }
  };
};
