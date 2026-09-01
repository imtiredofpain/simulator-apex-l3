import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';
import type { TaskDto } from '../types';
import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { formatByUnit } from '@shared/lib/formatByUnit';
import type { LineDto } from '@features/Lines';
import { Badge } from '@shared/components/ui/badge';
import type { MaterialDto } from '@features/Materials';
import type { PackageDto } from '@features/Packages';
import type { EnumUnit } from "@shared/api/hooks/enums/types";
import { Checkbox } from '@shared/components/ui/checkbox';

export interface TaskRow {
  id: TaskDto["id"];
  jobNumber: TaskDto["jobNumber"];
  createdAt: TaskDto["createdAt"];
  lineId: TaskDto["lineId"];
  line?: LineDto;
  plannedStartTime: TaskDto['plannedStartTime'];
  plannedEndTime: TaskDto['plannedEndTime'];
  retryAt: TaskDto['retryAt'];
  statusStartTime?: unknown;
  type: EnumUnit;
  status: EnumUnit<{
    color: string;
  }>;
  actualStartTime?: TaskDto["actualStartTime"];
  actualEndTime?: TaskDto["actualEndTime"];
  plannedQuantity: TaskDto["plannedQuantity"];
  materialId?: TaskDto["materialId"];
  material?: MaterialDto;
  packageId?: TaskDto["packageId"];
  packages?: PackageDto;
  // plannedStartTime: "2025-12-03T04:29:02.349Z";
  // plannedEndTime: "2025-12-03T04:29:02.349Z";
  // name: TaskDto["name"];
  // controlModuleName: string;
}

const col = createColumnHelperExt<TaskRow>();

interface TaskSelectionColumnOptions {
  selectedIds: ReadonlySet<TaskRow['id']>;
  visibleIds: TaskRow['id'][];
  onSelectedIdsChange: (ids: ReadonlySet<TaskRow['id']>) => void;
}

export function createTasksColumns({
  selectedIds,
  visibleIds,
  onSelectedIdsChange,
}: TaskSelectionColumnOptions): Array<ColumnDefExt<TaskRow>> {
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const selectionColumn: ColumnDefExt<TaskRow> = {
    id: 'selection',
    header: () => (
      <Checkbox
        aria-label="Выбрать все задания"
        checked={
          allVisibleSelected
            ? true
            : selectedVisibleCount > 0
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(checked) =>
          onSelectedIdsChange(checked === true ? new Set(visibleIds) : new Set())
        }
      />
    ),
    cell: (info) => {
      const jobId = info.row.original.id;
      return (
        <Checkbox
          aria-label={`Выбрать задание ${info.row.original.jobNumber}`}
          checked={selectedIds.has(jobId)}
          onCheckedChange={(checked) => {
            const next = new Set(selectedIds);
            if (checked === true) next.add(jobId);
            else next.delete(jobId);
            onSelectedIdsChange(next);
          }}
        />
      );
    },
    meta: {
      align: 'center',
      widthPx: 44,
      sticky: 'left',
    },
  };

  return [selectionColumn, ...tasksColumns];
}

const tasksColumns: Array<ColumnDefExt<TaskRow>> = [
  col.accessor('id', {
    header: 'id',
  }) as ColumnDefExt<TaskRow, unknown>,
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
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('jobNumber', {
    header: 'Номер',
    cell: (info) => (
      <Link
        className="underline"
        to={PATHS.tasks.byId(info.row.original.id)}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('actualEndTime', {
    header: 'actualEndTime',
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('line', {
    header: 'Линия',
    cell: (info) => {
      return info.getValue()?.name ? (
        <Link
          className="underline"
          to={PATHS.lines.byId(info.row.original.lineId)}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {info.getValue()?.name}
        </Link>
      ) : (
        <Badge variant={'destructive'}>Линия не указана!</Badge>
      );
    },
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('statusStartTime', {
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
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('type', {
    header: 'Тип задания',
    cell: (info) => {
      return (
        <div title={info.row.original.type.name}>
          {info.row.original.type?.description}
        </div>
      );
    },
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('materialId', {
    header: 'Материал ID',
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('packages', {
    header: 'Пакет',
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('status', {
    header: 'status',
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('packageId', {
    header: 'Пакет ID',
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('material', {
    header: 'Материал',
    cell: (info) => {
      return !info.row.original.packageId ? (
        <Link
          to={PATHS.materials.byId(
            info.row.original.materialId?.toString() || ''
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="underline">{info.getValue()?.name}</div>
          <div className="text-xs text-muted-foreground">
            {info.getValue()?.materialNumber}
          </div>
        </Link>
      ) : info.row.original.packageId ? (
        <Link
          to={PATHS.packages.byId(
            info.row.original.packageId?.toString() || ''
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="underline">{info.row.original.packages?.name}</div>
          <div className="text-xs text-muted-foreground">
            {info.row.original.packages?.packageNumber}
          </div>
        </Link>
      ) : (
        <Badge variant={'destructive'}>Материал/Упаковка не указан!</Badge>
      );
      //
    },
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('plannedQuantity', {
    header: 'Количество',
    cell: (info) => {
      const f = formatByUnit(info.row.original.plannedQuantity, {
        type: 'number',
      });
      return <div>{f}</div>;
    },
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('lineId', {
    header: 'Линия ID',
  }) as ColumnDefExt<TaskRow, unknown>,
  col.accessor('actualStartTime', {
    header: 'actualStartTime',
  }) as ColumnDefExt<TaskRow, unknown>,
];

export { tasksColumns };
