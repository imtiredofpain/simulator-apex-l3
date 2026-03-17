import useAxios from '@shared/api/hooks/useAxios';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@shared/api/endpoints';
import withTimeout from '@shared/api/withTimeout';

/**
 * Хук для получения одной линии по `id`.
 * Возвращает результат TanStack Query; `data` имеет тот же тип, что и ответ эндпоинта.
 */
function useCheckStatusDB() {
  const http = useAxios();

  const queryFn = () =>
    withTimeout(endpoints.status.checkDataBase.call(http), 5_000);

  type LineResponse = Awaited<ReturnType<typeof queryFn>>;

  return useQuery<LineResponse>({
    queryKey: [...endpoints.status.checkDataBase.__tags],
    queryFn,
    staleTime: 0,
    // Перезапрашиваем при фокусе
    refetchOnWindowFocus: true,

    // Перезапрос каждые 2 секунды
    refetchInterval: 2 * 1000,
  });
}

export default useCheckStatusDB;
