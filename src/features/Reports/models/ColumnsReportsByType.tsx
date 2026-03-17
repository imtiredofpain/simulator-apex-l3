import { createColumnHelperExt, type ColumnDefExt } from "@mrdn/app-common";
import type { IReport } from "../types";
import { formatByUnit } from "@shared/lib/formatByUnit";
import { Link } from "react-router-dom";
import { PATHS } from "@shared/config/pathRoute";
import { Badge } from "@shared/components/ui/badge";

export interface LineRow {
  id: IReport["id"];
  documentType: IReport["documentType"];
  documentNumber: IReport["documentNumber"];
  status: IReport["status"];
  createdAt: IReport["createdAt"];
  targetSystem: IReport["targetSystem"];
  type?: {
    name: string;
    description: string;
    color: string;
  };
}

const col = createColumnHelperExt<LineRow>();

const columnsReportsByType: Array<ColumnDefExt<LineRow>> = [
  col.accessor("id", {
    header: "id",
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("documentNumber", {
    header: "Номер",
    cell: (info) => {
      return (
        <Link
          className="underline"
          to={PATHS.reports.byId(info.row.original.documentType, info.row.original.id)}
        >
          {info.getValue()}
        </Link>
      );
    },
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("status", {
    header: "Статус",
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("createdAt", {
    header: "Дата создания",
    cell: (info) => {
      const date = new Date(info.getValue());
      return formatByUnit(date.getTime(), {
        type: "timestamp",
        format: "d.m.y в h:i:s",
      });
    },
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("targetSystem", {
    header: "Целевая система",
    cell: (info) => {
      return <Badge style={{
        backgroundColor: `#${info.row.original.type?.color}36`,
        color: `#${info.row.original.type?.color}`
      }}>{info.row.original.type?.description}</Badge>
    }
  }) as ColumnDefExt<LineRow, unknown>,
];

export { columnsReportsByType };
