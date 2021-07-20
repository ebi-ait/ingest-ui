import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectMetadataFormComponent } from './components/project-metadata-form/project-metadata-form.component';
import { EditProjectComponent } from './pages/edit-project/edit-project.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import {AutofillProjectFormComponent} from './pages/autofill-project-form/autofill-project-form.component';
import {ProjectCreateEditRoutingModule} from './project-create-edit-routing.module';

@NgModule({
  declarations: [ProjectMetadataFormComponent, EditProjectComponent, CreateProjectComponent, AutofillProjectFormComponent],
  imports: [
    CommonModule,
    ProjectCreateEditRoutingModule
  ]
})
export class ProjectCreateEdit { }
