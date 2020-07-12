import { Component, OnInit } from '@angular/core';
import {TemplateSpecification} from "./template-specification";

@Component({
  selector: 'app-template-questionnaire',
  templateUrl: './template-questionnaire.component.html',
  styleUrls: ['./template-questionnaire.component.css']
})
export class TemplateQuestionnaireComponent {

  donorTypes = ['human', 'mouse'];

  model = new TemplateSpecification([])

}
