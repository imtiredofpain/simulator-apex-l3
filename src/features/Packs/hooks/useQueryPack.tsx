import { endpoints } from "@shared/api/endpoints";
import type { PackDetailDto } from "../types";
import { apiClientInn } from "@shared/api/httpInn";
import { useQuery } from "@tanstack/react-query";

const queryFn = (id: string) =>
  endpoints.packs.byId.call<PackDetailDto>(apiClientInn, {
    params: { id },
  });

export function useQueryPack(id: string | undefined) {
  return useQuery({
    queryKey: [...endpoints.packs.list.__tags, `packs:byId:${id}`],
    queryFn: () => queryFn(id!),
    enabled: !!id,
    select: (data) => {
      return data?.data;
    },
  });
}
