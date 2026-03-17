import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import useAxios from '@shared/api/hooks/useAxios';
import { endpoints } from '@shared/api/endpoints';
import type { IUser } from '@shared/types/users';

/**
 * Статус получения текущего пользователя.
 * - `"ok"` — данные успешно получены.
 * - `"no_token"` — на клиенте нет токена, запрос не выполняется.
 * - `"unauthorized"` — сервер вернул 401/403.
 * - `"network_error"` — ошибка сети/транспорта (нет `response`).
 * - `"server_error"` — прочая серверная ошибка (другие 4xx/5xx).
 */
export type MeStatus =
  | 'ok'
  | 'no_token'
  | 'unauthorized'
  | 'network_error'
  | 'server_error';

/**
 * Результат хука {@link useMe}.
 */
export type MeResult = {
  /** Итоговый статус */
  status: MeStatus;
  /** Текущий пользователь или `null`, если недоступен */
  user: IUser | null;
};

/**
 * Хук получения текущего пользователя через `endpoints.auth.current`.
 *
 * Поведение:
 * 1. Если локального токена нет — сеть не дергается, возвращается `no_token`.
 * 2. Если сервер отвечает 200 — возвращаем `{ status: "ok", user }`.
 * 3. Ответы 401/403 трактуются как `unauthorized`.
 * 4. Ошибка сети — `network_error`; прочие 4xx/5xx — `server_error`.
 *
 * По умолчанию:
 * - `staleTime: 30_000` мс
 * - `refetchOnWindowFocus: true`
 * - `retry: 1`
 * - `refetchInterval: 15 * 60 * 1000` (15 минут)
 * - Хук возвращает `isLoading`.
 *
 * `queryKey` и `queryFn` задаются внутри и не должны переопределяться извне.
 * Возвращает весь объект результата React Query, а также явно прокидывает `isLoading`.
 */
export default function useMe(
  options?: Omit<
    UseQueryOptions<MeResult, unknown, MeResult, ['auth', 'me', string | null]>,
    'queryKey' | 'queryFn'
  >
) {
  const http = useAxios();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const query = useQuery<
    MeResult,
    unknown,
    MeResult,
    ['auth', 'me', string | null]
  >({
    queryKey: ['auth', 'me', token ?? null],
    queryFn: async (): Promise<MeResult> => {
      if (!token) {
        return { status: 'no_token', user: null };
      }

      try {
        const res = await endpoints.auth.current.call<IUser>(http);
        const payload = res?.data ?? null;
        return { status: 'ok', user: payload };
      } catch (err: any) {
        const code: number | undefined = err?.response?.status;
        if (code === 401 || code === 403) {
          return { status: 'unauthorized', user: null };
        }
        if (!code) {
          return { status: 'network_error', user: null };
        }
        return { status: 'server_error', user: null };
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: options?.enabled ?? true,
    refetchInterval: 15 * 60 * 1000,
    ...options,
  });

  return { ...query, isLoading: query.isLoading };
}
