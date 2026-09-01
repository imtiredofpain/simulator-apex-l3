import { endpoints, http } from '@shared/api/endpoints';
import type {
  AdminJobDetails,
  AdminJobDto,
  AdminJobId,
  AdminJobStatus,
  AdminJobStatusInfo,
  AdminJobMaterialOption,
  AdminJobOrganizationOption,
  AdminJobTemplate,
  AdminJobTransition,
  BulkAdminJobIdsRequest,
  BulkForceAdminJobStatusRequest,
  BulkJobOperationItemResult,
  BulkJobOperationResult,
  BulkSimulateCodesFromL2ItemResult,
  AutoJobScheduleDto,
  CreateAdminJobFromTemplateRequest,
  CreateAutoJobScheduleRequest,
  ExecuteAdminJobActionRequest,
  ForceAdminJobStatusRequest,
  ResetAdminJobReportingResult,
  SimulateAggregationResult,
  SimulateCodesFromL2Result,
  SimulateL2AggregationResult,
} from './types';

export const adminJobsApi = {
  getAll: () => endpoints.adminJobs.list.call<AdminJobDto[]>(http),
  getById: (id: AdminJobId) =>
    endpoints.adminJobs.byId.call<AdminJobDetails>(http, { params: { id } }),
  remove: (id: AdminJobId) =>
    endpoints.adminJobs.remove.call<void>(http, { params: { id } }),
  executeAction: (
    id: AdminJobId,
    body: ExecuteAdminJobActionRequest
  ) =>
    endpoints.adminJobs.executeAction.call<void>(http, {
      params: { id },
      body,
    }),
  retry: (id: AdminJobId) =>
    endpoints.adminJobs.retry.call<void>(http, { params: { id } }),
  bulkRetry: (filterByStatus?: AdminJobStatus) =>
    endpoints.adminJobs.bulkRetry.call<number>(http, {
      query: { filterByStatus },
    }),
  forceStatus: (id: AdminJobId, body: ForceAdminJobStatusRequest) =>
    endpoints.adminJobs.forceStatus.call<void>(http, {
      params: { id },
      body,
    }),
  bulkForceStatus: (body: BulkForceAdminJobStatusRequest) =>
    endpoints.adminJobs.bulkForceStatus.call<
      BulkJobOperationResult<BulkJobOperationItemResult>
    >(http, { body }),
  getDeleted: () => endpoints.adminJobs.deleted.call<AdminJobDto[]>(http),
  getTemplates: () =>
    endpoints.adminJobs.templates.call<AdminJobTemplate[]>(http),
  getOrganizations: () =>
    endpoints.adminJobs.organizations.call<AdminJobOrganizationOption[]>(http),
  getMaterials: () =>
    endpoints.adminJobs.materials.call<AdminJobMaterialOption[]>(http),
  createFromTemplate: (body: CreateAdminJobFromTemplateRequest) =>
    endpoints.adminJobs.createFromTemplate.call<AdminJobDto>(http, { body }),
  getAutoCreation: () =>
    endpoints.adminJobs.autoCreation.call<AutoJobScheduleDto[]>(http),
  createAutoCreation: (body: CreateAutoJobScheduleRequest) =>
    endpoints.adminJobs.createAutoCreation.call<AutoJobScheduleDto>(http, {
      body,
    }),
  deleteAutoCreation: (id: string) =>
    endpoints.adminJobs.deleteAutoCreation.call<void>(http, {
      params: { id },
    }),

  getStatuses: () =>
    endpoints.adminJobs.statuses.call<AdminJobStatusInfo[]>(http),
  getAllowedTransitions: (id: AdminJobId) =>
    endpoints.adminJobs.allowedTransitions.call<AdminJobTransition[]>(http, {
      params: { id },
    }),
  reset: (id: AdminJobId) =>
    endpoints.adminJobs.reset.call<void>(http, { params: { id } }),
  resetCodesFromL2: (jobId: AdminJobId) =>
    endpoints.adminJobs.resetCodesFromL2.call<number>(http, {
      params: { jobId },
    }),
  resetReporting: (jobId: AdminJobId) =>
    endpoints.adminJobs.resetReporting.call<ResetAdminJobReportingResult>(
      http,
      { params: { jobId } }
    ),
  simulateCodesFromL2: (jobId: AdminJobId) =>
    endpoints.adminJobs.simulateCodesFromL2.call<SimulateCodesFromL2Result>(
      http,
      { params: { jobId } }
    ),
  bulkSimulateCodesFromL2: (body: BulkAdminJobIdsRequest) =>
    endpoints.adminJobs.bulkSimulateCodesFromL2.call<
      BulkJobOperationResult<BulkSimulateCodesFromL2ItemResult>
    >(http, { body }),
  simulateAggregation: (jobId: AdminJobId) =>
    endpoints.adminJobs.simulateAggregation.call<SimulateAggregationResult>(
      http,
      { params: { jobId } }
    ),
  simulateL2Aggregation: (jobId: AdminJobId) =>
    endpoints.adminJobs.simulateL2Aggregation.call<SimulateL2AggregationResult>(
      http,
      { params: { jobId } }
    ),
};
