import * as React from 'react';
import type { SettingsGroup } from '@features/Settings/model/types';

export interface SidebarRendererProps {
  group: SettingsGroup; // текущая группа
  active: boolean; // выделена ли сейчас
  onClick: () => void; // открыть эту группу
  t: (key: string) => string; // useTranslations('settings')
  path: string;
}

type SidebarRenderer = React.FC<SidebarRendererProps>;

const sidebarRegistry = new Map<string, SidebarRenderer>();

export function registerSidebarRenderer(
  key: string,
  comp: SidebarRenderer
): void {
  sidebarRegistry.set(key, comp);
}

export function getSidebarRenderer(key?: string): SidebarRenderer | undefined {
  return key ? sidebarRegistry.get(key) : undefined;
}
