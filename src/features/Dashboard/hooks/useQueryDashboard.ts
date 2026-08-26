import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { DashboardDto } from '../types';

const queryFn = () => endpoints.dashboard.system.call<DashboardDto>(http);

export function useQueryDashboard() {
  return useQuery({
    queryKey: [...endpoints.dashboard.system.__tags],
    queryFn,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });
}
