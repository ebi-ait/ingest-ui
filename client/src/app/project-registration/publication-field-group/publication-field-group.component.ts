import {Component, Input, OnInit} from '@angular/core';
import {InputComponent} from '../../metadata-schema-form/metadata-field-types/input/input.component';

@Component({
  selector: 'app-publication-field-group',
  templateUrl: '../../metadata-schema-form/metadata-field-types/input/input.component.html',
  styleUrls: ['../../metadata-schema-form/metadata-field-types/input/input.component.css']
})

/* Simple class that extends InputComponent to enable having one publication item added by default
 */
export class PublicationFieldGroupComponent extends InputComponent implements OnInit {
  @Input() metadataForm;

  constructor() {
    super();
  }

  ngOnInit(): void {
    const publicationsSchemaKey = 'project.content.publications';
    this.metadata = this.metadataForm.get(publicationsSchemaKey);
    this.control = this.metadataForm.getControl(publicationsSchemaKey);
    // console.log(typeof this.control);

    super.ngOnInit();

    // Default to having one funder form item added
    // if no publications have been added via the autofill service
    if (!!this.control.value) {
      this.addFormControl(this.metadata, this.control);
    }
  }
}
