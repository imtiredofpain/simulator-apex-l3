import { endpoints } from '@shared/api/endpoints';
import type { ControlModuleDto } from '../types';
import { useQuery } from '@tanstack/react-query';
import { apiClientInn } from '@shared/api/httpInn';

const queryFn = () =>
  endpoints.controlModules.list.call<ControlModuleDto[]>(apiClientInn);

function useQueryModuleList() {
  return useQuery({
    queryKey: [...endpoints.controlModules.list.__tags],
    queryFn,
  });
}

export { useQueryModuleList };
