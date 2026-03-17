import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';

import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import type { MaterialDto } from '../types';

interface Row {
  id: MaterialDto['id'];
  materialNumber: MaterialDto['materialNumber'];
  name: MaterialDto['name'];
}

const col = createColumnHelperExt<Row>();

const materialsColumns: Array<ColumnDefExt<Row>> = [
  col.accessor('id', {
    header: 'id',
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('materialNumber', {
    header: 'Номер',
    cell: (info) => (
      <Link
        className="underline"
        to={PATHS.materials.byId(info.row.original.id)}
      >
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('name', {
    header: 'Наименование',
    meta: { sticky: 'left' },
  }) as ColumnDefExt<Row, unknown>,
];

export { materialsColumns };
