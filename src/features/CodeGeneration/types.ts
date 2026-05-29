export interface ScriptDto {
  id: number;
  name: string;
  description: string | null;
  script: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface GenerateByScriptDto {
  scriptId: number;
  quantity: number;
  parameters?: Record<string, unknown>;
}

export interface GenerateExecuteDto {
  scriptCode: string;
  quantity: number;
  parameters?: Record<string, unknown>;
}

export interface GenerateResultDto {
  success: boolean;
  codes: string[];
  error: string | null;
  executionTimeMs: number;
}

export interface DashboardMetricWindowDto {
  totalSinceStart: number;
  last5Minutes: number;
  perMinute: number;
}

export interface DashboardProcessingTimeDto {
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  sampleCount: number;
}

export interface DashboardServiceHealthDto {
  serviceName: string;
  isRunning: boolean;
  isStalled: boolean;
  lastHeartbeat: string;
  uptime: string;
  secondsSinceLastHeartbeat: number;
}

export interface DashboardDocumentsDto {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  withErrors: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface DashboardJobsDto {
  total: number;
  byStatus: Record<string, number>;
  withErrors: number;
  active: number;
  terminal: number;
}

export interface DashboardPacksDto {
  total: number;
  byStatus: Record<string, number>;
}

export interface DashboardJobServiceDto {
  health: DashboardServiceHealthDto;
  processed: DashboardMetricWindowDto;
  failed: DashboardMetricWindowDto;
  timeout: DashboardMetricWindowDto;
  processingTime: DashboardProcessingTimeDto;
  activeJobsCount: number;
  activeJobs: Record<string, unknown>;
}

export interface DashboardDocumentServiceDto {
  health: DashboardServiceHealthDto;
  processed: DashboardMetricWindowDto;
  failed: DashboardMetricWindowDto;
  processingTime: DashboardProcessingTimeDto;
}

export interface DashboardBufferServiceDto {
  health: DashboardServiceHealthDto;
  enabled: boolean;
  totalPackagesChecked: number;
  totalOrdersCreated: number;
  totalPackagesNeedingReplenishment: number;
  ordersCreated: DashboardMetricWindowDto;
}

export interface DashboardBackgroundServicesDto {
  jobService: DashboardJobServiceDto;
  documentService: DashboardDocumentServiceDto;
  bufferService: DashboardBufferServiceDto;
  recentErrors: unknown[];
}

export interface DashboardDto {
  documents: DashboardDocumentsDto;
  jobs: DashboardJobsDto;
  packs: DashboardPacksDto;
  backgroundServices: DashboardBackgroundServicesDto;
}
