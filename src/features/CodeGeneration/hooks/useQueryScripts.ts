import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { ScriptDto } from '../types';

const queryFn = () => endpoints.codeGeneration.scripts.call<ScriptDto[]>(http);

export function useQueryScripts() {
  return useQuery({
    queryKey: [...endpoints.codeGeneration.scripts.__tags],
    queryFn,
  });
}
