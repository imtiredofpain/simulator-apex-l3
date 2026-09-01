import { SimplePage } from "@shared/components/SimplePage";
import { useParams } from "react-router-dom";
import { useQueryReportById } from "../hooks/useQueryReportById";
import { ICON_BY_TYPE } from "../utils/icons";
import ReportContent from "./reportContent";
import { useQueryReportsTypes } from "../hooks/useQueryReportsTypes";
import { useMemo } from "react";
import useEnum from "@shared/api/hooks/enums/useEnum";
import type { EnumUnit } from "@shared/api/hooks/enums/types";
import { Badge } from "@shared/components/ui/badge";
import { NotFound } from "@features/Errors";
import DialogDeleteReport from "./DialogDeleteReport";

function ReportPage() {
  const { id, type } = useParams();
  const { data: { data: report } = {}, isLoading: isLoadingReports } =
    useQueryReportById({
      id
    });
  const { data: { data: types = [] } = {}, isLoading: isLoadingTypes } = useQueryReportsTypes()
  const { data: { data: actions = {} } = {}, isLoading: isLoadingActions } = useEnum<EnumUnit>({
    name: "document-action",
  });
  const { data: { data: systemTypes } = {}, isLoading: isLoadingSystemTypes } =
    useEnum<{
      name: string;
      description: string;
      color: string;
    }>({ name: "api-system-type" });

  const isLoading = isLoadingReports || isLoadingTypes || isLoadingActions || isLoadingSystemTypes;
  
  const dataType = useMemo(() => types.find((t) => t.type === type), [types, type]);

  const title = `${report?.documentDescription} / ${report?.documentNumber}`;
  const Icon = report ? ICON_BY_TYPE[report?.documentType] : undefined;

  if (!report?.id && !isLoading) {
    return <NotFound title="Отчёт не найден" />
  }

  return (
    <SimplePage
      title={
        <div className="w-full justify-between flex flex-row gap-2 items-start">
          <div className="flex flex-row gap-3 items-center">
            {!!Icon && <Icon size={24} className="text-muted-foreground" />}{" "}
            {title}
          </div>
          <div>
            <Badge className="font-semibold">{report?.status}</Badge>
          </div>
        </div>
      }
      isLoading={isLoading}
      actionComponent={report && <DialogDeleteReport report={report} />}
      contentComponent={
        <ReportContent
          type={dataType}
          report={report}
          actions={actions}
          systemTypes={systemTypes}
        />
      }
    ></SimplePage>
  );
}

export default ReportPage;
