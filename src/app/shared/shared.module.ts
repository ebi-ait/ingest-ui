import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {DataTableComponent} from './components/data-table/data-table.component';
import {EllipsisComponent} from './components/ellipsis/ellipsis.component';
import {MetadataStateComponent} from './components/metadata-state/metadata-state.component';
import {SubmissionStateComponent} from './components/submission-state/submission-state.component';
import {UuidComponent} from "./components/uuid/uuid.component";

import {ClipboardDirective} from './directives/clipboard.directive';
import {ClipboardService} from './services/clipboard.service';


@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatTabsModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatListModule,
    MatToolbarModule,
    NgxDatatableModule
  ],
  declarations: [
    ClipboardDirective,
    SubmissionStateComponent,
    MetadataStateComponent,
    DataTableComponent,
    EllipsisComponent,
    UuidComponent
  ],
  exports: [
    ClipboardDirective,
    SubmissionStateComponent,
    MetadataStateComponent,
    DataTableComponent,
    EllipsisComponent,
    UuidComponent
  ],
  providers: [
    ClipboardService
  ]
})
export class SharedModule {
}
