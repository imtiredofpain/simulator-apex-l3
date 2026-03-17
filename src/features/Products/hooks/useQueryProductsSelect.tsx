import { endpoints } from '@shared/api/endpoints';
import { apiClientInn } from '@shared/api/httpInn';
import { useQuery } from '@tanstack/react-query';
import type { ProductDto } from '../types';
import type { EnumsUnits } from '@shared/api/hooks/enums/types';
import { formatTimeUnit } from '@shared/lib/formatTimeUnit';

const queryFn = () => endpoints.products.list.call<ProductDto[]>(apiClientInn);

function useQueryProducts(
  enums: { productGroup: EnumsUnits; shelfLife: EnumsUnits },
  isHumanFormat: boolean = true
) {
  return useQuery({
    queryKey: [...endpoints.products.list.__tags],
    queryFn,
    refetchInterval: 4000,
    select: (data) => {
      if (!isHumanFormat || !enums) return data.data;
      return data.data.map((product: ProductDto) => ({
        ...product,
        productGroup: enums.productGroup[product.productGroup]?.name,
        shelfLifeValue: formatTimeUnit(
          product.shelfLifeValue,
          enums.shelfLife[product.shelfLifeUnit]?.name
        ),
      }));
    },
    enabled: !!enums,
  });
}

export { useQueryProducts };
