import { createColumnHelperExt, type ColumnDefExt } from '@mrdn/app-common';

import { Link } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import type { ProductDto } from '../types';

interface Row {
  id: ProductDto['id'];
  productGroup: ProductDto['productGroup'] | string;
  name: ProductDto['name'];
  gtin: ProductDto['gtin'];
  shelfLifeValue: ProductDto['shelfLifeValue'] | string;
}

const col = createColumnHelperExt<Row>();

const productsColumns: Array<ColumnDefExt<Row>> = [
  col.accessor("id", {
    header: "id",
  }) as ColumnDefExt<Row, unknown>,
  col.accessor("productGroup", {
    header: "ТГ",
  }) as ColumnDefExt<Row, unknown>,
  col.accessor("gtin", {
    header: "gtin",
    cell: (info) => (
      <Link
        className="underline"
        to={PATHS.products.byId(info.row.original.id)}
      >
        {info.getValue()}
      </Link>
    ),
  }) as ColumnDefExt<Row, unknown>,
  col.accessor("name", {
    header: "Наименование",
    meta: { sticky: "left" },
  }) as ColumnDefExt<Row, unknown>,
  col.accessor("shelfLifeValue", {
    header: "Срок годности",
  }) as ColumnDefExt<Row, unknown>,
];

export { productsColumns };
