export interface SubmissionEnvelope {
  uuid: object;
  submissionDate: string;
  updateDate: string;
  submissionState: string;
  stagingDetails: Object;
  open: boolean;
  errors: any;
  lastSpreadsheetGenerationJob?: object;
  contentLastUpdated?: string
}
