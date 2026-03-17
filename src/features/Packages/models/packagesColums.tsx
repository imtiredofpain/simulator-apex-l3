import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';

import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import type { PackageDtoAdvanced } from '../types';

interface Row {
  id: PackageDtoAdvanced['id'];
  packageLevel: PackageDtoAdvanced['packageLevel'] | string;
  name: PackageDtoAdvanced['name'];
  product: PackageDtoAdvanced['product'];
}

const col = createColumnHelperExt<Row>();

const packagesColumns: Array<ColumnDefExt<Row>> = [
  col.accessor('id', {
    header: 'id',
    meta: {
      widthPx: 30,
    },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('packageLevel', {
    header: 'Level',
    meta: {
      widthPx: 30,
    },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('name', {
    header: 'Наименование',
    meta: {
      widthPx: 150,
    },
    cell: (info) => (
      <Link
        className="underline font-bold text-cyan-700"
        to={PATHS.packages.byId(info.row.original.id)}
      >
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<Row, unknown>,
  col.accessor('product', {
    header: 'Продукт',
    meta: { sticky: 'left', widthPx: 150 },
    cell: (info) => (
      <Link
        className="underline"
        to={PATHS.products.byId(info.row.original?.product?.id)}
      >
        {info?.getValue()?.gtin + ' | ' + info?.getValue()?.name}
      </Link>
    ),
  }) as ColumnDefExt<Row, unknown>,
];

export { packagesColumns };
