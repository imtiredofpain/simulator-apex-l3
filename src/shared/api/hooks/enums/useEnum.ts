import { useQuery } from '@tanstack/react-query';
import { endpoints, http } from '@shared/api/endpoints';

function useEnum<T>({ name }: { name: string }) {
  const queryFn = () =>
    endpoints.enums.get.call<Record<string, T>>(http, {
      params: { name },
    });
  type EnumsResponse = Awaited<ReturnType<typeof queryFn>>;

  const query = useQuery<EnumsResponse>({
    queryKey: [...endpoints.enums.get.__tags, name],
    queryFn,
    staleTime: 60000,
  });

  return query;
}

export default useEnum;
