import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import useAxios from '@shared/api/hooks/useAxios';
import { endpoints } from '@shared/api/endpoints';

/**
 * Статусы результата логаута, возвращаемые хуком {@link useLogout}.
 *
 * Возможные значения:
 * - `"ok"` — успешно разлогинились на сервере.
 * - `"no_token"` — токена не было; локальное состояние очищено.
 * - `"unauthorized"` — сервер ответил 401/403, токен недействителен или истёк.
 * - `"network_error"` — сеть недоступна/ошибка транспорта; локально всё очищено.
 * - `"server_error"` — прочая серверная ошибка (4xx/5xx); локально всё очищено.
 */
export type LogoutStatus =
  | 'ok' // успешно разлогинились на сервере
  | 'no_token' // токена не было — локально просто подчистили состояние
  | 'unauthorized' // сервер ответил 401/403 — токен недействителен/истёк
  | 'network_error' // сеть упала/сервер недоступен
  | 'server_error'; // другой ответ с кодом 5xx/4xx

/**
 * Результат мутации логаута.
 * @property {LogoutStatus} status Итоговый статус операции. См. {@link LogoutStatus}.
 */
type LogoutResult = { status: LogoutStatus };

/**
 * Чистит локальное клиентское состояние аутентификации (localStorage, и т.п.).
 * Сейчас удаляет только ключ `token` из `localStorage`.
 * Вызвается в `finally` логаута при любом исходе — успешном или с ошибкой.
 * @returns {boolean} Возвращает `true`, если после выполнения токена нет в хранилище.
 */
function clearClientAuthState() {
  try {
    localStorage.removeItem('token');
    return !localStorage.getItem('token');
  } catch {
    return false;
  }
}

/**
 * Хук для безопасного выхода из аккаунта (logout) с корректной очисткой клиента.
 *
 * Что делает:
 * 1. Проверяет наличие токена в `localStorage`.
 * 2. Если токен есть — вызывает `endpoints.auth.logout`.
 * 3. В любом случае чистит локальное состояние (удаляет токен).
 * 4. Сбрасывает/инвалидирует кэш React Query (в т.ч. ключ `['auth','me']`).
 * 5. Возвращает детальный статус результата (`LogoutStatus`) для UI.
 *
 * Особенности:
 * - При отсутствии токена сервер не вызывается и возвращается статус `"no_token"`.
 * - Ответы 401/403 интерпретируются как `"unauthorized"` (сессия невалидна/истекла).
 * - Ошибки сети/транспорта приводят к статусу `"network_error"`.
 * - Любые прочие 4xx/5xx считаются `"server_error"`.
 * - Локальный токен и зависящие от него данные очищаются всегда (через `finally`).
 *
 * Типичное применение:
 * - Показ уведомлений (тостов) на основании статуса.
 * - Редирект пользователя на страницу входа.
 * - Принудительная инвалидация защищённых запросов.
 *
 * @param {UseMutationOptions<LogoutResult, unknown, void, unknown>} [options]
 * Дополнительные опции React Query `useMutation` (например, `onSuccess`, `onError`, `onSettled`).
 * @returns {import('@tanstack/react-query').UseMutationResult<LogoutResult, unknown, void, unknown>}
 * Объект мутации React Query. Результат (`data`) содержит `{ status }` из {@link LogoutStatus}.
 *
 * @example
 * // 1) Базовый выход с уведомлениями
 * const { mutate: logout, isPending, data } = useLogout({
 *   onSuccess: ({ status }) => {
 *     switch (status) {
 *       case 'ok':
 *         toast.success('Вы вышли из аккаунта');
 *         break;
 *       case 'no_token':
 *       case 'unauthorized':
 *         toast.info('Сессия была уже завершена');
 *         break;
 *       case 'network_error':
 *         toast.error('Проблема с сетью — локально вы разлогинены');
 *         break;
 *       default:
 *         toast.error('Ошибка на сервере — локально вы разлогинены');
 *     }
 *     router.replace('/login');
 *   },
 * });
 *
 * @example
 * // 2) Кнопка выхода с дизейблом во время запроса
 * function LogoutButton() {
 *   const { mutate: logout, isPending } = useLogout();
 *   return (
 *     <button onClick={() => logout()} disabled={isPending}>
 *       {isPending ? 'Выходим…' : 'Выйти'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // 3) Хедер, который скрывает защищённые элементы после логаута
 * function Header() {
 *   const { mutate: logout } = useLogout({
 *     onSettled: () => {
 *       // Доп. логика после очистки кэша: например, закрыть модалки или сбросить локальные сторы
 *       uiStore.reset();
 *     },
 *   });
 *   return (
 *     <nav>
 *       <a href="/profile">Профиль</a>
 *       <button onClick={() => logout()}>Выйти</button>
 *     </nav>
 *   );
 * }
 */
export default function useLogout(
  options?: UseMutationOptions<LogoutResult, unknown, void, unknown>
) {
  const http = useAxios();
  const queryClient = useQueryClient();

  return useMutation<LogoutResult, unknown, void>({
    mutationFn: async () => {
      const token = localStorage.getItem('token');

      // Если токена нет — серверу звать нечего, просто подчистим клиент
      if (!token) {
        return { status: 'no_token' as const };
      }

      try {
        await endpoints.auth.logout.call<void>(http);
        return { status: 'ok' as const };
      } catch (err: any) {
        const code = err?.response?.status as number | undefined;

        if (code === 401 || code === 403) {
          return { status: 'unauthorized' as const };
        }
        if (!code) {
          // нет response — чаще всего проблема сети / CORS
          return { status: 'network_error' as const };
        }
        return { status: 'server_error' as const };
      } finally {
        // В любом случае локальное состояние должно быть чистым
        clearClientAuthState();
      }
    },

    // При любом исходе: чистим кэш и инвалидации
    onSettled: async () => {
      queryClient.setQueryData(['auth', 'me'], null);
      await queryClient.invalidateQueries({ predicate: () => true });
    },

    ...options,
  });
}
