import {DatePipe} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {saveAs} from 'file-saver';
import {MetadataFormConfig} from '@metadata-schema-form/models/metadata-form-config';
import {MetadataFormLayout} from '@metadata-schema-form/models/metadata-form-layout';
import {AlertService} from '@shared/services/alert.service';
import {LoaderService} from '@shared/services/loader.service';
import {DonorGroupComponent} from '../donor-group/donor-group.component';
import {ExperimentDetailGroupComponent} from '../experiment-detail-group/experiment-detail-group.component';
import {SpecimenGroupComponent} from '../specimen-group/specimen-group.component';
import {TechnologyGroupComponent} from '../technology-group/technology-group.component';
import {TemplateGeneratorService} from '../template-generator.service';

import {QuestionnaireData, TemplateSpecification} from '../template-questionnaire.data';
import * as questionnaireSchema from './template-questionnaire-schema.json';

export const layout: MetadataFormLayout = {
  tabs: [
    {
      title: 'Spreadsheet Questionnaire',
      key: 'template-questionnaire',
      items: [
        {
          component: TechnologyGroupComponent
        },
        {
          component: DonorGroupComponent
        },
        {
          component: SpecimenGroupComponent
        },
        {
          component: ExperimentDetailGroupComponent
        }
      ]
    }
  ]
};

@Component({
  selector: 'app-template-questionnaire',
  templateUrl: './template-questionnaire-form.component.html',
  styleUrls: ['./template-questionnaire-form.component.css']
})
export class TemplateQuestionnaireFormComponent {
  templateQuestionnaireSchema: any = (questionnaireSchema as any).default;
  questionnaireData: object = {
        donorsRelated: '',
        identifyingOrganisms: [],
        libraryPreparation: [],
        preNatalQuantity: '',
        protocols: [],
        specimenType: [],
        technologyType: [],
        experimentInfo: [],
        timecourseBiomaterialType: []
      };
  config: MetadataFormConfig = {
    layout: layout,
    submitButtonLabel: 'Generate Spreadsheet',
    cancelButtonLabel: 'Cancel',
    showResetButton: true,
    inputType: {
      'preNatalQuantity': 'radioList',
      'specimenPurchased': 'radioInline',
      'donorsRelated': 'radioInline',
      'experimentInfo': 'radioInLine'
    }
  };

  constructor(private templateGenerator: TemplateGeneratorService,
              private loaderService: LoaderService,
              private alertService: AlertService,
              private router: Router,
              private datePipe: DatePipe) {

  }

  onSave($event: object) {
    const data: QuestionnaireData = $event['value'];
    const valid = $event['valid'];

    if (valid) {
      this.loaderService.display(true, 'Generating your spreadsheet could take up to a minute,' +
      ' please don\'t refresh while this is happening.');
    const templateSpec = TemplateSpecification.convert(data);

    this.templateGenerator.generateTemplate(templateSpec)
      .subscribe(
        blob => {
          saveAs(blob, `hca_metadata_template-${this.datePipe.transform(Date.now(), 'yyyyMMdd')}.xlsx`);
          this.loaderService.display(false);
          this.alertService.clear();
          this.alertService.success('Success', 'You have successfully generated a template spreadsheet!');
          window.scroll(0, 0);
        },
        error => {
          this.loaderService.display(false);

          console.error('Error on template generation', error);
          let message = '';

          if (error instanceof Error) {
            message = error.message;
          } else if (error instanceof HttpErrorResponse) {
            message = `HTTP ${error.status} - ${error.message}`;
          }

          this.alertService.clear();
          this.alertService.error('An error has occurred while generating your template spreadsheet.',
            `Error: ${message} <br/> <br/> Please try again later.  If the error persists, please email email hca-ingest-dev@ebi.ac.uk.`);
          window.scroll(0, 0);
        }
      );
    } else {
      {
        this.alertService.clear();
        const message = 'Some required fields in the form have not been filled out. Please enter all required ' +
          'information before generating a spreadsheet.';
        this.alertService.error('Missing required information:', message);
        window.scroll(0, 0);
      }
    }
  }

  onCancel($event) {
    if ($event) {
      this.router.navigate(['/projects']);
    }
  }

  onReset($event: boolean) {
    window.location.reload();
  }
}
