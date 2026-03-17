import { endpoints } from '@shared/api/endpoints';
import { apiClientInn } from '@shared/api/httpInn';
import { useQuery } from '@tanstack/react-query';
import type { LogsAdvancedDto } from '../types';

const queryFn = (id: number) =>
  endpoints.apiLogs.byId.call<LogsAdvancedDto>(apiClientInn, {
    params: { id },
  });

function useQueryLog(id: number) {
  return useQuery({
    queryKey: [...endpoints.apiLogs.byId.__tags, id],
    queryFn: () => queryFn(id),
    enabled: !!id,
  });
}

export { useQueryLog };
