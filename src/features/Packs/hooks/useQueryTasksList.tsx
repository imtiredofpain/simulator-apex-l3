import { endpoints } from "@shared/api/endpoints";
import type { TaskDto } from "@features/Tasks/types";
import { apiClientInn } from "@shared/api/httpInn";
import { useQuery } from "@tanstack/react-query";

const queryFn = () => endpoints.tasks.list.call<TaskDto[]>(apiClientInn);

export function useQueryTasksList() {
  return useQuery({
    queryKey: [...endpoints.tasks.list.__tags],
    queryFn,
    select: (data) => {
      return data?.data ?? [];
    },
  });
}
