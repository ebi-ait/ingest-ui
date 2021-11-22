export interface MetadataDocument {
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
  // present on submission
  graphValidationState?: string[];
  isUpdate: boolean;
  _links: object;
}

interface Uuid {
  uuid: string;
}
