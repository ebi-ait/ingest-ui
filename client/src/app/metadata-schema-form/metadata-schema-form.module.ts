import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatChipsModule} from '@angular/material/chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterModule} from '@angular/router';
import {MetadataFormComponent} from './metadata-form/metadata-form.component';
import {InputComponent} from './metadata-field-types/input/input.component';
import {VfInputComponent} from './custom/vf-input/vf-input.component';
import {MetadataFormItemDirective} from './metadata-form-item.directive';
import {TextListInputComponent} from './metadata-field-types/text-list-input/text-list-input.component';
import {TextAreaComponent} from './metadata-field-types/text-area/text-area.component';
import {VfAsteriskComponent} from './custom/vf-asterisk/vf-asterisk.component';
import {DateInputComponent} from './metadata-field-types/date-input/date-input.component';
import {OntologyInputComponent} from './metadata-field-types/ontology-input/ontology-input.component';
import {MultipleSelectComponent} from './custom/multiple-select/multiple-select.component';
import {MetadataFieldComponent} from './metadata-field/metadata-field.component';
import {SelectComponent} from './custom/select/select.component';
import {SelectRadioComponent} from './custom/select-radio/select-radio.component';
import {SelectListComponent} from './custom/select-list/select-list.component';
import {OntologyListInputComponent} from './metadata-field-types/ontology-list-input/ontology-list-input.component';
import {EnumListInputComponent} from './metadata-field-types/enum-list-input/enum-list-input.component';
import {MaterialModule} from '../material.module';
import {OntologyBaseComponent} from './metadata-field-types/ontology-base/ontology-base.component';
import {MetadataFormItemComponent} from './metadata-form-item/metadata-form-item.component';
import {BaseInputComponent} from './metadata-field-types/base-input/base-input.component';
import {EnumDropDownComponent} from './metadata-field-types/enum-drop-down/enum-drop-down.component';
import {EnumRadioListComponent} from './metadata-field-types/enum-radio-list/enum-radio-list.component';
import {EnumRadioInlineComponent} from './metadata-field-types/enum-radio-inline/enum-radio-inline.component';
import {FormItemComponent} from './form-item/form-item.component';
import { VfTabsComponent } from './custom/vf-tabs/vf-tabs.component';
import { VfTabComponent } from './custom/vf-tab/vf-tab.component';


@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatTabsModule,
    FormsModule,
    RouterModule,
    MaterialModule
  ],
  declarations: [
    MetadataFormComponent,
    InputComponent,
    VfInputComponent,
    MetadataFormItemDirective,
    TextListInputComponent,
    TextAreaComponent,
    VfAsteriskComponent,
    DateInputComponent,
    OntologyInputComponent,
    MultipleSelectComponent,
    MetadataFieldComponent,
    SelectComponent,
    SelectRadioComponent,
    SelectListComponent,
    EnumRadioListComponent,
    EnumRadioInlineComponent,
    EnumDropDownComponent,
    OntologyListInputComponent,
    EnumListInputComponent,
    OntologyBaseComponent,
    MetadataFormItemComponent,
    BaseInputComponent,
    FormItemComponent,
    VfTabsComponent,
    VfTabComponent
  ],
  exports: [
    MetadataFormComponent,
    MetadataFieldComponent,
    VfInputComponent,
    SelectRadioComponent,
    EnumListInputComponent,
    VfTabsComponent,
    VfTabComponent,
    BaseInputComponent,
    SelectComponent,
    EnumDropDownComponent,
    SelectListComponent
  ],
  providers: []
})
export class MetadataSchemaFormModule {
}
