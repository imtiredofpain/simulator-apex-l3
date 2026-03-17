import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';
import type { LineDto } from '../types';
import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';

export interface LineRow {
  id: LineDto['id'];
  lineNumber: LineDto['lineNumber'];
  name: LineDto['name'];
  controlModuleName: string;
}

const col = createColumnHelperExt<LineRow>();

const linesColumns: Array<ColumnDefExt<LineRow>> = [
  col.accessor("id", {
    header: "id",
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("lineNumber", {
    header: "Номер",
    cell: (info) => (
      <Link className="underline" to={PATHS.lines.byId(info.row.original.id)}>
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("name", {
    header: "Наименование",
    meta: { sticky: "left" },
  }) as ColumnDefExt<LineRow, unknown>,
  col.accessor("controlModuleName", {
    header: "Наименование МУ",
  }) as ColumnDefExt<LineRow, unknown>,
];

export { linesColumns };
