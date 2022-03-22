import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatTabsModule} from "@angular/material/tabs";
import {MaterialModule} from "@app/material.module";
import {MetadataSchemaFormModule} from "@metadata-schema-form/metadata-schema-form.module";
import {SharedModule} from "@shared/shared.module";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {NgxGraphModule} from "@swimlane/ngx-graph";
import {EntityValidationSummaryComponent} from "./components/entity-validation-summary/entity-validation-summary.component";
import {FilesComponent} from "./components/files/files.component";
import {MetadataListComponent} from "./components/metadata-list/metadata-list.component";
import {MetadataPickerComponent} from "./components/metadata-picker/metadata-picker.component";
import {MetadataCreationComponent} from './components/metadata-new/metadata-new.component';
import {MetadataDetailsDialogComponent} from './components/metadata-details-dialog/metadata-details-dialog.component';
import {ProcessDetailsComponent} from "./components/process-details/process-details.component";
import {ProcessNodeDetailsComponent} from './components/process-node-details/process-node-details.component';
import {SpreadsheetTabDetailsComponent} from './components/spreadsheet-tab-details/spreadsheet-tab-details.component';
import {SubmitComponent} from "./components/submit/submit.component";
import {UploadInfoComponent} from "./components/upload-info/upload-info.component";
import {ValidationSummaryComponent} from "./components/validation-summary/validation-summary.component";
import {SubmissionComponent} from "./pages/submission.component";
import {SubmissionRoutingModule} from "./submission-routing.module";

@NgModule({
  declarations: [
    ProcessDetailsComponent,
    SubmissionComponent,
    UploadInfoComponent,
    ValidationSummaryComponent,
    SubmitComponent,
    MetadataListComponent,
    MetadataCreationComponent,
    MetadataDetailsDialogComponent,
    FilesComponent,
    EntityValidationSummaryComponent,
    MetadataPickerComponent,
    SpreadsheetTabDetailsComponent,
    ProcessNodeDetailsComponent
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
    MetadataSchemaFormModule,
    MatDialogModule,
  ]
})
export class SubmissionModule {
}
