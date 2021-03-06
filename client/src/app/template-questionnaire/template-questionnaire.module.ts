import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {TemplateQuestionnaireFormComponent} from './template-questionnaire-form/template-questionnaire-form.component';
import {MetadataSchemaFormModule} from '../metadata-schema-form/metadata-schema-form.module';
import {SpecimenGroupComponent} from './specimen-group/specimen-group.component';
import {DonorGroupComponent} from './donor-group/donor-group.component';
import {TechnologyGroupComponent} from './technology-group/technology-group.component';
import {TemplateGeneratorService} from './template-generator.service';
import {ExperimentDetailGroupComponent} from "./experiment-detail-group/experiment-detail-group.component";


@NgModule({
  providers: [
    TemplateGeneratorService,
    DatePipe
  ],
  declarations: [
    TemplateQuestionnaireFormComponent,
    TechnologyGroupComponent,
    DonorGroupComponent,
    SpecimenGroupComponent,
    ExperimentDetailGroupComponent
  ],
  exports: [
    TemplateQuestionnaireFormComponent
  ],
  imports: [
    CommonModule,
    MetadataSchemaFormModule
  ]
})
export class TemplateQuestionnaireModule {
}
