import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';
import type { LogsDto } from '../types';
import { Badge } from '@shared/components/ui/badge';
import { formatByUnit } from '@shared/lib/formatByUnit';
import { Progress } from '@shared/components/ui/progress';

type Row = LogsDto;

const col = createColumnHelperExt<Row>();
interface LogsColumnsProps {
  setCurrentId: (id: number | null) => void;
  setOpen: (open: boolean) => void;
}

const logsColumns = ({
  setCurrentId,
  setOpen,
}: LogsColumnsProps): Array<ColumnDefExt<Row>> => [
  col.accessor('id', {
    header: 'id',
    meta: {
      widthPx: 30,
    },
    cell: (ctx) => {
      const message = ctx.getValue();
      return (
        <div className="text-xs leading-snug ">
          <span className="break-all whitespace-normal line-clamp-2">
            {message}
          </span>
        </div>
      );
    },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('statusCode', {
    header: 'Код',
    meta: {
      widthPx: 50,
    },
    cell: (ctx) => {
      let message = ctx.getValue();
      if (!message) message = 504;
      return (
        <div className="text-xs leading-snug flex justify-center items-center">
          {message && (
            <Badge
              className="mr-2 break-all whitespace-normal line-clamp-2 w-fit"
              variant={
                message >= 200 && message <= 299 ? 'success' : 'destructive'
              }
            >
              {message}
            </Badge>
          )}
        </div>
      );
    },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('startedAtUtc', {
    header: 'Время запроса',
    meta: {
      widthPx: 250,
    },
    cell: (ctx) => {
      const message = ctx.getValue();
      const date = new Date(message).getTime();
      return (
        <div className="text-xs leading-snug ">
          <span className="break-all whitespace-normal line-clamp-2">
            {formatByUnit(date, {
              type: 'timestamp',
            })}
          </span>
        </div>
      );
    },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('durationMs', {
    header: 'Время ответа',
    meta: {
      widthPx: 150,
    },
    cell: (info) => {
      const value = info.getValue() // МС
      const maxMS = 5000 // 5 сек
      const percent = (value / maxMS) * 100

      return (
        <div className="text-xs leading-snug ">
          <span className="break-all whitespace-normal line-clamp-2 font-semibold">
            {value / 1000} сек
          </span>
          <Progress value={percent} className="h-1" interpolated="inverse" />
        </div>
      );
    },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('httpMethod', {
    header: 'Метод',
    meta: {
      widthPx: 50,
    },
    cell: (ctx) => {
      const message = ctx.getValue();
      return (
        <div className="text-xs leading-snug ">
          <span className="break-all whitespace-normal line-clamp-2">
            {message}
          </span>
        </div>
      );
    },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('url', {
    header: 'URL',
    meta: {
      widthPx: 2550,
    },
    cell: (ctx) => {
      const message = ctx.getValue();
      return (
        <div className="text-xs leading-snug ">
          <span
            className="break-all whitespace-normal line-clamp-2 cursor-pointer"
            onClick={() => {
              setCurrentId(ctx.row.original.id);
              setOpen(true);
            }}
          >
            {message}
          </span>
        </div>
      );
    },
  }) as ColumnDefExt<Row, unknown>,
];

export { logsColumns };
