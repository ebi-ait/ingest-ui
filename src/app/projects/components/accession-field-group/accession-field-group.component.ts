import {Component, OnInit} from '@angular/core';
import {FormArray} from '@angular/forms';
// TODO move these into shared
import {MetadataForm} from '@metadata-schema-form/models/metadata-form';
import {MetadataFormHelper} from '@metadata-schema-form/models/metadata-form-helper';
import {accessionFields, defaultAccessionField} from '../project-metadata-form/layout';

@Component({
  selector: 'app-accession-field-group',
  templateUrl: './accession-field-group.component.html',
  styleUrls: ['./accession-field-group.component.css']
})
export class AccessionFieldGroupComponent implements OnInit {
  metadataForm: MetadataForm;

  formHelper: MetadataFormHelper;

  isAccessioned: boolean | undefined;

  accessionId: string;

  accessionFields = accessionFields;

  defaultAccessionField = defaultAccessionField;

  constructor() {
  }

  ngOnInit(): void {
    this.formHelper = new MetadataFormHelper();
  }

  onIsAccessionedChange(isAccessioned: string) {
    this.isAccessioned = isAccessioned === 'Yes';
    if (!this.isAccessioned) {
      this.clearAccessionFields();
    }
  }

  onProjectAccessionIdChange(accessionId: string) {
    this.clearAccessionFields();

    const defaultAccessionCtrl = this.metadataForm.getControl(this.defaultAccessionField);

    let matchedControl: FormArray = defaultAccessionCtrl as FormArray;
    for (const accessionFieldKey of this.accessionFields) {
      const metadata = this.metadataForm.get(accessionFieldKey);
      const control = this.metadataForm.getControl(accessionFieldKey) as FormArray;
      const accessionRegex = new RegExp(metadata.schema.items['pattern']);
      if (accessionRegex.test(accessionId)) {
        matchedControl = control;
        break;
      }
    }

    matchedControl.push(this.formHelper.toFormControl(undefined, accessionId));
  }

  clearAccessionFields(): void {
    this.accessionFields.map(accessionFieldKey => {
      const control = this.metadataForm.getControl(accessionFieldKey) as FormArray;
      control.reset();
    });
  }
}
