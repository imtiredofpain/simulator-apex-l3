import { endpoints, http } from '@shared/api/endpoints';
import type { PackageDtoAdvanced } from '../types';
import { apiClientInn } from '@shared/api/httpInn';
import { useQueries, useQuery } from '@tanstack/react-query';
import type { EnumsUnits } from '@shared/api/hooks/enums/types';
import { useMemo } from 'react';

const queryFn = (id: string) =>
  endpoints.packages.byId.call<PackageDtoAdvanced>(apiClientInn, {
    params: { id },
  });

function useQueryPackage(id: string | undefined) {
  // 1. Получаем все енумы через useEnum
  const [levelQuery, groupsQuery, barcodeQuery, emissionQuery] = useQueries({
    queries: [
      {
        queryFn: () =>
          endpoints.enums.get.call<EnumsUnits>(http, {
            params: { name: 'package-levels' },
          }),
        queryKey: [...endpoints.enums.get.__tags, 'package-levels'],
      },
      {
        queryFn: () =>
          endpoints.enums.get.call<EnumsUnits>(http, {
            params: { name: 'product-groups' },
          }),
        queryKey: [...endpoints.enums.get.__tags, 'product-groups'],
      },
      {
        queryFn: () =>
          endpoints.enums.get.call<EnumsUnits>(http, {
            params: { name: 'barcode-template' },
          }),
        queryKey: [...endpoints.enums.get.__tags, 'barcode-template'],
      },
      {
        queryFn: () =>
          endpoints.enums.get.call<EnumsUnits>(http, {
            params: { name: 'emission-method' },
          }),
        queryKey: [...endpoints.enums.get.__tags, 'emission-method'],
      },
    ],
  });

  const packageQuery = useQuery({
    queryKey: [...endpoints.packages.list.__tags, `packages:byId:${id}`],
    queryFn: () => queryFn(id!),
    enabled:
      !!id &&
      levelQuery.isSuccess &&
      groupsQuery.isSuccess &&
      barcodeQuery.isSuccess &&
      emissionQuery.isSuccess,
  });

  const data = useMemo(() => {
    const pkg = packageQuery.data?.data;
    if (!pkg) return undefined;

    const level = levelQuery.data?.data;
    const groups = groupsQuery.data?.data;
    const barcode = barcodeQuery.data?.data;
    const emission = emissionQuery.data?.data;

    if (!level || !groups || !barcode || !emission) return undefined;

    return {
      ...pkg,
      packageLevel: `${
        level[pkg.packageLevel]?.description ?? pkg.packageLevel
      } (${level[pkg.packageLevel]?.name ?? ''})`,
      emissionMethod: emission[pkg.emissionMethod]?.name ?? pkg.emissionMethod,
      barcodeTemplate: `${barcode[pkg.barcodeTemplate]?.description ?? ''} (${
        barcode[pkg.barcodeTemplate]?.name ?? ''
      })`.trim(),
      product: {
        ...pkg.product,
        productGroup:
          groups[pkg.product.productGroup]?.name ?? pkg.product.productGroup,
      },
    };
  }, [
    packageQuery.data,
    levelQuery.data,
    groupsQuery.data,
    barcodeQuery.data,
    emissionQuery.data,
  ]);

  return {
    ...packageQuery,
    data,
    isLoading:
      packageQuery.isLoading ||
      levelQuery.isLoading ||
      groupsQuery.isLoading ||
      barcodeQuery.isLoading ||
      emissionQuery.isLoading,
    error:
      packageQuery.error ||
      levelQuery.error ||
      groupsQuery.error ||
      barcodeQuery.error ||
      emissionQuery.error,
  };
}

export { useQueryPackage };
