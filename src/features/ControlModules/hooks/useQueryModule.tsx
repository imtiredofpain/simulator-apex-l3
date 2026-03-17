import { endpoints } from '@shared/api/endpoints';
import type { ControlModuleDto } from '../types';
import { useQuery } from '@tanstack/react-query';
import { apiClientInn } from '@shared/api/httpInn';

const queryFn = (id: string) =>
  endpoints.controlModules.byId.call<ControlModuleDto>(apiClientInn, {
    params: { id },
  });

function useQueryModule(id: string | undefined) {
  return useQuery({
    queryKey: [
      ...endpoints.controlModules.byId.__tags,
      `control-modules:byId:${id}`,
    ],
    queryFn: () => queryFn(id as string),
    enabled: !!id,
  });
}

export { useQueryModule };
