import { useMutation, useQuery } from '@tanstack/react-query';
import { endpoints } from '@shared/api/endpoints';
import { adminJobsApi } from './api';
import type {
  AdminJobId,
  AdminJobFilterRequest,
  AdminJobStatus,
  BulkAdminJobIdsRequest,
  BulkForceAdminJobStatusRequest,
  CreateAdminJobFromTemplateRequest,
  CreateAutoJobScheduleRequest,
  ExecuteAdminJobActionRequest,
  ForceAdminJobStatusRequest,
} from './types';

export function useAdminJobs(filter: AdminJobFilterRequest = {}) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.list.__tags, filter],
    queryFn: () => adminJobsApi.getAll(filter),
  });
}

export function useAdminJob(id?: AdminJobId) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.byId.__tags, id],
    queryFn: () => adminJobsApi.getById(id as AdminJobId),
    enabled: id !== undefined,
  });
}

export function useDeletedAdminJobs(enabled = true) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.deleted.__tags],
    queryFn: adminJobsApi.getDeleted,
    enabled,
  });
}

export function useAdminJobTemplates(enabled = true) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.templates.__tags],
    queryFn: adminJobsApi.getTemplates,
    enabled,
  });
}

export function useAdminJobOrganizations(enabled = true) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.organizations.__tags],
    queryFn: adminJobsApi.getOrganizations,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminJobMaterials(enabled = true) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.materials.__tags],
    queryFn: adminJobsApi.getMaterials,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAutoJobSchedules(enabled = true) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.autoCreation.__tags],
    queryFn: adminJobsApi.getAutoCreation,
    enabled,
  });
}

export function useAdminJobStatuses(enabled = true) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.statuses.__tags],
    queryFn: adminJobsApi.getStatuses,
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useAdminJobTransitions(id?: AdminJobId) {
  return useQuery({
    queryKey: [...endpoints.adminJobs.allowedTransitions.__tags, id],
    queryFn: () => adminJobsApi.getAllowedTransitions(id as AdminJobId),
    enabled: id !== undefined,
  });
}

export function useRemoveAdminJob() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.remove.__tags],
    mutationFn: adminJobsApi.remove,
  });
}

export function useExecuteAdminJobAction() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.executeAction.__tags],
    mutationFn: ({
      id,
      body,
    }: {
      id: AdminJobId;
      body: ExecuteAdminJobActionRequest;
    }) => adminJobsApi.executeAction(id, body),
  });
}

export function useRetryAdminJob() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.retry.__tags],
    mutationFn: adminJobsApi.retry,
  });
}

export function useBulkRetryAdminJobs() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.bulkRetry.__tags],
    mutationFn: (filterByStatus?: AdminJobStatus) =>
      adminJobsApi.bulkRetry(filterByStatus),
  });
}

export function useForceAdminJobStatus() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.forceStatus.__tags],
    mutationFn: ({
      id,
      body,
    }: {
      id: AdminJobId;
      body: ForceAdminJobStatusRequest;
    }) => adminJobsApi.forceStatus(id, body),
  });
}

export function useBulkForceAdminJobStatus() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.bulkForceStatus.__tags],
    mutationFn: (body: BulkForceAdminJobStatusRequest) =>
      adminJobsApi.bulkForceStatus(body),
  });
}

export function useBulkRemoveAdminJobs() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.bulkRemove.__tags],
    mutationFn: (body: BulkAdminJobIdsRequest) =>
      adminJobsApi.bulkRemove(body),
  });
}

export function useCreateAdminJobFromTemplate() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.createFromTemplate.__tags],
    mutationFn: (body: CreateAdminJobFromTemplateRequest) =>
      adminJobsApi.createFromTemplate(body),
  });
}

export function useCreateAutoJobSchedule() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.createAutoCreation.__tags],
    mutationFn: (body: CreateAutoJobScheduleRequest) =>
      adminJobsApi.createAutoCreation(body),
  });
}

export function useDeleteAutoJobSchedule() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.deleteAutoCreation.__tags],
    mutationFn: adminJobsApi.deleteAutoCreation,
  });
}

export function useResetAdminJob() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.reset.__tags],
    mutationFn: adminJobsApi.reset,
  });
}

export function useResetAdminJobCodesFromL2() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.resetCodesFromL2.__tags],
    mutationFn: adminJobsApi.resetCodesFromL2,
  });
}

export function useResetAdminJobReporting() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.resetReporting.__tags],
    mutationFn: adminJobsApi.resetReporting,
  });
}

export function useSimulateAdminJobCodesFromL2() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.simulateCodesFromL2.__tags],
    mutationFn: adminJobsApi.simulateCodesFromL2,
  });
}

export function useBulkSimulateAdminJobCodesFromL2() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.bulkSimulateCodesFromL2.__tags],
    mutationFn: (body: BulkAdminJobIdsRequest) =>
      adminJobsApi.bulkSimulateCodesFromL2(body),
  });
}

export function useSimulateAdminJobAggregation() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.simulateAggregation.__tags],
    mutationFn: adminJobsApi.simulateAggregation,
  });
}

export function useSimulateAdminJobL2Aggregation() {
  return useMutation({
    mutationKey: [...endpoints.adminJobs.simulateL2Aggregation.__tags],
    mutationFn: adminJobsApi.simulateL2Aggregation,
  });
}
