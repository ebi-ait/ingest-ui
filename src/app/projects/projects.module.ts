import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSliderModule} from '@angular/material/slider';
import {MatTabsModule} from '@angular/material/tabs';
import {MetadataSchemaFormModule} from '@metadata-schema-form/metadata-schema-form.module';
import {AccessionDownloadComponent} from "@projects/components/accession-download/accession-download.component";
import {ContactNameFieldComponent} from "@projects/components/contact-name-field/contact-name-field.component";
import {ProjectComponent} from "@projects/pages/project/project.component";
import {GeoService} from "@projects/services/geo.service";
import {SharedModule} from '@shared/shared.module';
import {MaterialModule} from '../material.module';
import {AccessionFieldGroupComponent} from './components/accession-field-group/accession-field-group.component';
import {AdminAreaComponent} from './components/admin-area/admin-area.component';
import {ContactFieldGroupComponent} from './components/contact-field-group/contact-field-group.component';
import {FunderFieldGroupComponent} from './components/funder-field-group/funder-field-group.component';
import {NumberDropdownComponent} from './components/number-dropdown-input/number-dropdown.component';
import {ProjectFiltersComponent} from './components/project-filters/project-filters.component';
import {ProjectIdComponent} from './components/project-id/project-id.component';
import {ProjectMetadataFormComponent} from './components/project-metadata-form/project-metadata-form.component';
import {ProjectRegistrationSaveComponent} from './components/project-registration-summary/project-registration-save.component';
import {PublicationFieldGroupComponent} from './components/publication-field-group/publication-field-group.component';
import {WranglerListInputComponent} from './components/wrangler-list-input/wrangler-list-input.component';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {CreateProjectComponent} from './pages/create-project/create-project.component';
import {EditProjectComponent} from './pages/edit-project/edit-project.component';
import {ProjectsRoutingModule} from './projects-routing.module';
import {DoiService} from './services/doi.service';
import {ProjectCacheService} from './services/project-cache.service';

@NgModule({
  declarations: [
    AutofillProjectFormComponent,
    AccessionFieldGroupComponent,
    AccessionDownloadComponent,
    AdminAreaComponent,
    ContactFieldGroupComponent,
    CreateProjectComponent,
    EditProjectComponent,
    FunderFieldGroupComponent,
    ProjectIdComponent,
    ProjectMetadataFormComponent,
    ProjectRegistrationSaveComponent,
    PublicationFieldGroupComponent,
    WranglerListInputComponent,
    NumberDropdownComponent,
    ProjectFiltersComponent,
    ContactNameFieldComponent,
    ProjectComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MaterialModule,
    MetadataSchemaFormModule,
    ProjectsRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    MatSliderModule,
  ],
  exports: [
    ProjectFiltersComponent
  ],
  providers: [
    DoiService,
    GeoService,
    ProjectCacheService,
  ]
})
export class ProjectsModule {
}
