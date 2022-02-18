import {Component, Input, Output, EventEmitter} from '@angular/core';
import {INVALID_FILE_TYPES, METADATA_VALIDATION_STATES} from "@shared/constants";
import {SubmissionSummary} from "@shared/models/submissionSummary";

@Component({
  selector: 'app-validation-summary',
  templateUrl: './validation-summary.component.html',
  styleUrls: ['./validation-summary.component.scss']
})
export class ValidationSummaryComponent {
  @Input() summary: SubmissionSummary;
  @Output() errorClick = new EventEmitter<{  source: string, validationState: string }>()
  validationStates = METADATA_VALIDATION_STATES;
  fileValidationStates = INVALID_FILE_TYPES;

  onErrorClick($event) {
    this.errorClick.emit($event);
  }

}
