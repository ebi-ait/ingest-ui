interface Uuid {
  uuid: string;
}
export interface SubmissionSummary {
  uuid: Uuid;
  totalBiomaterials: number;
  invalidBiomaterials: number;
  graphInvalidBiomaterials: number;
  totalFiles: number;
  invalidFiles: number;
  graphInvalidFiles: number;
  fileErrors: number;
  fileMetadataErrors: number;
  missingFiles: number;
  totalProcesses: number;
  invalidProcesses: number;
  graphInvalidProcesses: number;
  totalProtocols: number;
  invalidProtocols: number;
  graphInvalidProtocols: number;
  totalInvalid: number;
}
