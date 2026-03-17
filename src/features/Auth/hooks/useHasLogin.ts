import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import useAxios from '@shared/api/hooks/useAxios';
import { endpoints } from '@shared/api/endpoints';
import type { IResponseUserSessionCheck } from '@shared/types/users';

/**
 * Статус результата проверки сессии.
 * - `"valid"` — сервер подтвердил валидность сессии **и** токен совпал с локальным.
 * - `"invalid"` — сервер отверг токен (401/403) или пришёл другой токен/`isValid=false`.
 * - `"no_token"` — токен отсутствует на клиенте.
 * - `"network_error"` — ошибка сети/транспорта (нет `response`).
 * - `"server_error"` — иная серверная ошибка (прочие 4xx/5xx).
 */
export type SessionCheckStatus =
  | 'valid'
  | 'invalid'
  | 'no_token'
  | 'network_error'
  | 'server_error';

/**
 * Результат проверки сессии, возвращаемый хуком {@link useHasLogin}.
 */
export type SessionCheckResult = {
  /** Итоговый статус. */
  status: SessionCheckStatus;
  /** Удобный булевый флаг валидности сессии. */
  isValid: boolean;
  /** Причина невалидности, если есть (для отладки/UX). */
  reason?: 'server_invalid' | 'token_mismatch';
  /** Сырые данные ответа сервера. */
  raw?: IResponseUserSessionCheck;
};

/**
 * Хук для проверки валидности текущей сессии через `endpoints.auth.check`.
 *
 * Поведение:
 * 1. Если локального токена нет — сеть не дергается, возвращается `no_token`.
 * 2. Если сервер отвечает 200 — считаем сессию валидной **только если**:
 *    - `session.isValid === true`, и
 *    - `session.token` строго совпадает с локальным токеном.
 *    Иначе возвращаем `invalid` с пояснением причины (`token_mismatch` или `server_invalid`).
 * 3. Ответы 401/403 трактуются как `invalid`.
 * 4. Ошибка сети — `network_error`; прочие 4xx/5xx — `server_error`.
 *
 * По умолчанию:
 * - `staleTime: 30_000` мс
 * - `refetchOnWindowFocus: false`
 * - `retry: 1` (одна повторная попытка)
 *
 * @param {UseQueryOptions<SessionCheckResult, unknown, SessionCheckResult, [string, string | null]>} [options]
 * Опции React Query. `queryKey` и `queryFn` переопределять не нужно — задаются внутри.
 * @returns Результат `useQuery` с `data` типа {@link SessionCheckResult}.
 *
 * @example
 * // Простой хедер, скрывающий приватные пункты, если сессия невалидна
 * const { data, isFetching } = useHasLogin();
 * if (isFetching) return null;
 * return (
 *   <nav>
 *     {data?.isValid ? (
 *       <>
 *         <a href="/profile">Профиль</a>
 *         <a href="/settings">Настройки</a>
 *       </>
 *     ) : (
 *       <a href="/login">Войти</a>
 *     )}
 *   </nav>
 * );
 *
 * @example
 * // Запрет рендера приватной страницы без валидной сессии
 * function PrivatePage() {
 *   const { data } = useHasLogin();
 *   if (!data?.isValid) {
 *     return <Navigate to="/login" replace />;
 *   }
 *   return <Dashboard />;
 * }
 *
 * @example
 * // Ручная перепроверка по клику (например, после продления токена)
 * const { data, refetch, isFetching } = useHasLogin({ enabled: true });
 * <button onClick={() => refetch()} disabled={isFetching}>Проверить ещё раз</button>;
 */
export default function useHasLogin(
  options?: Omit<
    UseQueryOptions<
      SessionCheckResult,
      unknown,
      SessionCheckResult,
      ['auth', 'check', string | null]
    >,
    'queryKey' | 'queryFn'
  >
) {
  const http = useAxios();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return useQuery<
    SessionCheckResult,
    unknown,
    SessionCheckResult,
    ['auth', 'check', string | null]
  >({
    queryKey: ['auth', 'check', token ?? null],
    queryFn: async (): Promise<SessionCheckResult> => {
      // 1) Нет токена — считаем сессию невалидной без обращения к серверу
      if (!token) {
        return { status: 'no_token', isValid: false };
      }

      try {
        const res = await endpoints.auth.check.call<IResponseUserSessionCheck>(
          http
        );

        const payload = res.data;
        const serverValid = Boolean(payload?.session?.isValid);
        // const serverToken = payload?.session?.token ?? null;

        // валидация флагов сервера + строгое совпадение токена
        if (serverValid) {
          return {
            status: 'valid',
            isValid: true,
            raw: payload,
          };
        }

        return {
          status: 'invalid',
          isValid: false,
          reason: !serverValid ? 'server_invalid' : 'token_mismatch',
          raw: payload,
        };
      } catch (err: any) {
        const code: number | undefined = err?.response?.status;
        if (code === 401 || code === 403) {
          return {
            status: 'invalid',
            isValid: false,
            reason: 'server_invalid',
          };
        }
        if (!code) {
          return { status: 'network_error', isValid: false };
        }
        return { status: 'server_error', isValid: false };
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: options?.enabled ?? true,
    refetchInterval: 15 * 60 * 1000,
    ...options,
  });
}
