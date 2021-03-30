import {Component, Input, OnInit} from '@angular/core';
import {InputComponent} from '../../metadata-schema-form/metadata-field-types/input/input.component';

@Component({
    selector: 'app-funder-field-group',
    templateUrl: '../../metadata-schema-form/metadata-field-types/input/input.component.html',
    styleUrls: ['../../metadata-schema-form/metadata-field-types/input/input.component.css']
})
/**
 * Simple class that extends InputComponent to enable having one funder item added by default
 */
export class FunderFieldGroupComponent extends InputComponent implements OnInit {
    @Input() metadataForm;

    constructor() {
        super();
    }

    ngOnInit(): void {
        const fundersSchemaKey = 'project.content.funders';
        this.metadata = this.metadataForm.get(fundersSchemaKey);
        this.control = this.metadataForm.getControl(fundersSchemaKey);

        super.ngOnInit();
        // we can check if the form control has any value set here
      // either by using valueChanges event or the value property
        // Default to having one funder form item added
        // this.addFormControl(this.metadata, this.control);
    }
}
