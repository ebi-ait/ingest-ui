import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

    // Check initial value of data_use_restriction and enable/disable duos_id accordingly
    const dataUseRestrictionValue = this.form.get('data_use_restriction').value;
    const duosControl = this.form.get('duos_id');
    console.log("1-dataUseRestrictionValue = " + dataUseRestrictionValue);

    if (dataUseRestrictionValue && duosControl) {
      dataUseRestrictionValue.valueChanges.pipe(first()).subscribe(value => {
        console.log("2-dataUseRestrictionValue = " + value);
        if (value === 'GRU' || value === 'GRU-NCU') {
          console.log("1-enable");
          duosControl.enable();
        } else {
          duosControl.disable();
        }
      });
    }
  }

  subscribeToDataUseRestrictionChanges(): void {
    const dataUseControl = this.form.get('data_use_restriction');
    if (dataUseControl) {
      dataUseControl.valueChanges.subscribe(value => {
        const duosControl = this.form.get('duos_id');
        if (value === 'GRU' || value === 'GRU-NCU') {
          console.log("2-enable");
          duosControl.enable();
        } else {
          duosControl.disable();
        }
      });
    }
  }
}
