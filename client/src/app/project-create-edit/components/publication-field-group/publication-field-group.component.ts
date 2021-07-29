import {Component, Input, OnInit} from '@angular/core';

import {InputComponent} from '../../../metadata-schema-form/metadata-field-types/input/input.component';

@Component({
  selector: 'app-publication-field-group',
  templateUrl: '../../../metadata-schema-form/metadata-field-types/input/input.component.html',
  styleUrls: ['../../../metadata-schema-form/metadata-field-types/input/input.component.css']
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

    super.ngOnInit();

    // Default to having one publication form item added
    // if no publications have been added via the autofill service
    if (!this.control.value || !this.control.value.length) {
      this.addFormControl(this.metadata, this.control);
    }
  }
}
