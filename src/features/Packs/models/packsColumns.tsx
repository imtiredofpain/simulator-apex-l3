import type { PackDto } from "../types";
import { createColumnHelperExt, type ColumnDefExt } from "@mrdn/app-common";
import { Link } from "react-router-dom";
import { PATHS } from "@shared/config/pathRoute";
import type { EnumUnit } from "@shared/api/hooks/enums/types";
import { formatByUnit } from '@shared/lib/formatByUnit';
import { Badge } from '@shared/components/ui/badge';
import type { TaskDto } from "@features/Tasks/types";

interface PackRow {
  id: PackDto["id"];
  level: EnumUnit;
  status: EnumUnit<{
    color: string;
  }>;
  reservedForJobId: PackDto["reservedForJobId"];
  task?: TaskDto;
  createdAt: PackDto["createdAt"];
}



const col = createColumnHelperExt<PackRow>();

const packsColumns: Array<ColumnDefExt<PackRow>> = [
  col.accessor("id", {
    header: "ID",
    // meta: {
    //   widthPx: 80,
    // },
    cell: (info) => (
      <Link
        className="underline font-bold text-cyan-700"
        to={PATHS.packs.byId(info.row.original.id)}
      >
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<PackRow, unknown>,
  col.accessor('level', {
    header: 'Уровень упаковки',
    cell: (info) => {
      return (
        <div title={info.row.original.level.name}>
          {info.row.original.level?.description}
        </div>
      );
    },
  }) as ColumnDefExt<PackRow, unknown>,
  col.accessor('status', {
    header: 'Статус',
    cell: (info) => {
      return (
        <div className="flex flex-col flex-wrap gap-1">
          <Badge
            className="w-fit"
            variant={"default"}
            style={{
              backgroundColor: `#${info.row.original.status.color}36`,
              color: `#${info.row.original.status.color}`,
            }}
          >
            {info.row.original.status.description}
          </Badge>
        </div>
      );
    },
  }) as ColumnDefExt<PackRow, unknown>,
  col.accessor('task', {
    header: 'Резервация задания',
    cell: (info) => {
      return info.row.original.reservedForJobId ? (
        <Link to={PATHS.tasks.byId(info.row.original.reservedForJobId.toString())}>
          <div className="underline">
            {info.getValue()?.jobNumber}
          </div>
        </Link>
      ) : (
        <Badge variant={'destructive'}>
          Материал/Упаковка не указан!
        </Badge>
      );
    },
  }) as ColumnDefExt<PackRow, unknown>,

  // col.accessor('task', {
  //   header: 'Резервация задания',
  //   cell: (info) => {
  //     const task = info.getValue();
  //     const reservedForJobId = info.row.original.reservedForJobId;

  //     console.log("a",task, reservedForJobId)
  
  //     if (!reservedForJobId) {
  //       return (
  //         <Badge variant={'destructive'}>
  //           Материал/Упаковка не указан!
  //         </Badge>
  //       );
  //     }
  
  //     return (
  //       <Link to={PATHS.tasks.byId(reservedForJobId.toString())}>
  //         <div className="underline">{task.jobNumber}</div>
  //       </Link>
  //     );
  //   },
  // }) as ColumnDefExt<PackRow, unknown>,
  col.accessor('createdAt', {
    header: 'Дата и время создания',
    cell: (info) => {
      const d = new Date(info.row.original.createdAt);
      return (
        <div>
          {formatByUnit(d.getTime(), {
            type: 'timestamp',
            format: 'd.m.y h:i:s',
          })}
        </div>
      );
    },
  }) as ColumnDefExt<PackRow, unknown>,
  // col.accessor("status", {
  //   header: "Уровень упаковки",
  //   meta: {
  //     widthPx: 200,
  //   },
  // }) as ColumnDefExt<PackRow, unknown>,
  // col.accessor('status', {
  //   header: 'status',
  // }) as ColumnDefExt<PackRow, unknown>,
];

export { packsColumns };
// id: number;
// level: string;
// status: string;
// reservedJobId : number | null;
// createdAt: string;