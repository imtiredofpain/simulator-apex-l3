'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { safeLocalStorage } from '@shared/lib/safeLocalStorage';
import { createEventBus } from '@shared/lib/eventBus';
import { buildFlatIndex } from '../lib/tree';
import { settingsTree } from '@features/Settings/config';
import type {
  SettingConfig,
  ThemeSetting,
} from '@features/Settings/model/types';
import { syncAdapter } from './sync';
import type { PendingItem, SettingsStore, SettingState } from './types';
import type { SettingScope } from '@shared/types/api';
import { z } from 'zod';

/** --- Индексация конфигурации --- */
const flat = buildFlatIndex(settingsTree);

/** --- Event bus --- */
type BusMap = {
  change: { id: string; value: unknown; scope: SettingScope };
};
export const settingsBus = createEventBus<BusMap>();

/** --- Ключи localStorage --- */
const LS_VALUES = 'settings.values.v1';
const LS_QUEUE = 'settings.queue.v1';

/** --- Начальные значения из config + localStorage кэш --- */
const initialValues = (() => {
  const cache = safeLocalStorage.get<Record<string, SettingState<unknown>>>(
    LS_VALUES,
    {}
  );
  const out: Record<string, SettingState<unknown>> = { ...cache };

  Object.values(flat.byId).forEach((cfg) => {
    if (!out[cfg.id]) {
      out[cfg.id] = {
        id: cfg.id,
        scope: cfg.scope,
        value: cfg.defaultValue,
        status: 'idle',
        updatedAt: Date.now(),
      };
    } else {
      // валидируем кэш по схеме; иначе откатываем к дефолту
      const parsed = (cfg.schema as z.ZodType<unknown>).safeParse(
        out[cfg.id].value
      );
      if (!parsed.success) {
        out[cfg.id].value = cfg.defaultValue;
        out[cfg.id].status = 'idle';
      }
      out[cfg.id].scope = cfg.scope;
    }
  });

  return out;
})();

const initialQueue = safeLocalStorage.get<Array<PendingItem<unknown>>>(
  LS_QUEUE,
  []
);

/** --- Хелперы --- */
function persistValues(values: Record<string, SettingState<unknown>>) {
  safeLocalStorage.set(LS_VALUES, values);
}
function persistQueue(queue: Array<PendingItem<unknown>>) {
  safeLocalStorage.set(LS_QUEUE, queue);
}
function cfgOf(id: string): SettingConfig {
  const cfg = flat.byId[id];
  if (!cfg) throw new Error(`Unknown setting id: ${id}`);
  return cfg;
}

