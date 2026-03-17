import { endpoints } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { IReport } from "../types";
import { apiClientInn } from "@shared/api/httpInn";

const queryFn = (id?: string) =>
  endpoints.documents.byId.call<IReport>(apiClientInn, {
    params: { id: `$${id}` },
  });

interface useQueryReportsProps {
  disabled?: boolean;
  id?: IReport["id"];
}

export function useQueryReportById(props: useQueryReportsProps = {}) {
  const { disabled = false, id } = props;
  return useQuery({
    queryKey: [...endpoints.documents.byId.__tags, `documents:byId:${id}`],
    queryFn: () => queryFn(id),
    refetchInterval: 5000,
    enabled: !disabled && !!id,
  });
}
