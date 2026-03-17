import { endpoints, http } from '@shared/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import type { GenerateByScriptDto, GenerateResultDto } from '../types';

export function useMutationGenerate(
  callback?: (status: 'success' | 'error') => void
) {
  return useMutation({
    mutationKey: [...endpoints.codeGeneration.generate.__tags],
    mutationFn: (payload: GenerateByScriptDto) =>
      endpoints.codeGeneration.generate.call<GenerateResultDto>(http, { body: payload }),
    onSuccess: () => {
      callback?.('success');
    },
    onError: () => {
      callback?.('error');
    },
  });
}
