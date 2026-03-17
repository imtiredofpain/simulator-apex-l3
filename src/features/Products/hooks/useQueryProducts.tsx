import { endpoints } from '@shared/api/endpoints';
import { apiClientInn } from '@shared/api/httpInn';
import { useQuery } from '@tanstack/react-query';
import type { ProductDto } from '../types';

const queryFn = () => endpoints.products.list.call<ProductDto[]>(apiClientInn);

function useQueryProducts() {
  return useQuery({
    queryKey: [...endpoints.products.list.__tags],
    queryFn,
  });
}

export { useQueryProducts };
