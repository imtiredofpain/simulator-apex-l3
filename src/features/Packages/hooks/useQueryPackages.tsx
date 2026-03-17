import { endpoints } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { PackageDto } from "../types";
import { apiClientInn } from "@shared/api/httpInn";

const queryFn = () => endpoints.packages.list.call<PackageDto[]>(apiClientInn);

export function useQueryPackages() {
  return useQuery({
    queryKey: [...endpoints.packages.list.__tags],
    queryFn,
  });
}
