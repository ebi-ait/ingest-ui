import {Component, Input, OnInit} from '@angular/core';
import {SUBMISSION_STATES} from "@shared/constants";

@Component({
  selector: 'app-submission-state',
  templateUrl: './submission-state.component.html',
  styleUrls: ['./submission-state.scss']
})
export class SubmissionStateComponent {
  @Input()
  state: string;

  constructor() {
  }
  /**
   * Return the CSS class name corresponding to the current submission state value, for styling the submission state
   * chip.
   *
   * @param submissionState {string}
   * @returns {string}
   */
  getStateChipClassName(submissionState: string): string {
    switch(submissionState) {
      case SUBMISSION_STATES.Pending:
      case SUBMISSION_STATES.Draft:
        return 'warning';
      case SUBMISSION_STATES.Valid:
      case SUBMISSION_STATES.GraphValid:
        return 'success';
      case SUBMISSION_STATES.Validating:
      case SUBMISSION_STATES.GraphValidating:
      case SUBMISSION_STATES.GraphValidationRequested:
        return 'info';
      case SUBMISSION_STATES.Invalid:
      case SUBMISSION_STATES.GraphInvalid:
        return 'danger';
      case SUBMISSION_STATES.Submitted:
        return 'secondary';
      case SUBMISSION_STATES.Processing:
      case SUBMISSION_STATES.Cleanup:
      case SUBMISSION_STATES.Archiving:
      case SUBMISSION_STATES.Exporting:
        return 'warning-invert';
      case SUBMISSION_STATES.Complete:
      case SUBMISSION_STATES.Exported:
      case SUBMISSION_STATES.Archived:
        return 'success-invert';
      default:
        return 'secondary';
    }
  }
}
