import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormControl} from '@angular/forms';
import {FormItemData} from '../../form-item/form-item.component';
import {Metadata} from '../../models/metadata';

@Component({
  selector: 'app-base-input',
  template: '',
  styles: []
})
export class BaseInputComponent implements OnInit {
  @Input()
  metadata: Metadata;
  @Input()
  control: AbstractControl;
  @Input()
  id: string;

  label: string;
  helperText: string;
  isRequired: boolean;
  disabled: boolean;

  data: FormItemData;

  error: string;
  placeholder: string;

  constructor() {
  }

  ngOnInit(): void {
    const userFriendly = this.metadata.schema.user_friendly;
    const title = this.metadata.schema.title;

    // TODO consolidate form item data
    this.label = userFriendly ? userFriendly : title ? title : this.metadata.key;
    this.helperText = this.getHelperText(this.metadata);
    this.isRequired = this.metadata.isRequired;
    this.disabled = this.metadata.isDisabled || this.metadata.isDisabled;
    this.data = <FormItemData>{
      label: this.label,
      helperText: this.helperText,
      isRequired: this.isRequired,
      disabled: this.disabled
    };

    this.placeholder = this.metadata.schema.example;
  }

  private getHelperText(metadata: Metadata) {
    const guidelines = metadata.schema.guidelines;
    const description = metadata.schema.description;
    const defaultHelperText = description && guidelines ? `${description}<br/><br/>${guidelines}` : description || guidelines || '';
    return metadata.guidelines || defaultHelperText;
  }

  checkForErrors(control: AbstractControl): string {
    control = control as FormControl;

    if ((control.touched || control.dirty) && control.invalid && (control.errors && control.errors.required)) {
      return 'This field is required';
    }

    const parent = control.parent;
    if (parent && (parent.touched || control.touched) && parent.invalid && parent.errors && parent.errors.required) {
      return 'This field is required';
    }
  }
}
