import { endpoints } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { MaterialDto } from "../types";
import { apiClientInn } from "@shared/api/httpInn";

const queryFn = () =>
  endpoints.materials.list.call<MaterialDto[]>(apiClientInn);

export function useQueryMaterials() {
  return useQuery({
    queryKey: [...endpoints.materials.list.__tags],
    queryFn,
  });
}
