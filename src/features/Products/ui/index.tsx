import { EntityList } from '@shared/components/EntityList';
import { useQueryProducts } from '../hooks/useQueryProductsSelect';

import { PATHS } from '@shared/config/pathRoute';
import { useNavigate } from 'react-router-dom';
import { productsColumns } from './productsColums';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { EnumUnit } from '@shared/api/hooks/enums/types';

function Products() {
  const navigate = useNavigate();
  const { data: { data: enumDataProduct = {} } = {} } = useEnum<EnumUnit>({
    name: 'product-groups',
  });
  const { data: { data: enumDataShelfLife = {} } = {} } = useEnum<EnumUnit>({
    name: 'shelf-life-units',
  });
  const { data, isLoading } = useQueryProducts(
    {
      productGroup: enumDataProduct,
      shelfLife: enumDataShelfLife,
    },
    true
  );

  return (
    <EntityList
      search={{
        placeholder: "Поиск по продукции...",
      }}
      title={"Каталог продукции"}
      columns={productsColumns}
      data={data || []}
      isLoading={isLoading}
      onCreate={() => navigate(PATHS.products.create)}
    />
  );
}

export { Products };
