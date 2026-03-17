import type {
  SettingsTree,
  SettingsGroup,
  SettingConfig,
} from '../model/types';

export interface FlatIndex {
  byId: Record<string, SettingConfig>;
  /** путь группы по "dot" для sidebar/навигации */
  groupPathIndex: Record<string, string>; // groupId -> 'appearance.theme'
  /** список настроек по группе */
  itemsByGroupPath: Record<string, ReadonlyArray<SettingConfig>>;
}

export const buildFlatIndex = (tree: SettingsTree): FlatIndex => {
  const byId: Record<string, SettingConfig> = {};
  const groupPathIndex: Record<string, string> = {};
  const itemsByGroupPath: Record<string, ReadonlyArray<SettingConfig>> = {};

  const walk = (group: SettingsGroup, path: string[]) => {
    const full = [...path, group.id].join('.');
    groupPathIndex[group.id] = full;

    if (group.items) {
      itemsByGroupPath[full] = group.items;
      for (const s of group.items) byId[s.id] = s;
    }
    if (group.groups) {
      Object.values(group.groups).forEach((g) => walk(g, [...path, group.id]));
    }
  };

  Object.values(tree.groups).forEach((g) => walk(g, []));
  return { byId, groupPathIndex, itemsByGroupPath };
};

/** Возвращает массив путей групп от корня по dot-path */
export const splitPath = (dotPath: string): string[] =>
  dotPath.split('.').filter(Boolean);

/** Возвращает текущую верхнюю группу (первый сегмент) */
export const topFromPath = (dotPath: string): string =>
  splitPath(dotPath)[0] ?? '';
