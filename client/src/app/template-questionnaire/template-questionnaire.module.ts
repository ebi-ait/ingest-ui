import {CommonModule, DatePipe} from '@angular/common';
import {NgModule} from '@angular/core';
import {MetadataSchemaFormModule} from '../metadata-schema-form/metadata-schema-form.module';
import {DonorGroupComponent} from './donor-group/donor-group.component';
import {ExperimentDetailGroupComponent} from "./experiment-detail-group/experiment-detail-group.component";
import {SpecimenGroupComponent} from './specimen-group/specimen-group.component';
import {TechnologyGroupComponent} from './technology-group/technology-group.component';
import {TemplateGeneratorService} from './template-generator.service';
import {TemplateQuestionnaireFormComponent} from './template-questionnaire-form/template-questionnaire-form.component';


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