/** --- Store --- */
export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector((set, get) => ({
    /** Registry */
    configById: flat.byId,

    /** UI slice */
    dialogOpen: false,
    currentPath: 'appearance', // стартовая группа
    search: '',
    lastError: undefined,
    focusId: undefined,
    focusSeq: 0,

    setDialogOpen(open) {
      set((s) => (s.dialogOpen === open ? {} : { dialogOpen: open }));
    },

    setPath(dotPath) {
      set((s) => (s.currentPath === dotPath ? {} : { currentPath: dotPath }));
    },
    setSearch(q) {
      set({ search: q });
    },
    setFocus(id, force = false) {
      set((s) => {
        const same = s.focusId === id;
        if (same && !force) return {};
        return { focusId: id, focusSeq: (s.focusSeq ?? 0) + 1 };
      });
    },
    setLastError(err) {
      set({ lastError: err });
    },

    /** Queue slice */
    queue: initialQueue,
    enqueue(item) {
      set((s) => {
        const q = [...s.queue, item];
        persistQueue(q);
        return { queue: q };
      });
    },
    dequeue(id, predicate) {
      set((s) => {
        const q = s.queue.filter((it) =>
          predicate ? predicate(it) : it.id !== id
        );
        persistQueue(q);
        return { queue: q };
      });
    },
    fail(id, error) {
      set((s) => {
        const next = { ...s.values };
        const st = next[id];
        if (st) next[id] = { ...st, status: 'error', error };
        persistValues(next);
        return { values: next, lastError: error };
      });
    },

    /** Settings slice */
    values: initialValues,

    getValue<T>(id: string): T {
      const st = get().values[id];
      if (!st) throw new Error(`Unknown setting: ${id}`);
      return st.value as T;
    },

    async setValue<T>(
      id: string,
      value: T,
      opts?: { optimistic?: boolean; projectId?: string | null }
    ) {
      const cfg = cfgOf(id);
      const scope = cfg.scope;
      const now = Date.now();

      // локальная запись
      set((s) => {
        const next: SettingState<T> = {
          id,
          scope,
          value,
          status: scope === 'local' ? 'synced' : 'pending',
          updatedAt: now,
        };
        const values = { ...s.values, [id]: next };
        persistValues(values);
        return { values };
      });

      // onChange hook (локальный)
      try {
        await cfg.onChange?.(value as unknown as never, {
          id,
          scope,
          projectId: opts?.projectId,
        });
      } catch (e) {
        // onChange провал — откат к дефолту
        set((s) => {
          const fallback = { ...s.values };
          fallback[id] = {
            ...fallback[id],
            value: cfg.defaultValue,
            status: 'error',
            error: String(e),
          };
          persistValues(fallback);
          return { values: fallback, lastError: String(e) };
        });
        return;
      }

      // уведомление слушателей
      settingsBus.emit('change', { id, value, scope });

      // если local — больше ничего не делаем
      if (scope === 'local') return;

      // enqueue для синхронизации
      const pending: PendingItem<T> = {
        id,
        scope,
        value,
        projectId: opts?.projectId ?? null,
        enqueuedAt: now,
        retries: 0,
      };
      get().enqueue(pending);

      // попытка синхронизации сразу (optimistic true по умолчанию)
      await processQueue(get, set);
    },

    setOptimistic<T>(
      id: string,
      value: T,
      opts?: { projectId?: string | null }
    ) {
      const cfg = cfgOf(id);
      const scope = cfg.scope;
      const now = Date.now();

      set((s) => {
        const next = { ...s.values };
        const prev = next[id];
        next[id] = {
          ...prev,
          value,
          updatedAt: now,
          status: scope === 'local' ? 'synced' : 'pending',
        };
        persistValues(next);
        return { values: next };
      });

      // не отправляем в сеть, но кидаем событие
      settingsBus.emit('change', { id, value, scope });

      // если захотим — можно сразу поставлять в очередь
      if (scope !== 'local') {
        const pending: PendingItem<T> = {
          id,
          scope,
          value,
          projectId: opts?.projectId ?? null,
          enqueuedAt: now,
          retries: 0,
        };
        get().enqueue(pending);
      }
    },

    resetAll() {
      set((s) => {
        const next = { ...s.values };
        Object.values(flat.byId).forEach((cfg) => {
          const cur = next[cfg.id];
          if (cur) {
            next[cfg.id] = {
              ...cur,
              value: cfg.defaultValue,
              status: 'synced',
              error: undefined,
              updatedAt: Date.now(),
            };
          }
        });
        persistValues(next);
        return { values: next };
      });
    },
  }))
);

/** --- Обработка очереди с ретраями --- */
async function processQueue(
  get: () => SettingsStore,
  set: (
    partial:
      | Partial<SettingsStore>
      | ((state: SettingsStore) => Partial<SettingsStore>)
  ) => void
) {
  const { queue } = get();
  if (queue.length === 0) return;

  // sequential
  for (const item of queue) {
    const res = await syncAdapter.patch({
      id: item.id,
      value: item.value,
      scope: item.scope,
      projectId: item.projectId,
    } as never);

    if (res.ok) {
      // success
      set((s) => {
        const values = { ...s.values };
        const st = values[item.id];
        if (st)
          values[item.id] = {
            ...st,
            status: 'synced',
            error: undefined,
            updatedAt: Date.now(),
          };
        persistValues(values);
        return { values };
      });
      get().dequeue(item.id, (it) => it === item);
    } else {
      // failure — увеличим retries, оставим в очереди
      const error = res.error;
      set(() => ({ lastError: error }));
      get().fail(item.id, error);
      // Прерываем цикл — попробуем позже
      break;
    }
  }
  persistQueue(get().queue);
}

/** --- Авто-повторы при online и интервал --- */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void processQueue(useSettingsStore.getState, useSettingsStore.setState);
  });
  // мягкий интервал ретраев
  setInterval(() => {
    if (navigator.onLine) {
      void processQueue(useSettingsStore.getState, useSettingsStore.setState);
    }
  }, 8000);
}

/** --- Узкий селектор для темы (без лишних ререндеров) --- */
export const getThemeValue = (): ThemeSetting['defaultValue'] => {
  const st = useSettingsStore.getState().values['theme'];
  return (st?.value as ThemeSetting['defaultValue']) ?? 'system';
};
