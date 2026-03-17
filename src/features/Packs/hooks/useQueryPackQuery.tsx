import { endpoints } from "@shared/api/endpoints";
import type { PackDetailDto } from "../types";
import { apiClientInn } from "@shared/api/httpInn";
import { useQuery } from "@tanstack/react-query";

const queryFn = () => endpoints.packs.list.call<PackDetailDto[]>(apiClientInn);

export function useQueryPacks() {
  return useQuery({
    queryKey: [...endpoints.packs.list.__tags],
    queryFn,
    select: (data) => {
      // Извлекаем данные из envelope
      return data?.data ?? [];
    },
  });
}
