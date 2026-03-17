import { endpoints, http } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { LineDto } from "../types";

const queryFn = () => endpoints.lines.list.call<LineDto[]>(http);

export function useQueryLines() {
  return useQuery({
    queryKey: [...endpoints.lines.list.__tags],
    queryFn,
  });
}
