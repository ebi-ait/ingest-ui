import {Component, Input, OnInit} from '@angular/core';
import {BaseInputComponent} from '../../metadata-schema-form/metadata-field-types/base-input/base-input.component';
import {Metadata} from '../../metadata-schema-form/models/metadata';
import {FormControl} from '@angular/forms';


@Component({
  selector: 'app-wrangling-priority-input',
  templateUrl: './wrangling-priority-input.component.html',
  styleUrls: ['./wrangling-priority-input.component.css']
})
export class WranglingPriorityInputComponent extends BaseInputComponent implements OnInit {
  @Input() metadata: Metadata;
  @Input() control: FormControl;
  @Input() id: string;

  options: string[];
  searchControl: FormControl;


  constructor() {
    super();
    super.metadata = this.metadata;
    super.control = this.control;
    super.id = this.id;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.options = [
      'N/A',
      '1',
      '2'
    ];
  }

  updateControl(value: any) {
    let priority;

    if (!value || value === 'N/A') {
      priority = 0;
    } else {
      priority = Number(value);
    }

    this.control.setValue(priority);
  }

  valueOf(value: any) {
    if (!value || value === 0) {
      return 'N/A';
    }

    return value.toString();
  }
}
