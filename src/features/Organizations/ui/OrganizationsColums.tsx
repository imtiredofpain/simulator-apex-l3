import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';
import type { OrganizationsDto } from '../types';
import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';

interface Row {
  id: OrganizationsDto['id'];
  inn: OrganizationsDto['inn'];
  name: OrganizationsDto['name'];
  gln: OrganizationsDto['gln'];
}

const col = createColumnHelperExt<Row>();

const organizationsColumns: Array<ColumnDefExt<Row>> = [
  col.accessor('id', {
    header: 'id',
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('name', {
    header: 'Наименование',
    meta: { sticky: 'left' },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('inn', {
    header: 'ИНН',
    cell: (info) => (
      <Link
        className="underline"
        to={PATHS.organizations.byId(info.row.original.id)}
      >
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('gln', {
    header: 'GLN',
  }) as ColumnDefExt<Row, unknown>,
];

export { organizationsColumns };
