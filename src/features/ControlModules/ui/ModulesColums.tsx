import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';
import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import type { ControlModuleDto } from '../types';

type ModulesRow = Omit<ControlModuleDto, 'createdAt'>;

const col = createColumnHelperExt<ModulesRow>();

const modulesColumns: Array<ColumnDefExt<ModulesRow>> = [
  col.accessor('id', {
    header: 'id',
  }) as ColumnDefExt<ModulesRow, unknown>,
  col.accessor('controlModuleNumber', {
    header: 'Номер',
    cell: (info) => (
      <Link
        className="underline"
        to={PATHS.controlModules.byId(info.row.original.id)}
      >
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<ModulesRow, unknown>,
  col.accessor('name', {
    header: 'Наименование',
    meta: { sticky: 'left' },
  }) as ColumnDefExt<ModulesRow, unknown>,
  col.accessor('ipAddress', {
    header: 'IP адрес / Хост',
  }) as ColumnDefExt<ModulesRow, unknown>,
  col.accessor('port', {
    header: 'Порт',
  }) as ColumnDefExt<ModulesRow, unknown>,
];

export { modulesColumns };
