import type { SettingScope } from '@shared/types/api';
import { z } from 'zod';

export type SettingType = 'switch' | 'select' | 'theme' | 'checkbox' | 'custom';

export type ThemeValue = 'light' | 'dark' | 'system';

export interface BaseSetting<
  TType extends SettingType,
  TValue,
  TMeta extends Record<string, unknown> = Record<string, never>
> {
  id: string;
  type: TType;
  scope: SettingScope;
  defaultValue: TValue;
  /** i18n ключ: settings.<...> */
  i18nKey: string;
  /** Доп. данные для рендера/логики */
  meta?: TMeta;
  /** Схема валидации значения */
  schema: z.ZodType<TValue>;
  tags?: ReadonlyArray<string>;
  description?: string;
  /** Локальный onChange (до синка) */
  onChange?: (
    value: TValue,
    ctx: { id: string; scope: SettingScope; projectId?: string | null }
  ) => Promise<boolean | void> | boolean | void;
}

/** типовые варианты через type-алиасы (не интерфейсы-пустышки) */
export type SwitchSetting = BaseSetting<'switch', boolean>;

export interface SelectOption {
  value: string;
  i18nKey: string;
}
export type SelectSetting = BaseSetting<'select', string> & {
  options: ReadonlyArray<SelectOption>;
};

export type CheckboxSetting = BaseSetting<'checkbox', string[]> & {
  options: ReadonlyArray<SelectOption>;
};

export type ThemeSetting = BaseSetting<'theme', ThemeValue>;

export type CustomSetting<
  TValue,
  TMeta extends Record<string, unknown> = Record<string, never>
> = BaseSetting<'custom', TValue, TMeta> & {
  renderer: string; // ключ реестра
};

/** Объединение */
export type SettingConfig =
  | SwitchSetting
  | SelectSetting
  | CheckboxSetting
  | ThemeSetting
  | CustomSetting<unknown, Record<string, unknown>>;

/** Группы / дерево */
export interface SettingsGroup {
  id: string;
  i18nKey: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  groups?: Record<string, SettingsGroup>;
  items?: ReadonlyArray<SettingConfig>;
  /** Теги для поиска (i18n ключи), напр. ['search.tags.performance', 'search.tags.battery'] */
  tags?: ReadonlyArray<string>;

  /** Полностью кастомный рендерер контента правой панели для ЭТОЙ группы */
  renderer?: string; // ключ из реестра section-рендеров

  /** Полностью кастомный элемент в левом меню для ЭТОЙ группы */
  sidebarRenderer?: string; // ключ из реестра sidebar-рендеров

  /** Любые данные для рендерера */
  meta?: Record<string, unknown>;
}

export interface SettingsTree {
  groups: Record<string, SettingsGroup> | Record<`separator:${string}`, true>;
}

export type SettingStatus = 'idle' | 'loading' | 'pending' | 'synced' | 'error';

export interface SettingState<T> {
  id: string;
  scope: SettingScope;
  value: T;
  status: SettingStatus;
  error?: string;
  updatedAt: number;
}

export interface PendingItem<T> {
  id: string;
  scope: Exclude<SettingScope, 'local'>;
  value: T;
  projectId?: string | null;
  enqueuedAt: number;
  retries: number;
}

export interface SettingsSlice {
  values: Record<string, SettingState<unknown>>;
  /** чтение строго типизированного значения */
  getValue<T>(id: string): T;
  /** установка значения с синхронизацией */
  setValue<T>(
    id: string,
    value: T,
    opts?: { optimistic?: boolean; projectId?: string | null }
  ): Promise<void>;
  /** только локально (без запроса), например для мгновенных UI эффектов */
  setOptimistic<T>(
    id: string,
    value: T,
    opts?: { projectId?: string | null }
  ): void;
  /** сброс всех значений к default */
  resetAll(): void;
}

export interface QueueSlice {
  queue: Array<PendingItem<unknown>>;
  enqueue<T>(item: PendingItem<T>): void;
  dequeue(
    id: string,
    predicate?: (item: PendingItem<unknown>) => boolean
  ): void;
  fail(id: string, error: string): void;
}

export interface UiSlice {
  dialogOpen: boolean;
  currentPath: string;
  search: string;
  lastError?: string;
  focusId?: string;
  focusSeq: number;
  setDialogOpen(open: boolean): void;
  setPath(dotPath: string): void;
  setSearch(q: string): void;
  setLastError(err?: string): void;
  setFocus(id?: string, force?: boolean): void;
}

export interface RegistrySlice {
  /** карта id->config для быстрого доступа */
  configById: Record<string, SettingConfig>;
}

export type SettingsStore = SettingsSlice &
  QueueSlice &
  UiSlice &
  RegistrySlice;

export type ThemeSettingId = ThemeSetting['id'];
