import { endpoints } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { IReport } from "../types";
import { apiClientInn } from "@shared/api/httpInn";

const queryFn = (documentType?: string) =>
  endpoints.documents.list.call<IReport[]>(apiClientInn, {
    query: { documentType },
  });

interface useQueryReportsProps {
  disabled?: boolean;
  documentType?: string
}

export function useQueryReports(props: useQueryReportsProps = {}) {
  const { disabled = false, documentType } = props;
  return useQuery({
    queryKey: [
      ...endpoints.documents.list.__tags,
      `documents:listTypes:${documentType}`,
    ],
    refetchInterval: 4000,
    queryFn: () => queryFn(documentType),
    enabled: !disabled,
  });
}
