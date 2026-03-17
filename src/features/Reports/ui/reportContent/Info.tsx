import definitionReport from "@features/Reports/models/Definitions/report";
import type { IReport } from "@features/Reports/types";
import { FormGenerator } from "@mrdn/app-common";
import type { EnumsUnits } from "@shared/api/hooks/enums/types";
import { formatByUnit } from "@shared/lib/formatByUnit";
import { memo, useMemo } from "react";

interface ReportInfoProps {
  report: IReport;
  systemTypes?: EnumsUnits;
}

function ReportInfo(props: ReportInfoProps) {
  const { report, systemTypes } = props;

  const targetSystems = useMemo(() => {
    if (!systemTypes) return new Map();
    const mapTypes = new Map(Object.values(systemTypes).map((type) => [type.name, type]));
    return mapTypes;
  }, [systemTypes]);

  return (
    <div className="overflow-hidden">
      <FormGenerator
        definition={definitionReport}
        initialValues={{
          ...report,
          isCompleted: report.isCompleted ? "✅ Да" : "❌ Нет",
          isSuccess: report.isSuccess ? "✅ Да" : "❌ Нет",
          createdAt: report.createdAt
            ? formatByUnit(new Date(report.createdAt).getTime(), {
                type: "timestamp",
                format: "d FM y в h:i:s",
              }).toLowerCase()
            : undefined,
          modifiedAt: report.modifiedAt
            ? formatByUnit(new Date(report.modifiedAt).getTime(), {
                type: "timestamp",
                format: "d FM y в h:i:s",
              }).toLowerCase()
            : undefined,
          processedAt: report.processedAt
            ? formatByUnit(new Date(report.processedAt).getTime(), {
                type: "timestamp",
                format: "d FM y в h:i:s",
              }).toLowerCase()
            : undefined,
          targetSystem: report.targetSystem
            ? targetSystems.get(report.targetSystem)?.description ??
              report.targetSystem
            : "Не указано",
        }}
        engineConfig={{
          clearOnHideDefault: true,
          visibleSubmitButton: true,
          visibleCancelButton: false,
          visibleErrors: true,
        }}
      />
    </div>
  );
}

export default memo(ReportInfo);