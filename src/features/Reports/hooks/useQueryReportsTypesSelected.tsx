import { endpoints } from "@shared/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { IReportType } from "../types";
import { apiClientInn } from "@shared/api/httpInn";

const queryFn = () =>
  endpoints.documents.listTypes.call<IReportType[]>(apiClientInn);

interface useQueryReportsTypesProps {
  disabled?: boolean;
}

export function useQueryReportsTypesSelected(props: useQueryReportsTypesProps = {}) {
  const { disabled = false } = props;
  return useQuery({
    queryKey: [...endpoints.documents.listTypes.__tags],
    queryFn,
    refetchInterval: 4000,
    enabled: !disabled,
    select: (data) => {
      return data.data.map((reportType, i) => {
        return {
          order: i + 1,
          ...reportType,
        };
      });
    },
  });
}
