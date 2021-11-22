import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatSliderModule} from "@angular/material/slider";
import {MatTabsModule} from "@angular/material/tabs";
import {MaterialModule} from "@app/material.module";
import {SubmissionRoutingModule} from "@app/submission/submission-routing.module";
import {MetadataSchemaFormModule} from "@metadata-schema-form/metadata-schema-form.module";
import {ProjectsRoutingModule} from "@projects/projects-routing.module";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {EntityValidationSummaryComponent} from "./components/entity-validation-summary/entity-validation-summary.component";
import {FilesComponent} from "./components/files/files.component";
import {MetadataListComponent} from "./components/metadata-list/metadata-list.component";
import {SubmitComponent} from "./components/submit/submit.component";
import {ValidationSummaryComponent} from "./components/validation-summary/validation-summary.component";
import {SubmissionComponent} from "./pages/submission.component";
import {SharedModule} from "@shared/shared.module";

@NgModule({
  declarations: [
    SubmissionComponent,
    ValidationSummaryComponent,
    SubmitComponent,
    MetadataListComponent,
    FilesComponent,
    EntityValidationSummaryComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    SharedModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule,
    MaterialModule,
    NgxDatatableModule,
    SubmissionRoutingModule,
    SharedModule,
  ]
})
export class SubmissionModule { }
