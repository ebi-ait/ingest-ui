import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatTabsModule} from "@angular/material/tabs";
import {MaterialModule} from "@app/material.module";
import {MetadataPickerComponent} from "./components/metadata-picker/metadata-picker.component";
import {NgxGraphModule} from "@swimlane/ngx-graph";
import {SubmissionRoutingModule} from "./submission-routing.module";
import {ProcessDetailsComponent} from "./components/process-details/process-details.component";
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
    ProcessDetailsComponent,
    SubmissionComponent,
    ValidationSummaryComponent,
    SubmitComponent,
    MetadataListComponent,
    FilesComponent,
    EntityValidationSummaryComponent,
    MetadataPickerComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    SharedModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    MatMenuModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgxGraphModule,
    SubmissionRoutingModule,
    SharedModule,
  ]
})
export class SubmissionModule { }
