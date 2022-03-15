import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatTabsModule} from "@angular/material/tabs";
import {MaterialModule} from "@app/material.module";
import {UploadInfoComponent} from "./components/upload-info/upload-info.component";
import {MetadataPickerComponent} from "./components/metadata-picker/metadata-picker.component";
import {NgxGraphModule} from "@swimlane/ngx-graph";
import {SubmissionRoutingModule} from "./submission-routing.module";
import {ProcessDetailsComponent} from "./components/process-details/process-details.component";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {EntityValidationSummaryComponent} from "./components/entity-validation-summary/entity-validation-summary.component";
import {FilesComponent} from "./components/files/files.component";
import {MetadataListComponent} from "./components/metadata-list/metadata-list.component";
import {SubmitComponent} from "./components/submit/submit.component";
import {SubmitToSceaComponent} from "./components/submit-to-scea/submit-to-scea.component";
import {ExportToArchivesComponent} from "./components/export-to-archives/export-to-archives.component";
import {ValidationSummaryComponent} from "./components/validation-summary/validation-summary.component";
import {SubmissionComponent} from "./pages/submission.component";
import {SharedModule} from "@shared/shared.module";
import {MetadataSchemaFormModule} from "@metadata-schema-form/metadata-schema-form.module";
import { SpreadsheetTabDetailsComponent } from './components/spreadsheet-tab-details/spreadsheet-tab-details.component';

@NgModule({
  declarations: [
    ProcessDetailsComponent,
    SubmissionComponent,
    UploadInfoComponent,
    ValidationSummaryComponent,
    SubmitComponent,
    SubmitToSceaComponent,
    ExportToArchivesComponent,
    MetadataListComponent,
    FilesComponent,
    EntityValidationSummaryComponent,
    MetadataPickerComponent,
    SpreadsheetTabDetailsComponent
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
  ]
})
export class SubmissionModule {
}
