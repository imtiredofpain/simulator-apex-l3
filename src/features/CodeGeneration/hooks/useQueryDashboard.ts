import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { DashboardDto } from '../types';

const queryFn = () => endpoints.codeGeneration.dashboard.call<DashboardDto>(http);

export function useQueryDashboard() {
  return useQuery({
    queryKey: [...endpoints.codeGeneration.dashboard.__tags],
    queryFn,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });
}
