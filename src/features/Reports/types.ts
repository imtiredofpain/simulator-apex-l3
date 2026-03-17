export interface IReport {
  id: string;
  documentNumber: string;
  documentType: string;
  documentDescription: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
  processedAt?: string;
  errorMessage?: string;
  isCompleted: boolean;
  isSuccess: boolean;
  organizationId: number;
  targetSystem: string;
  history?: IReportHistory[];
}

export interface IReportHistory {
  id: string;
  timestamp: string;
  action: number | string;
  oldStatus: string;
  newStatus: string;
  comment: string;
}

export interface IReportType {
  type: string
  description: string
}