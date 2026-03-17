import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Имя и значение query-параметра, который будет сигнализировать о намерении выйти из аккаунта.
 */
export const LOGOUT_PARAM_NAME = "logout" as const;

export interface UseLogoutUrlParamOptions {
  /** Имя параметра. По умолчанию `logout`. */
  paramName?: string;
  /** Ожидаемое значение параметра. По умолчанию `token`. */
  paramValue?: string;
  /** Как обновлять историю: `replace` (по умолчанию) или `push`. */
  historyMode?: "replace" | "push";
}

/**
 * Хук для чтения/управления параметром URL, который открывает модалку выхода.
 * Использует `react-router-dom` (`useSearchParams`) и сохраняет остальные параметры URL.
 * По умолчанию работает с `?logout=token`.
 */
export function useLogoutUrlParam(options?: UseLogoutUrlParamOptions) {
  const LOGOUT_PARAM_VALUE = localStorage.getItem("token") || "";
  const name = options?.paramName ?? LOGOUT_PARAM_NAME;
  const value = options?.paramValue ?? LOGOUT_PARAM_VALUE;
  const replace = (options?.historyMode ?? "replace") === "replace";

  const [searchParams, setSearchParams] = useSearchParams();

  const isRequested = searchParams.get(name) === value;

  const open = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.set(name, value);
    setSearchParams(next, { replace });
  }, [searchParams, setSearchParams, name, value, replace]);

  const close = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete(name);
    setSearchParams(next, { replace });
  }, [searchParams, setSearchParams, name, replace]);

  return useMemo(
    () => ({
      /** В URL присутствует `?${name}=${value}` */
      isRequested,
      /** Добавить параметр в URL (и пометить, что нужно открыть диалог). */
      open,
      /** Удалить параметр из URL (и пометить, что диалог закрыт). */
      close,
      /** Имя параметра, с которым работает хук. */
      paramName: name,
      /** Значение параметра, с которым работает хук. */
      paramValue: value,
    }),
    [isRequested, open, close, name, value]
  );
}