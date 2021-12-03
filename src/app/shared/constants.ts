export enum SUBMISSION_STATES {
  Pending = 'Pending',
  Draft = 'Draft',
  Validating = 'Validating',
  Invalid = 'Invalid',
  Valid = 'Valid',
  GraphValidationRequested = 'Graph validation requested',
  GraphValidating = 'Graph validating',
  GraphValid = 'Graph valid',
  GraphInvalid = 'Graph invalid',
  Submitted = 'Submitted',
  Processing = 'Processing',
  Archiving = 'Archiving',
  Archived = 'Archived',
  Exporting = 'Exporting',
  Exported = 'Exported',
  Cleanup = 'Cleanup',
  Complete = 'Complete'
}

export const SUBMITTED_STATES = [
  SUBMISSION_STATES.Submitted,
  SUBMISSION_STATES.Processing,
  SUBMISSION_STATES.Archiving,
  SUBMISSION_STATES.Archived,
  SUBMISSION_STATES.Exporting,
  SUBMISSION_STATES.Exported,
  SUBMISSION_STATES.Cleanup,
  SUBMISSION_STATES.Complete
];

export enum METADATA_VALIDATION_STATES {
  Draft = 'Draft',
  Validating = 'Validating',
  Valid = 'Valid',
  Invalid = 'Invalid',
  GraphInvalid = 'Invalid Graph'
}

export enum INVALID_FILE_TYPES {
  Metadata = 'Invalid Metadata',
  File = 'Invalid File',
  NotUploaded = 'Not Uploaded'
}

export const INVALID_FILE_TYPES_AND_CODES = [{
  humanFriendly: INVALID_FILE_TYPES.Metadata,
  code: 'METADATA_ERROR'
}, {
  humanFriendly: INVALID_FILE_TYPES.File,
  code: 'FILE_ERROR'
}, {
  humanFriendly: INVALID_FILE_TYPES.NotUploaded,
  code: 'FILE_NOT_UPLOADED'
}];
