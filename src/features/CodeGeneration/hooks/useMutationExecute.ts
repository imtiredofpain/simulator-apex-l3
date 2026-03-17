import { endpoints, http } from '@shared/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import type { GenerateExecuteDto, GenerateResultDto } from '../types';

export function useMutationExecute(
  callback?: (status: 'success' | 'error') => void
) {
  return useMutation({
    mutationKey: ['codeGeneration:execute'],
    mutationFn: (payload: GenerateExecuteDto) =>
      endpoints.codeGeneration.execute.call<GenerateResultDto>(http, { body: payload }),
    onSuccess: () => {
      callback?.('success');
    },
    onError: () => {
      callback?.('error');
    },
  });
}
