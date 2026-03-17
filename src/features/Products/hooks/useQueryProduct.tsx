import { endpoints } from '@shared/api/endpoints';
import { apiClientInn } from '@shared/api/httpInn';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductDto } from '../types';
import type { EnumsUnits, EnumUnit } from '@shared/api/hooks/enums/types';
import { formatTimeUnit } from '@shared/lib/formatTimeUnit';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { ApiEnvelope } from '@shared/api/contracts';

const queryFn = (id: string) =>
  endpoints.products.byId.call<ProductDto>(apiClientInn, {
    params: { id },
  });

function useQueryProduct(id: string | undefined, isFormat = true) {
  const queryClient = useQueryClient();
  useEnum<EnumUnit>({
    name: 'product-groups',
  });
  useEnum<EnumUnit>({
    name: 'shelf-life-units',
  });

  return useQuery({
    queryKey: [...endpoints.products.byId.__tags, id],
    queryFn: () => queryFn(id as string),
    select: (data) => {
      if (!isFormat) return data;
      const enumDataProduct = queryClient.getQueryData<ApiEnvelope<EnumsUnits>>(
        ['enums:get', 'product-groups']
      )?.data;
      const enumDataShelfLife = queryClient.getQueryData<
        ApiEnvelope<EnumsUnits>
      >(['enums:get', 'shelf-life-units'])?.data;

      if (!enumDataProduct || !enumDataShelfLife || !data) return data;

      try {
        const result = {
          ...data,
          data: {
            ...data.data,
            productGroup: enumDataProduct[data.data.productGroup].description,
            shelfLifeValue: formatTimeUnit(
              data.data.shelfLifeValue,
              enumDataShelfLife[data.data.shelfLifeUnit].name
            ),
          },
        };
        return result;
      } catch (error) {
        console.error(error);
      }
    },
    enabled:
      !!id && !!queryClient.getQueryData(['enums:get', 'product-groups']),
  });
}

export { useQueryProduct };
