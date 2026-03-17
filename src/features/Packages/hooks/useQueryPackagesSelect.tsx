import { endpoints } from '@shared/api/endpoints';
import type { PackageDtoAdvanced } from '../types';
import { apiClientInn } from '@shared/api/httpInn';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { EnumsUnits, EnumUnit } from '@shared/api/hooks/enums/types';
import type { ApiEnvelope } from '@shared/api/contracts';

const queryFn = () =>
  endpoints.packages.list.call<PackageDtoAdvanced[]>(apiClientInn);
function useQueryPackagesSelect() {
  const queryClient = useQueryClient();
  useEnum<EnumUnit>({
    name: 'package-levels',
  });
  return useQuery({
    queryKey: [...endpoints.packages.list.__tags],
    queryFn,
    select: (data) => {
      const enumDataLevel = queryClient.getQueryData<ApiEnvelope<EnumsUnits>>([
        'enums:get',
        'package-levels',
      ])?.data;

      if (!enumDataLevel) return;
      const result = data.data.map((product: PackageDtoAdvanced) => ({
        ...product,
        packageLevel: enumDataLevel[product.packageLevel].name,
      }));
      return result;
    },
  });
}

export { useQueryPackagesSelect };
