import {Component, Input, OnInit} from '@angular/core';
import {Metadata} from '../../metadata-schema-form/models/metadata';
import {AbstractControl, Form, FormArray, FormControl, FormGroup} from '@angular/forms';
import {MetadataForm} from '../../metadata-schema-form/models/metadata-form';
import {MetadataFormHelper} from '../../metadata-schema-form/models/metadata-form-helper';
import {InputComponent} from '../../metadata-schema-form/metadata-field-types/input/input.component';

@Component({
  selector: 'app-publication-field-group',
  // templateUrl: './publication-field-group.component.html',
  // styleUrls: ['./publication-field-group.component.css']
  templateUrl: '../../metadata-schema-form/metadata-field-types/input/input.component.html',
  styleUrls: ['../../metadata-schema-form/metadata-field-types/input/input.component.css']
})

/* Simple class that extends InputComponent to enable having one publication item added by default
 */
export class PublicationFieldGroupComponent extends InputComponent implements OnInit {
  @Input() metadataForm;
  titleControl: FormControl;
  authorsControl: FormArray;
  doiControl: FormControl;
  pmidControl: FormControl;
  urlControl: FormControl;

  constructor() {
    super();
  }

  ngOnInit(): void {
    const publicationsSchemaKey = 'project.content.publications';
    this.metadata = this.metadataForm.get(publicationsSchemaKey);
    this.control = this.metadataForm.getControl(publicationsSchemaKey);
    // console.log(typeof this.control);

    super.ngOnInit();


    // Default to having one publication form item added
    // can probably check via the form control if any value has been set
    // either by using valueChanges event or the value property
    // and have this form control added conditionally
    // this.addFormControl(this.metadata, this.control);

    // this.titleControl = this.control['controls'][0]['controls']['title'];
    // // this.titleControl.setValue('Testing the publication title');
    //
    // this.doiControl = this.control['controls'][0]['controls']['doi'];
    // // this.doiControl.setValue('Testing the publication doi');
    //
    // this.pmidControl = this.control['controls'][0]['controls']['pmid'];
    // // this.pmidControl.setValue(123);
    //
    // this.urlControl = this.control['controls'][0]['controls']['url'];
    // // this.urlControl.setValue('Testing the publication url');
    //
    // this.authorsControl = this.control['controls'][0]['controls']['authors']['controls'] as FormArray;
  }
}
