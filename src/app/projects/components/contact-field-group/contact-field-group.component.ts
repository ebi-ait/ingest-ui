import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {Profile} from 'oidc-client';
import {AaiService} from '../../../aai/aai.service';
import {Metadata} from '../../../metadata-schema-form/models/metadata';
// TODO move these into shared
import {MetadataForm} from '../../../metadata-schema-form/models/metadata-form';
import {MetadataFormHelper} from '../../../metadata-schema-form/models/metadata-form-helper';

@Component({
  selector: 'app-contact-field-group',
  templateUrl: './contact-field-group.component.html',
  styleUrls: ['./contact-field-group.component.css']
})
export class ContactFieldGroupComponent implements OnInit {
  metadataForm: MetadataForm;

  formHelper: MetadataFormHelper;

  contributorsControl: AbstractControl;
  contactFieldMetadataList: Metadata[];
  contributorMetadata: Metadata;

  contactKey = 'project.content.contributors';
  roleKey = 'project.content.contributors.project_role';

  contactFieldList = [
    'project.content.contributors.name',
    'project.content.contributors.email',
    'project.content.contributors.institution',
    'project.content.contributors.country',
    'project.content.contributors.project_role',
    'project.content.contributors.corresponding_contributor'
  ];

  userInfo: Profile;
  readOnly: boolean;

  constructor(private aai: AaiService) {
    this.formHelper = new MetadataFormHelper();
  }

  ngOnInit(): void {
    this.contributorsControl = this.metadataForm.getControl(this.contactKey);
    this.contributorMetadata = this.metadataForm.get(this.contactKey);

    const fieldList = this.contactFieldList;
    this.contactFieldMetadataList = fieldList.map(field => this.metadataForm.get(field));

    // Default to having one contributor form item added, with the values filled by login user details,
    // if no contributors have been added via the autofill service
    if (!this.contributorsControl.value || !this.contributorsControl.value.length) {

      this.addFormControl(this.contributorMetadata, this.contributorsControl);

      const {
        email: contactEmailCtrl,
        name: contactNameCtrl,
        corresponding_contributor: correspondingCtrl
      } = this.contributorsControl['controls'][0]['controls'];

      // default
      correspondingCtrl.setValue(true);

      this.aai.getUser().subscribe(user => {
        if (AaiService.loggedIn(user) && !this.userInfo && user.profile) {
          this.userInfo = user.profile;
          const previousValue = contactNameCtrl.value;
          const name = [this.userInfo.given_name, '', this.userInfo.family_name].join(',');
          if (previousValue !== name) {
            contactNameCtrl.setValue(name);
            contactEmailCtrl.setValue(this.userInfo.email);
          }
        }
      });
    }

    this.readOnly = this.contributorMetadata.isDisabled;
  }

  removeFormControl(control: AbstractControl, i: number) {
    if (confirm('Are you sure?')) {
      const formArray = control as FormArray;
      formArray.removeAt(i);
    }
  }

  addFormControl(metadata: Metadata, formControl: AbstractControl) {
    const formArray = formControl as FormArray;
    const count = formArray.length;

    const formGroup: FormGroup = this.formHelper.toFormGroup(metadata.itemMetadata);
    formArray.insert(count, formGroup);
  }
}
