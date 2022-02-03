import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {MetadataFormService} from '../metadata-form.service';
import {JsonSchema} from '../models/json-schema';
import {MetadataForm} from '../models/metadata-form';
import {MetadataFormConfig} from '../models/metadata-form-config';
import {MetadataFormTab} from '../models/metadata-form-layout';

@Component({
  selector: 'app-metadata-form',
  templateUrl: './metadata-form.component.html',
  styleUrls: ['./metadata-form.component.css']
})
export class MetadataFormComponent implements OnInit {
  @Input() name: string;

  @Input() schema: JsonSchema;

  @Input() layout: object;

  @Input() config: MetadataFormConfig;

  @Input() selectedTabKey: string;

  @Input() allowValidationOverride = false;

  @Input() useVf = false;

  @Input() data: object;

  @Output() save = new EventEmitter<{ value: object, valid: boolean, validationSkipped: boolean }>();

  @Output() cancel = new EventEmitter<boolean>();

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() reset = new EventEmitter<boolean>();

  @Output() back = new EventEmitter<boolean>();

  @Output() tabChange = new EventEmitter<string>();

  @Output() formValueChange = new EventEmitter<Observable<object>>();

  formGroup: FormGroup;

  metadataForm: MetadataForm;

  overrideValidation = false

  visibleTabs: MetadataFormTab[];

  form: object = {};

  value: object;

  done: boolean;

  constructor(private metadataFormService: MetadataFormService) {
  }

  ngOnInit(): void {
    this.metadataForm = this.metadataFormService.createForm(this.schema.name, this.schema, this.data, this.config);
    this.formGroup = this.metadataForm.formGroup;
    this.visibleTabs = this.config.layout.tabs.filter(tab => this.tabIsVisible(tab));
    if (this.lookupTabIndex(this.selectedTabKey) === -1) {
      this.selectedTabKey = this.visibleTabs[0].key;
    }
    this.done = true;

    this.onFormChange();
  }

  lookupTabIndex(tabKey: string): number {
    if (tabKey) {
      return this.visibleTabs.findIndex(tab => tab.key === tabKey);
    } else {
      return -1;
    }
  }

  tabIsVisible(tab: MetadataFormTab): boolean {
    if (this.config.viewMode && this.config.hideEmptyFields && tab.items.length === 1) {
      if (tab.key === tab.items[0]) {
        let data = this.data;
        let chain = true;
        const keys = tab.key.split('.');
        keys.shift();

        for (const key of keys) {
          if (data?.[key]) {
            data = data[key];
          } else {
            chain = false;
            break;
          }
        }
        return chain;
      }
    }
    return true;
  }

  onFormChange() {
    this.formGroup.valueChanges.subscribe( () => this.formValueChange.emit(of(this.getFormData())));
  }

  onSubmit(e) {
    e.preventDefault();
    const formData = this.getFormData();
    console.log('clean form data', formData);

    if (this.lookupTabIndex(this.selectedTabKey) === this.config.layout.tabs.length - 1) {
      this.formGroup.markAllAsTouched();
    }

    this.save.emit(formData);
  }

  getFormData() {
    let formValue = this.metadataForm.formGroup.getRawValue();
    if (Array.isArray(this.config.cleanAttributes)) {
      this.config.cleanAttributes.forEach(attribute => {
        formValue[attribute] = this.metadataFormService.cleanFormData(formValue[attribute]);
      });
    } else if (this.config.cleanAttributes !== false) {
      formValue = this.metadataFormService.cleanFormData(formValue);
    }
    return {
      value: formValue,
      valid: this.formGroup.valid,
      validationSkipped: this.overrideValidation
    };
  }

  confirmCancel(e) {
    if (confirm('Are you sure you want to cancel?')) {
      this.cancel.emit(e);
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  onSelectedIndexChange(tabIndex: number) {
    this.tabChange.emit(this.visibleTabs[tabIndex].key);
  }

  onBack() {
    this.back.emit();
  }

  onReset() {
    this.reset.emit();
  }
}
