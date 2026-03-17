import { createColumnHelperExt, type ColumnDefExt } from "@mrdn/app-common";
import type { IReportType } from "../types";
import { Link } from "react-router-dom";
import { PATHS } from "@shared/config/pathRoute";

export interface LineRow {
  order: number;
  type: IReportType["type"];
  description: IReportType["description"];
}

const col = createColumnHelperExt<LineRow>();

const columnsReportTypes: Array<ColumnDefExt<LineRow>> = [
  col.accessor("order", {
    header: "№",
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("type", {
    header: "Тип отчёта",
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("description", {
    header: "Наименование",
    meta: { sticky: "left" },
    cell: (info) => {
      return (
        <Link
          className="underline"
          to={PATHS.reports.byType(info.row.original.type)}
        >
          {info.getValue()}
        </Link>
      );
    },
  }) as ColumnDefExt<LineRow, unknown>,
];

export { columnsReportTypes };
