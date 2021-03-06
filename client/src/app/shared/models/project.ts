import {MetadataDocument} from './metadata-document';

export interface Project extends MetadataDocument {
  hasOpenSubmission: boolean;
  releaseDate?: string;
  accessionDate?: string;
  primaryWrangler?: string;
  secondaryWrangler?: string;
  wranglingState?: string;
  wranglingNotes?: string;
  dataAccess?: object;
  technology?: object;
  identifyingOrganisms?: object;
  _links: object;
}

export const enum ProjectColumn {
  apiLink,
  shortName,
  projectTitle,
  lastUpdated,
  primaryContributor,
  primaryWrangler,
  wranglingState
}
