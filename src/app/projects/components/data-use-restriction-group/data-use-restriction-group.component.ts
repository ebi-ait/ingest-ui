import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { MetadataForm } from '@metadata-schema-form/models/metadata-form';
import { MetadataFormHelper } from '@metadata-schema-form/models/metadata-form-helper';
import {first} from "rxjs/operators";

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
    this.form = this.fb.group({
      data_use_restriction: this.metadataForm.getControl('project.content.data_use_restriction'),
      duos_id: this.metadataForm.getControl('project.content.duos_id')
    });

    // Set default value for `data_use_restriction` immediately after form creation
    let dataUseRestrictionControl = this.metadataForm.getControl('project.content.data_use_restriction');

    if (!dataUseRestrictionControl) {
      // Control doesn't exist yet, so we add it
      this.metadataForm.formGroup.addControl('project.content.data_use_restriction', new FormControl('-'));
      dataUseRestrictionControl = this.metadataForm.getControl('project.content.data_use_restriction');
    } else {
      // Control exists, we just set its initial value
      dataUseRestrictionControl.setValue('null');
    }
  }

  subscribeToDataUseRestrictionChanges(): void {
    const dataUseControl = this.form.get('data_use_restriction');
    if (dataUseControl) {
      dataUseControl.valueChanges.subscribe(value => {
        const duosControl = this.form.get('duos_id');
        if (value === 'GRU' || value === 'GRU-NCU') {
          duosControl.enable();
        } else {
          duosControl.disable();
        }
      });
    }
  }
}
