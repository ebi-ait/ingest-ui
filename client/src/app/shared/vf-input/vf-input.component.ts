import {Component, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export const VF_INPUT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => VfInputComponent),
  multi: true,
};

@Component({
  selector: 'app-vf-input',
  templateUrl: './vf-input.component.html',
  providers: [VF_INPUT_VALUE_ACCESSOR],
  styleUrls: ['./vf-input.component.css']
})
export class VfInputComponent implements ControlValueAccessor, OnInit {
  @Input()
  label: string;

  @Input()
  helperText: string;

  @Input()
  isRequired: boolean;

  inputType: string;

  @Input()
  example: string;

  value: string;

  @Input()
  disabled: boolean;

  @Input()
  dataType: string;

  @ViewChild('input') input;

  INPUT_TYPE = {
    'string': 'text',
    'boolean': 'checkbox'
  };

  constructor() {
  }

  onChange = (text: string) => {
  }

  onTouched = () => {
  }

  ngOnInit(): void {
    this.inputType = this.INPUT_TYPE[this.dataType];
    console.log(this.label, this.inputType);
  }

  registerOnChange(fn: (text: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  change($event) {
    if (this.inputType === 'text') {
      this.onChange($event.target.value);
    }
    if (this.inputType === 'checkbox') {
      this.onChange($event.target.checked);
    }
  }
}
