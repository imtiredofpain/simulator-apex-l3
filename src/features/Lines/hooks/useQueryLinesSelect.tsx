import { endpoints, http } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { LineDto } from "../types";

const queryFn = () => endpoints.lines.list.call<LineDto[]>(http);

export function useQueryLinesSelect() {
  return useQuery({
    queryKey: [...endpoints.lines.list.__tags],
    queryFn,
    select: (data) => {
      return data.data.map((line) => ({
        id: line.id,
        lineNumber: line.lineNumber,
        name: line.name,
        controlModuleName:
          line.controlModule.name +
          " | " +
          line.controlModule.ipAddress +
          ":" +
          line.controlModule.port,
      }));
    },
  });
}
