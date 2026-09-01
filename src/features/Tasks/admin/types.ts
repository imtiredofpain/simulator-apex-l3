export type AdminJobId = number;
export type AdminJobStatus = number;

export interface AdminJobStatusDetails {
  enumKey: AdminJobStatus;
  description: string;
}

export interface AdminJobActionInfo {
  forbidden: boolean;
  why?: string | null;
}

export interface AdminJobCounters {
  global: Record<string, number>;
  byLevel: Record<string, Record<string, unknown>>;
}

export interface AdminJobRelatedEntity {
  id: number;
  name?: string;
  externalUuid?: string | null;
  materialNumber?: string;
  packageNumber?: string;
  lineNumber?: string;
  product?: AdminJobRelatedEntity | null;
  [key: string]: unknown;
}

export interface AdminJobPackageMetadata {
  isActive?: boolean;
  packageLevel?: number | string;
  emissionMethod?: number | string;
  materialPackageId?: number | null;
  totalDemandQty?: number;
  reservedQty?: number;
  capacity?: number;
  preprinted?: boolean;
  reservationPercentage?: number;
  components?: Array<Record<string, unknown>> | null;
  [key: string]: unknown;
}

export interface AdminJobDocument {
  id: string;
  documentNumber: string;
  documentType: string;
  documentDescription: string;
  status: string;
  statusDescription: string;
  createdAt: string;
  modifiedAt: string;
  isCompleted: boolean;
  isSuccess: boolean;
  errorMessage?: string | null;
  retryAt?: string | null;
}

/**
 * Superset of JobResponseDto (list) and JobDto (details).
 * Admin list and details use two different backend DTOs.
 */
export interface AdminJobDto {
  id: AdminJobId;
  externalUuid?: string | null;
  jobCode?: string;
  jobNumber: string;
  plannedQuantity: number;
  jobType: number;
  jobStatus: AdminJobStatus;
  jobStatusDetails?: AdminJobStatusDetails | null;
  plannedStartTime: string | null;
  plannedEndTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  createdAt: string;
  updatedAt: string;
  productionTimeSettings: Record<string, unknown>;
  partialReportSettings: Record<string, unknown>;
  packageMetadata?: Record<string, AdminJobPackageMetadata>;
  errorMessage?: string | null;
  autoRelease?: boolean;
  partialReserveRelease?: boolean;
  autoSendToLine?: boolean;
  retryAt?: string | null;
  consignmentNumber?: string | null;
  material?: AdminJobRelatedEntity | null;
  materialExternalUuid?: string | null;
  package?: AdminJobRelatedEntity | null;
  packageExternalUuid?: string | null;
  line?: AdminJobRelatedEntity | null;
  lineId?: number | null;
  lineExternalUuid?: string | null;
  counters: AdminJobCounters;
  documents?: AdminJobDocument[] | null;
}

export interface AdminJobDetails {
  job: AdminJobDto;
  actions: Record<string, AdminJobActionInfo>;
  jobStatusDetails: AdminJobStatusDetails;
}

export interface ExecuteAdminJobActionRequest {
  action: number;
}

export interface ForceAdminJobStatusRequest {
  targetStatus: AdminJobStatus;
  comment?: string;
}

export interface BulkAdminJobIdsRequest {
  jobIds: AdminJobId[];
}

export interface BulkForceAdminJobStatusRequest extends BulkAdminJobIdsRequest {
  targetStatus: AdminJobStatus;
  comment?: string;
}

export interface BulkJobOperationItemResult {
  jobId: AdminJobId;
  isSuccess: boolean;
  errorCode?: string | null;
  message?: string | null;
}

export interface BulkSimulateCodesFromL2ItemResult
  extends BulkJobOperationItemResult {
  data?: SimulateCodesFromL2Result | null;
}

export interface BulkJobOperationResult<
  TItem extends BulkJobOperationItemResult = BulkJobOperationItemResult,
> {
  requestedCount: number;
  uniqueCount: number;
  succeededCount: number;
  failedCount: number;
  items: TItem[];
}

export interface CreateAdminJobFromTemplateRequest {
  templateName: string;
  organizationId?: number;
  materialId?: number;
}

export interface AdminJobTemplateSettings {
  autoRelease: boolean;
  autoSendToLine: boolean;
}

export interface AdminJobPartialReportTemplateSettings {
  use: boolean;
  interval?: string | null;
  startTime?: string | null;
}

export interface AdminJobProductionTimeTemplateSettings {
  calculationMethod?: string | null;
  fixedProductionDate?: string | null;
  timeShift?: number | null;
  timeShiftUnit?: string | null;
}

export interface AdminJobTemplate {
  name: string;
  description: string;
  jobType: string;
  plannedQuantity: number;
  materialId?: number | null;
  lineId?: number | null;
  packageId?: number | null;
  settings?: AdminJobTemplateSettings | null;
  partialReportSettings?: AdminJobPartialReportTemplateSettings | null;
  productionTimeSettings?: AdminJobProductionTimeTemplateSettings | null;
}

export interface CreateAutoJobScheduleRequest {
  templateName: string;
  organizationId?: number;
  materialIds?: number[];
  /** TimeSpan in hh:mm:ss format. */
  interval: string;
  startAtUtc?: string;
  maxRuns?: number;
}

export interface AutoJobScheduleDto {
  id: string;
  templateName: string;
  organizationId?: number | null;
  materialIds: number[];
  interval: string;
  createdAtUtc: string;
  nextRunAtUtc: string;
  lastRunAtUtc?: string | null;
  createdJobsCount: number;
  currentMaterialIndex: number;
  isActive: boolean;
  isRunning: boolean;
  maxRuns?: number | null;
  lastCreatedJobId?: number | null;
  lastCreatedJobNumber?: string | null;
  lastError?: string | null;
}

export interface AdminJobStatusInfo {
  value: AdminJobStatus;
  name: string;
  description: string;
}

export interface AdminJobTransition {
  id: AdminJobStatus;
  name: string;
  canChange: boolean;
  reason?: string | null;
}

export interface AdminJobOrganizationOption {
  id: number;
  inn: string;
  name: string;
}

export interface AdminJobMaterialOption {
  id: number;
  materialNumber: string;
  name: string;
}

export interface ResetAdminJobReportingResult {
  packsReset: number;
  documentsDeleted: number;
}

export interface SimulateCodesFromL2Result {
  totalPacks: number;
  updatedPacks: number;
  skippedPacks: number;
  newJobStatus: string;
  updatedByLevel: Record<string, number>;
}

export interface SimulateAggregationResult {
  jobId: AdminJobId;
  totalPacks: number;
  aggregatedPacks: number;
  parentsByLevel: Record<string, number>;
  childrenByLevel: Record<string, number>;
  warnings: string[];
}

export interface L2AggregationLevelInfo {
  level: string;
  parentLevel?: string | null;
  parentCount: number;
  childrenAssigned: number;
  capacity: number;
  remaining: number;
}

export interface SimulateL2AggregationResult {
  jobId: AdminJobId;
  totalPacks: number;
  aggregatedPacks: number;
  levels: Record<string, L2AggregationLevelInfo>;
  warnings: string[];
}
