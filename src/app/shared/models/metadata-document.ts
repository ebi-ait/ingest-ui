import {HalDoc} from "@shared/models/hateoas";

export interface MetadataDocument extends HalDoc {
  content: object;
  submissionDate: string;
  updateDate: string;
  user?: any;
  lastModifiedUser: string;
  type: string;
  uuid: Uuid;
  events: any[];
  dcpVersion: string;
  accession?: any;
  validationState: string;
  validationErrors: any[];
  // Present on metadata entities except submission
  graphValidationErrors?: string[];
  isUpdate: boolean;
}

export interface Uuid {
  uuid: string;
}
