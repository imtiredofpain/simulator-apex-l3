import { endpoints } from "@shared/api/endpoints";
import type { PackStatsDto } from "../types";
import { apiClientInn } from "@shared/api/httpInn";
import { useQuery } from "@tanstack/react-query";

const queryFn = (jobId: string) =>
  endpoints.packs.statsByJob.call<PackStatsDto>(apiClientInn, {
    params: { jobId },
  });

export function useQueryPackStats(jobId: string | undefined) {
  return useQuery({
    queryKey: [...endpoints.packs.statsByJob.__tags, `packs:stats:${jobId}`],
    queryFn: () => queryFn(jobId!),
    enabled: !!jobId,
    select: (data) => {
      return data?.data;
    },
  });
}
