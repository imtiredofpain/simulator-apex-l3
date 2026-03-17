import { columnsReportTypes } from "../models/ColumnsListReportTypes";
import { EntityList } from "@shared/components/EntityList";
import { useQueryReportsTypesSelected } from "../hooks/useQueryReportsTypesSelected";
import { memo } from "react";
import { toast } from "sonner";

export function ListReports() {
  const { data, isLoading } = useQueryReportsTypesSelected();
  if (!data) return null;

  return (
    <EntityList
      search={{
        placeholder: "Поиск по отчётам...",
      }}
      title={"Отчёты"}
      data={data}
      columns={columnsReportTypes}
      isLoading={isLoading}
      onCreate={() => {
        toast.error("Недоступно");
      }}
      hiddenCreate
      hiddenColumns={{
        type: false,
      }}
    />
  );
}

export default memo(ListReports);