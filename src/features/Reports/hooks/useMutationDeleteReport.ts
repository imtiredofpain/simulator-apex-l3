import { endpoints, http } from '@shared/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import type { IReport } from '../types';

const deleteReport = (id: IReport['id']) =>
  endpoints.documents.remove.call<void>(http, { params: { id } });

export function useMutationDeleteReport() {
  return useMutation({
    mutationKey: [...endpoints.documents.remove.__tags],
    mutationFn: deleteReport,
  });
}
