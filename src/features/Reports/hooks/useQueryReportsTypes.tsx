import { endpoints } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { IReportType } from "../types";
import { apiClientInn } from "@shared/api/httpInn";

const queryFn = () =>
  endpoints.documents.listTypes.call<IReportType[]>(apiClientInn);

interface useQueryReportsTypesProps {
  disabled?: boolean;
}

export function useQueryReportsTypes(props: useQueryReportsTypesProps = {}) {
  const { disabled = false } = props;
  return useQuery({
    queryKey: [...endpoints.documents.listTypes.__tags],
    queryFn,
    enabled: !disabled,
  });
}
