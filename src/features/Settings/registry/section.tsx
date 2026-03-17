import * as React from 'react';
import type { SettingsGroup } from '@features/Settings/model/types';

export interface SectionRendererProps {
  group: SettingsGroup; // группа, чей контент рендерим
  path: string; // dot-path до группы
  t: (key: string) => string; // useTranslations('settings')
  setFocus: (id?: string, force?: boolean) => void; // если нужно подсветить item
}

type SectionRenderer = React.FC<SectionRendererProps>;

const sectionRegistry = new Map<string, SectionRenderer>();

export function registerSectionRenderer(
  key: string,
  comp: SectionRenderer
): void {
  sectionRegistry.set(key, comp);
}

export function getSectionRenderer(key?: string): SectionRenderer | undefined {
  return key ? sectionRegistry.get(key) : undefined;
}
