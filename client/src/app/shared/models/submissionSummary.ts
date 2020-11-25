interface Uuid {
  uuid: string;
}
export interface SubmissionSummary {
  uuid: Uuid;
  totalBiomaterials: number;
  invalidBiomaterials: number;
  totalFiles: number;
  invalidFiles: number;
  fileErrors: number;
  fileMetadataErrors: number;
  missingFiles: number;
  totalProcesses: number;
  invalidProcesses: number;
  totalProtocols: number;
  invalidProtocols: number;
  totalInvalid: number;
}
