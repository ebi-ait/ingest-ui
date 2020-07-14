import { Component, OnInit } from '@angular/core';
import {TemplateSpecification} from "../template-specification";

@Component({
  selector: 'app-template-questionnaire',
  templateUrl: './template-questionnaire.component.html',
  styleUrls: ['../template-generator.css']
})
export class TemplateQuestionnaireComponent {

  donorTypes = ['human', 'mouse', 'other'];
  preNatalQuantity = ['all', 'some', 'none'];
  specimenTypes = ['primary tissue', 'organoid', 'cell line']

  model = new TemplateSpecification([])

}
