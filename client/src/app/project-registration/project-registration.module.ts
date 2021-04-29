import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccessionFieldGroupComponent} from './accession-field-group/accession-field-group.component';
import {ProjectRegistrationSaveComponent} from './project-registration-summary/project-registration-save.component';
import {PublicationFieldGroupComponent} from './publication-field-group/publication-field-group.component';
import {ContactFieldGroupComponent} from './contact-field-group/contact-field-group.component';
import {MetadataSchemaFormModule} from '../metadata-schema-form/metadata-schema-form.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ContactNameFieldComponent} from './contact-name-field/contact-name-field.component';
import {ProjectIdComponent} from './project-id/project-id.component';
import {ProjectRegistrationFormComponent} from './project-registration-form/project-registration-form.component';
import {MatTabsModule} from '@angular/material/tabs';
import {FunderFieldGroupComponent} from './funder-field-group/funder-field-group.component';
import {AutofillProjectFormComponent} from './autofill-project-form/autofill-project-form.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    AccessionFieldGroupComponent,
    ProjectRegistrationSaveComponent,
    PublicationFieldGroupComponent,
    ContactFieldGroupComponent,
    ContactNameFieldComponent,
    ProjectIdComponent,
    ProjectRegistrationFormComponent,
    FunderFieldGroupComponent,
    AutofillProjectFormComponent,
  ],
  imports: [
    CommonModule,
    MetadataSchemaFormModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTabsModule,
    RouterModule
  ]
})
export class ProjectRegistrationModule {
}
