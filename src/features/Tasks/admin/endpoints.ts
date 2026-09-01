import { defineEndpoints, tag } from '@shared/api/endpoints/builder';
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

const E = defineEndpoints('adminJobs');

const list = tag('admin-jobs:list');
const details = tag('admin-jobs:details');
const deleted = tag('admin-jobs:deleted');
const transitions = tag('admin-jobs:transitions');
const schedules = tag('admin-jobs:auto-creation');
const regularList = tag('jobs:list');
const regularDetails = tag('jobs:byId');

const jobChanged = [
  list,
  details,
  transitions,
  regularList,
  regularDetails,
];

export const adminJobsEndpoints = E((e) => ({
  list: e
    .get('list', 'v1/admin/jobs')
    .response<AdminJobDto[]>()
    .tag('admin-jobs:list'),
  byId: e
    .get('byId', 'v1/admin/jobs/:id')
    .params<{ id: AdminJobId }>()
    .response<AdminJobDetails>()
    .tag('admin-jobs:details'),
  remove: e
    .delete('remove', 'v1/admin/jobs/:id')
    .params<{ id: AdminJobId }>()
    .response<void>()
    .tag('admin-jobs:remove')
    .deps([list, details, deleted, regularList, regularDetails]),
  executeAction: e
    .post('executeAction', 'v1/admin/jobs/:id/action')
    .params<{ id: AdminJobId }>()
    .body<ExecuteAdminJobActionRequest>()
    .response<void>()
    .tag('admin-jobs:action')
    .deps(jobChanged),
  retry: e
    .post('retry', 'v1/admin/jobs/:id/retry')
    .params<{ id: AdminJobId }>()
    .response<void>()
    .tag('admin-jobs:retry')
    .deps(jobChanged),
  bulkRetry: e
    .post('bulkRetry', 'v1/admin/jobs/bulk-retry')
    .query<{ filterByStatus?: AdminJobStatus }>()
    .response<number>()
    .tag('admin-jobs:bulk-retry')
    .deps(jobChanged),
  forceStatus: e
    .post('forceStatus', 'v1/admin/jobs/:id/force-status')
    .params<{ id: AdminJobId }>()
    .body<ForceAdminJobStatusRequest>()
    .response<void>()
    .tag('admin-jobs:force-status')
    .deps(jobChanged),
  bulkForceStatus: e
    .post('bulkForceStatus', 'v1/admin/jobs/bulk/force-status')
    .body<BulkForceAdminJobStatusRequest>()
    .response<BulkJobOperationResult<BulkJobOperationItemResult>>()
    .tag('admin-jobs:bulk-force-status')
    .deps(jobChanged),
  deleted: e
    .get('deleted', 'v1/admin/jobs/deleted')
    .response<AdminJobDto[]>()
    .tag('admin-jobs:deleted'),
  templates: e
    .get('templates', 'v1/admin/jobs/templates')
    .response<AdminJobTemplate[]>()
    .tag('admin-jobs:templates'),
  organizations: e
    .get('organizations', 'v1/admin/organizations')
    .response<AdminJobOrganizationOption[]>()
    .tag('admin-jobs:organizations'),
  materials: e
    .get('materials', 'v1/admin/materials')
    .response<AdminJobMaterialOption[]>()
    .tag('admin-jobs:materials'),
  createFromTemplate: e
    .post('createFromTemplate', 'v1/admin/jobs/from-template')
    .body<CreateAdminJobFromTemplateRequest>()
    .response<AdminJobDto>()
    .tag('admin-jobs:create-from-template')
    .deps([list, regularList]),
  autoCreation: e
    .get('autoCreation', 'v1/admin/jobs/auto-creation')
    .response<AutoJobScheduleDto[]>()
    .tag('admin-jobs:auto-creation'),
  createAutoCreation: e
    .post('createAutoCreation', 'v1/admin/jobs/auto-creation')
    .body<CreateAutoJobScheduleRequest>()
    .response<AutoJobScheduleDto>()
    .tag('admin-jobs:create-auto-creation')
    .deps([schedules]),
  deleteAutoCreation: e
    .delete('deleteAutoCreation', 'v1/admin/jobs/auto-creation/:id')
    .params<{ id: string }>()
    .response<void>()
    .tag('admin-jobs:delete-auto-creation')
    .deps([schedules]),

  statuses: e
    .get('statuses', 'v1/admin/debug/jobs/statuses')
    .response<AdminJobStatusInfo[]>()
    .tag('admin-jobs:statuses'),
  allowedTransitions: e
    .get(
      'allowedTransitions',
      'v1/admin/debug/jobs/:id/allowed-transitions'
    )
    .params<{ id: AdminJobId }>()
    .response<AdminJobTransition[]>()
    .tag('admin-jobs:transitions'),
  reset: e
    .post('reset', 'v1/admin/debug/jobs/:id/reset')
    .params<{ id: AdminJobId }>()
    .response<void>()
    .tag('admin-jobs:reset')
    .deps(jobChanged),
  resetCodesFromL2: e
    .post(
      'resetCodesFromL2',
      'v1/admin/debug/jobs/:jobId/reset-codes-from-l2'
    )
    .params<{ jobId: AdminJobId }>()
    .response<number>()
    .tag('admin-jobs:reset-codes-from-l2')
    .deps(jobChanged),
  resetReporting: e
    .post(
      'resetReporting',
      'v1/admin/debug/jobs/:jobId/reset-reporting'
    )
    .params<{ jobId: AdminJobId }>()
    .response<ResetAdminJobReportingResult>()
    .tag('admin-jobs:reset-reporting')
    .deps(jobChanged),
  simulateCodesFromL2: e
    .post(
      'simulateCodesFromL2',
      'v1/admin/debug/jobs/:jobId/simulate-codes-from-l2'
    )
    .params<{ jobId: AdminJobId }>()
    .response<SimulateCodesFromL2Result>()
    .tag('admin-jobs:simulate-codes-from-l2')
    .deps(jobChanged),
  bulkSimulateCodesFromL2: e
    .post(
      'bulkSimulateCodesFromL2',
      'v1/admin/debug/jobs/bulk/simulate-codes-from-l2'
    )
    .body<BulkAdminJobIdsRequest>()
    .response<BulkJobOperationResult<BulkSimulateCodesFromL2ItemResult>>()
    .tag('admin-jobs:bulk-simulate-codes-from-l2')
    .deps(jobChanged),
  simulateAggregation: e
    .post(
      'simulateAggregation',
      'v1/admin/debug/jobs/:jobId/simulate-aggregation'
    )
    .params<{ jobId: AdminJobId }>()
    .response<SimulateAggregationResult>()
    .tag('admin-jobs:simulate-aggregation')
    .deps(jobChanged),
  simulateL2Aggregation: e
    .post(
      'simulateL2Aggregation',
      'v1/admin/debug/jobs/:jobId/simulate-l2-aggregation'
    )
    .params<{ jobId: AdminJobId }>()
    .response<SimulateL2AggregationResult>()
    .tag('admin-jobs:simulate-l2-aggregation')
    .deps(jobChanged),
}));
