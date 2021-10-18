import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseInputComponent} from '../../../metadata-schema-form/metadata-field-types/base-input/base-input.component';
import {Metadata} from '../../../metadata-schema-form/models/metadata';

const NOT_APPLICABLE = 'N/A'
@Component({
  selector: 'app-number-dropdown',
  templateUrl: './number-dropdown.component.html',
  styleUrls: ['./number-dropdown.component.css']
})
export class NumberDropdownComponent extends BaseInputComponent implements OnInit {
  @Input() metadata: Metadata;
  @Input() control: FormControl;
  @Input() id: string;
  @Input() options: string[];

  searchControl: FormControl;


  constructor() {
    super();
    super.metadata = this.metadata;
    super.control = this.control;
    super.id = this.id;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.options = [NOT_APPLICABLE].concat(this.options)
  }

  updateControl(value: any) {
    let priority;

    if (!value || value === NOT_APPLICABLE) {
      priority = null;
    } else {
      priority = Number(value);
    }

    this.control.setValue(priority);
  }

  valueOf(value: any) {
    if (!value) {
      return NOT_APPLICABLE;
    }

    return value.toString();
  }
}
