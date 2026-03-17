import { endpoints, http } from '@shared/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import type { TaskDto } from '../types';
const queryFn = (id: TaskDto['id']) =>
  endpoints.tasks.delete.call<TaskDto>(http, { params: { id } });
function useMutationDeleteTask(
  id: TaskDto['id'],
  callback?: (status: 'success' | 'error') => void
) {
  return useMutation({
    mutationKey: [...endpoints.tasks.delete.__tags, `tasks:byId:${id}`],
    mutationFn: () => queryFn(id),
    onSuccess: () => {
      callback?.('success');
    },
    onError: () => {
      callback?.('error');
    },
  });
}

export { useMutationDeleteTask };
