import {NgModule} from "@angular/core";
import {TemplateQuestionnaireComponent} from "./questionnaire/template-questionnaire.component";
import {BrowserModule} from "@angular/platform-browser";
import {TemplateQuestionComponent} from "./question/template-question.component";

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    TemplateQuestionComponent,
    TemplateQuestionnaireComponent
  ]
})
export class TemplateGenerator {}
