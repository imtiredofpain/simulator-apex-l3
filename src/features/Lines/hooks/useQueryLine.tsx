import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { LineDto } from '../types';
const queryFn = (id: string) =>
  endpoints.lines.byId.call<LineDto>(http, { params: { id } });

function useQueryLine(id: string | undefined) {
  return useQuery({
    queryKey: [...endpoints.lines.byId.__tags, `lines:byId:${id}`],
    queryFn: () => queryFn(id as string),
    enabled: !!id,
  });
}

export default useQueryLine;
