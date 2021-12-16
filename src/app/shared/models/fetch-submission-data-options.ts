import {INVALID_FILE_TYPES, METADATA_VALIDATION_STATES} from "@shared/constants";
import {Sort} from "@shared/models/paginatedEndpoint";

export interface FetchSubmissionDataOptions {
  submissionId: string;
  entityType: string;
  sort: Sort;
  filterState: METADATA_VALIDATION_STATES | INVALID_FILE_TYPES;
}
