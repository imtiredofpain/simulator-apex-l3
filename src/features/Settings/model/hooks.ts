'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  useSearchParams as useRRSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettingsStore, settingsBus } from './store';
import type { SettingScope } from '@shared/types/api';
import type { SettingStatus } from './types';

type SettingApi<T> = {
  value: T;
  set: (
    value: T,
    opts?: { optimistic?: boolean; projectId?: string | null }
  ) => Promise<void>;
  setOptimistic: (value: T, opts?: { projectId?: string | null }) => void;
  status: SettingStatus;
  meta: { scope: SettingScope; id: string; error?: string };
  onChange: (listener: (value: T) => void) => () => void;
};

export function useSetting<T>(id: string): SettingApi<T> {
  // держим i18n-контекст (для будущих меток/ошибок), в зависимостях не используем
  useTranslation();

  // отдельные подписки по примитивам — без создания новых массивов/объектов
  const value = useSettingsStore((s) => s.values[id]?.value as T);
  const status = useSettingsStore(
    (s) => (s.values[id]?.status ?? 'idle') as SettingStatus
  );
  const scope = useSettingsStore(
    (s) => (s.values[id]?.scope ?? 'local') as SettingScope
  );
  const error = useSettingsStore((s) => s.values[id]?.error);

  const set = useCallback(
    async (
      next: T,
      opts?: { optimistic?: boolean; projectId?: string | null }
    ) => {
      if (opts?.optimistic) {
        useSettingsStore
          .getState()
          .setOptimistic<T>(id, next, { projectId: opts.projectId ?? null });
      }
      await useSettingsStore.getState().setValue<T>(id, next, {
        optimistic: !!opts?.optimistic,
        projectId: opts?.projectId ?? null,
      });
    },
    [id]
  );

  const setOptimistic = useCallback(
    (next: T, opts?: { projectId?: string | null }) => {
      useSettingsStore
        .getState()
        .setOptimistic<T>(id, next, { projectId: opts?.projectId ?? null });
    },
    [id]
  );

  const onChange = useCallback(
    (listener: (value: T) => void) => {
      return settingsBus.on('change', ({ id: changedId, value }) => {
        if (changedId === id) listener(value as T);
      });
    },
    [id]
  );

  return {
    value,
    set,
    setOptimistic,
    status,
    meta: { scope, id, error },
    onChange,
  };
}

/** Управление диалогом через query ?settings=... */
export function useSettingsDialogQuery() {
  const [params] = useRRSearchParams(); // в RRD не бывает null
  const navigate = useNavigate();
  const location = useLocation();

  const open = useSettingsStore((s) => s.dialogOpen);
  const path = useSettingsStore((s) => s.currentPath);
  const setDialogOpen = useSettingsStore((s) => s.setDialogOpen);
  const setPath = useSettingsStore((s) => s.setPath);

  const settingsParam = useMemo(() => params.get('settings') ?? '', [params]);

  // Создаем хук openDialog, который в качестве параметра принимает путь
  const openDialog = useCallback(
    (dotPath: string) => {
      const current = new URLSearchParams(params.toString());
      current.set('settings', dotPath);
      const search = `?${current.toString()}`;
      navigate({ pathname: location.pathname, search }, { replace: true });
    },
    [params, navigate, location.pathname]
  );

  const closeDialog = useCallback(() => {
    const current = new URLSearchParams(params.toString());
    current.delete('settings');
    const search = current.toString() ? `?${current.toString()}` : '';
    navigate({ pathname: location.pathname, search }, { replace: true });
  }, [params, navigate, location.pathname]);

  useEffect(() => {
    const nextOpen = settingsParam.length > 0;
    setDialogOpen(nextOpen); // no-op guard в сторе
    if (nextOpen && settingsParam !== path) {
      setPath(settingsParam); // no-op guard в сторе
    }
  }, [settingsParam, path, setDialogOpen, setPath]);

  return { open, path, setPath, openDialog, closeDialog };
}
