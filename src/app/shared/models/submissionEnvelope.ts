import {HalDoc} from "@shared/models/hateoas";

export interface SubmissionEnvelope extends HalDoc{
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
