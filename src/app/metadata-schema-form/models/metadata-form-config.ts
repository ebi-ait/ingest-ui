import {MetadataFormLayout} from './metadata-form-layout';

export interface MetadataFormConfig {
  hideFields?: string[];
  hideEmptyFields?: boolean;
  disableFields?: string[];
  cleanAttributes?: boolean | string[];
  viewMode?: boolean;
  layout?: MetadataFormLayout;
  inputType?: object;
  overrideRequiredFields?: { [key: string]: boolean };
  overrideGuidelines?: { [key: string]: string };
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  showResetButton?: boolean;
  showCancelButton?: boolean;
}
