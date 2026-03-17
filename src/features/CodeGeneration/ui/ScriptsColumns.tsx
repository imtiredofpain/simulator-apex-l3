import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';
import type { ScriptDto } from '../types';
import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { Badge } from '@shared/components/ui/badge';

export interface ScriptRow {
  id: ScriptDto['id'];
  name: ScriptDto['name'];
  description: ScriptDto['description'];
  version: ScriptDto['version'];
  isActive: ScriptDto['isActive'];
}

const col = createColumnHelperExt<ScriptRow>();

export const scriptsColumns: Array<ColumnDefExt<ScriptRow>> = [
  col.accessor('id', {
    header: 'ID',
  }) as ColumnDefExt<ScriptRow, unknown>,
  col.accessor('name', {
    header: 'Название',
    cell: (info) => (
      <Link className="underline" to={PATHS.codeGeneration.byId(info.row.original.id)}>
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<ScriptRow, unknown>,
  col.accessor('description', {
    header: 'Описание',
    cell: (info) => info.getValue() || '—',
  }) as ColumnDefExt<ScriptRow, unknown>,
  col.accessor('version', {
    header: 'Версия',
  }) as ColumnDefExt<ScriptRow, unknown>,
  col.accessor('isActive', {
    header: 'Статус',
    cell: (info) => (
      <Badge variant={info.getValue() ? 'default' : 'secondary'}>
        {info.getValue() ? 'Активен' : 'Неактивен'}
      </Badge>
    ),
  }) as ColumnDefExt<ScriptRow, unknown>,
];
