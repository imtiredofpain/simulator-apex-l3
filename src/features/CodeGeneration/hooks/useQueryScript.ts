import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { ScriptDto } from '../types';

const queryFn = (id: string) =>
  endpoints.codeGeneration.scriptById.call<ScriptDto>(http, { params: { id } });

function useQueryScript(id: string | undefined) {
  return useQuery({
    queryKey: [...endpoints.codeGeneration.scriptById.__tags, `codeGeneration:scriptById:${id}`],
    queryFn: () => queryFn(id as string),
    enabled: !!id,
  });
}

export default useQueryScript;
