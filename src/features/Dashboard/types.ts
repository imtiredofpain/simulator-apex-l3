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
  eligibleNow: number;
  scheduled: number;
  blocked: number;
  oldestEligibleAt: string | null;
  oldestEligibleAgeSeconds: number | null;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  queueGroups: DashboardDocumentQueueGroupDto[];
}

export interface DashboardDocumentQueueGroupDto {
  organizationId: number;
  documentType: string;
  status: string;
  count: number;
}

export interface DashboardJobsDto {
  total: number;
  byStatus: Record<string, number>;
  withErrors: number;
  active: number;
  terminal: number;
  eligibleNow: number;
  scheduled: number;
  oldestEligibleAt: string | null;
  oldestEligibleAgeSeconds: number | null;
  queueGroups: DashboardJobQueueGroupDto[];
}

export interface DashboardJobQueueGroupDto {
  organizationId: number;
  status: string;
  count: number;
}

export interface DashboardPacksDto {
  total: number;
  byStatus: Record<string, number>;
}

export interface DashboardJobServiceDto {
  health: DashboardServiceHealthDto;
  lastProgressAt: string | null;
  secondsSinceLastProgress: number | null;
  isProgressStalled: boolean;
  processed: DashboardMetricWindowDto;
  failed: DashboardMetricWindowDto;
  timeout: DashboardMetricWindowDto;
  progressed: DashboardMetricWindowDto;
  withoutProgress: DashboardMetricWindowDto;
  processingTime: DashboardProcessingTimeDto;
  activeJobsCount: number;
  activeJobs: Record<string, string>;
}

export interface DashboardDocumentServiceDto {
  health: DashboardServiceHealthDto;
  lastProgressAt: string | null;
  secondsSinceLastProgress: number | null;
  isProgressStalled: boolean;
  processed: DashboardMetricWindowDto;
  failed: DashboardMetricWindowDto;
  progressed: DashboardMetricWindowDto;
  withoutProgress: DashboardMetricWindowDto;
  processingTime: DashboardProcessingTimeDto;
  unknownDocumentTypeCount: number;
  activeDocumentsCount: number;
  activeDocuments: Record<string, string>;
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
