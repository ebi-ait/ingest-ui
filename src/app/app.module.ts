import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';

import {FlexLayoutModule} from '@angular/flex-layout';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {NgxChartsModule} from '@swimlane/ngx-charts';

import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NgxGraphModule} from '@swimlane/ngx-graph';

import {AaiCallbackComponent} from './aai-callback/aai-callback.component';
import {AaiSecurity} from './aai/aai.module';
import {OidcInterceptor} from './aai/oidc-interceptor';
import {AllProjectsComponent} from './projects/pages/all-projects/all-projects.component';

import {AppComponent} from './app.component';

import {ROUTES} from './app.routes';
import {ErrorComponent} from './error/error.component';
import {GlobalFooterComponent} from './global-footer/global-footer.component';
import {GlobalHeaderComponent} from './global-header/global-header.component';
import {GlobalNavigationComponent} from './global-navigation/global-navigation.component';
import {HttpErrorInterceptor} from './http-interceptors/http-error-interceptor';
import {LoginComponent} from './login/login.component';
import {MaterialModule} from './material.module';
import {MetadataDetailsDialogComponent} from './metadata-details-dialog/metadata-details-dialog.component';
import {MetadataPickerComponent} from './metadata-picker/metadata-picker.component';
import {MetadataSchemaFormModule} from './metadata-schema-form/metadata-schema-form.module';
import {MyProjectsComponent} from './my-projects/my-projects.component';
import {ProcessDetailsComponent} from './process-details/process-details.component';
import {ProjectsModule} from './projects/projects.module';
import {ProjectSummaryComponent} from './project-summary/project-summary.component';

import {ProjectComponent} from './project/project.component';
import {RegistrationComponent} from './registration/registration.component';
import {AlertComponent} from './shared/components/alert/alert.component';
import {ProjectListComponent} from './shared/components/project-list/project-list.component';
import {TabComponent} from './shared/components/tab/tab.component';
import {TabsComponent} from './shared/components/tabs/tabs.component';

import {UploadComponent} from './shared/components/upload/upload.component';
import {AlertService} from './shared/services/alert.service';
import {AuthService} from './shared/services/auth.service';
import {BrokerService} from './shared/services/broker.service';
import {FlattenService} from './shared/services/flatten.service';

import {IngestService} from './shared/services/ingest.service';
import {LoaderService} from './shared/services/loader.service';
import {SchemaService} from './shared/services/schema.service';

import {SharedModule} from './shared/shared.module';
import {SubmissionListComponent} from './submission-list/submission-list.component';
import {FilesComponent} from './submission/files/files.component';
import {UploadInfoComponent} from './submission/files/upload-info/upload-info.component';

import {MetadataListComponent} from './submission/metadata-list/metadata-list.component';
import {SubmissionComponent} from './submission/submission.component';
import {SubmitComponent} from './submission/submit/submit.component';
import {TemplateQuestionnaireModule} from './template-questionnaire/template-questionnaire.module';
import {WelcomeComponent} from './welcome/welcome.component';

const BROWSER_LOCALE = navigator.language;

@NgModule({
  declarations: [
    AppComponent,
    SubmissionListComponent,
    GlobalNavigationComponent,
    ProjectComponent,
    SubmissionComponent,
    TabComponent,
    TabsComponent,
    FilesComponent,
    UploadInfoComponent,
    SubmitComponent,
    MetadataListComponent,
    ProjectListComponent,
    AllProjectsComponent,
    UploadComponent,
    LoginComponent,
    ProjectSummaryComponent,
    AlertComponent,
    AaiCallbackComponent,
    MyProjectsComponent,
    GlobalHeaderComponent,
    RegistrationComponent,
    WelcomeComponent,
    ErrorComponent,
    GlobalFooterComponent,
    MetadataDetailsDialogComponent,
    ProcessDetailsComponent,
    MetadataPickerComponent,
  ],
  imports: [
    AaiSecurity,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MaterialModule,
    MatMenuModule,
    MetadataSchemaFormModule,
    TemplateQuestionnaireModule,
    MatDialogModule,
    NgxGraphModule,
    NgxChartsModule,
    ProjectsModule,
    NgxGraphModule,
    NgxChartsModule,
    NgxDatatableModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),
    SharedModule,
    TemplateQuestionnaireModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: OidcInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {provide: MAT_DATE_LOCALE, useValue: BROWSER_LOCALE},
    IngestService,
    BrokerService,
    FormBuilder,
    AlertService,
    AuthService,
    LoaderService,
    FlattenService,
    SchemaService,
  ],
  bootstrap: [AppComponent]
})


export class AppModule {
}

