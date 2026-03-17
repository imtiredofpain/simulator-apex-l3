import { endpoints } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { IReport } from "../types";
import { apiClientInn } from "@shared/api/httpInn";

const queryFn = (documentType?: string) =>
  endpoints.documents.list.call<IReport[]>(apiClientInn, {
    query: { documentType },
  });

interface useQueryReportsSelectedProps {
  disabled?: boolean;
  documentType?: string;
}

export function useQueryReportsSelected(props: useQueryReportsSelectedProps = {}) {
  const { disabled = false, documentType } = props;
  return useQuery({
    queryKey: [
      ...endpoints.documents.list.__tags,
      `documents:listTypes:${documentType}`,
    ],
    queryFn: () => queryFn(documentType),
    enabled: !disabled,
    select: (data) => data.data,
  });
}
