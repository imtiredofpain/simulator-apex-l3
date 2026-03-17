import { columnsReportsByType } from "../models/ColumnsReportsByType";
import { EntityList } from "@shared/components/EntityList";
import { useQueryReports } from "../hooks/useQueryReports";
import { memo, useMemo } from "react";
import { useParams } from "react-router-dom";
import useEnum from "@shared/api/hooks/enums/useEnum";
import { useQueryReportsTypes } from "../hooks/useQueryReportsTypes";
import NoDataPreloader from "@shared/components/SimpleTable/NoDataPreloader";
import { FileXCorner } from "lucide-react";
import { ICON_BY_TYPE } from "../utils/icons";
import { NotFound } from "@features/Errors";

export function ListReportsByType() {
  const { type } = useParams();
  const { data: { data: types = [] } = {}, isLoading: isLoadingTypes } = useQueryReportsTypes()
  const { data: { data: reports } = {}, isLoading: isLoadingReports } = useQueryReports({
    documentType: type,
  });
  const {
    data: { data: systemTypes } = {},
    isLoading: isLoadingSystemTypes
  } = useEnum<{
    name: string; 
    description: string;
    color: string;
  }>({ name: "api-system-type" });

  const data = useMemo(() => {
    if (!reports || !systemTypes) return [];
    const mapTypes = new Map(Object.values(systemTypes).map((type) => [type.name, type]));
    return reports.map((r) => {
      return {
        ...r,
        type: mapTypes.get(r.targetSystem),
      }
    })
  }, [reports, systemTypes]);

  const typeName = useMemo(
    () => (types.find((t) => t.type === type)?.description) ?? type ?? "Отчёт по типу",
    [types, type]
  );

  if (!data) return null;

  const isLoading = isLoadingReports || isLoadingSystemTypes || isLoadingTypes;

  const Icon = type ? ICON_BY_TYPE[type] : undefined;

  const hasTypeInTypes = !!types.find((t) => t.type === type);

  if (!hasTypeInTypes && !isLoading) {
   return <NotFound title={`Отчет по типу "${typeName}" не найден!`} />;
  }

  return (
    <EntityList
      search={{
        placeholder: "Поиск по отчету...",
      }}
      title={
        <div className="flex flex-row gap-3 items-center">
          {!!Icon && <Icon size={24} className="text-muted-foreground" />}{" "}
          {typeName}
        </div>
      }
      data={data}
      columns={columnsReportsByType}
      isLoading={isLoading}
      renderEmpty={
        <NoDataPreloader
          icon={FileXCorner}
          classNameIcon="text-red-500"
          title="Отчеты не найдены!"
          description="Пожалуйста подождите, система еще не сформировала отчёт!"
        />
      }
      hiddenCreate
    />
  );
}

export default memo(ListReportsByType);
