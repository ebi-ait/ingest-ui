import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MetadataSchemaFormModule} from '../metadata-schema-form/metadata-schema-form.module';
import {SharedModule} from '../shared/shared.module';
import {AccessionFieldGroupComponent} from './components/accession-field-group/accession-field-group.component';
import {AdminAreaComponent} from './components/admin-area/admin-area.component';
import {ContactFieldGroupComponent} from './components/contact-field-group/contact-field-group.component';
import {FunderFieldGroupComponent} from './components/funder-field-group/funder-field-group.component';
import {ProjectIdComponent} from './components/project-id/project-id.component';
import {ProjectMetadataFormComponent} from './components/project-metadata-form/project-metadata-form.component';
import {ProjectRegistrationSaveComponent} from './components/project-registration-summary/project-registration-save.component';
import {PublicationFieldGroupComponent} from './components/publication-field-group/publication-field-group.component';
import {WranglerListInputComponent} from './components/wrangler-list-input/wrangler-list-input.component';
import {WranglingPriorityInputComponent} from './components/wrangling-priority-input/wrangling-priority-input.component';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {CreateProjectComponent} from './pages/create-project/create-project.component';
import {EditProjectComponent} from './pages/edit-project/edit-project.component';
import {ProjectCreateEditRoutingModule} from './project-create-edit-routing.module';
import {AutofillProjectService} from './services/autofill-project.service';
import {ProjectCacheService} from './services/project-cache.service';

@NgModule({
  declarations: [
    AutofillProjectFormComponent,
    AccessionFieldGroupComponent,
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
    WranglingPriorityInputComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    MetadataSchemaFormModule,
    ProjectCreateEditRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [
    AutofillProjectService,
    ProjectCacheService,
  ]
})
export class ProjectCreateEdit { }