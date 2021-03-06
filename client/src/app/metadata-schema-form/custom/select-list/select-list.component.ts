import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-select-list',
  templateUrl: './select-list.component.html',
  styleUrls: ['./select-list.component.css']
})
export class SelectListComponent {
  @Input()
  id: string;

  @Input()
  value: string;

  @Input()
  label: string;

  @Input()
  helperText: string;

  @Input()
  isRequired: boolean;

  @Input()
  error: string;

  @Input()
  placeholder: string;

  @Input()
  disabled: boolean;

  @Input()
  options: string[];

  @Input()
  removeBlankOption: boolean;

  @Output()
  valueChanged = new EventEmitter<string>();


  onSelectedValueChange(value) {
    this.valueChanged.emit(value);
  }
}
