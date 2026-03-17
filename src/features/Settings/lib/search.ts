import { settingsTree } from '@features/Settings/config';
import type { SettingsGroup } from '@features/Settings/model/types';

export type SearchKind = 'group' | 'item';

export interface SearchEntry {
  kind: SearchKind;
  id: string; // для item — id настройки; для group — id группы
  groupPath: string; // dot-path группы (например "appearance.theme")
  groupChain: string[]; // массив id групп по пути
  i18nKey: string; // ключ названия (группы или настройки)
  icon?: SettingsGroup['icon']; // иконка для групп
  description?: string; // описание
  tags?: ReadonlyArray<string>;
}

export interface SearchResult {
  entry: SearchEntry;
  label: string; // человекочитаемый label через t()
  breadcrumb: string[]; // цепочка заголовков групп через t()
  score: number; // простая релевантность
  icon?: SettingsGroup['icon']; // иконка (только для групп)
}

// ——— Helpers for descriptions ———
const getItemDescription = (item: unknown): string | undefined => {
  if (
    typeof item === 'object' &&
    item !== null &&
    'description' in (item as Record<string, unknown>)
  ) {
    const d = (item as { description?: unknown }).description;
    return typeof d === 'string' ? d : undefined;
  }
  return undefined;
};

const collectDescriptionsFromGroup = (group: SettingsGroup): string => {
  const parts: string[] = [];

  // own items
  for (const it of group.items ?? []) {
    const d = getItemDescription(it);
    if (d) parts.push(d);
  }

  // nested groups
  const children = Object.values(group.groups ?? {});
  for (const g of children) {
    const child = collectDescriptionsFromGroup(g);
    if (child) parts.push(child);
  }

  return parts.join(' ');
};

/** Построить индекс из дерева настроек */
export function buildSearchIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];

  const walk = (
    group: SettingsGroup,
    path: string[],
    chain: SettingsGroup[]
  ) => {
    const fullPath = [...path, group.id].join('.');
    const chainNext = [...chain, group];

    // индексируем саму группу
    out.push({
      kind: 'group',
      id: group.id,
      groupPath: fullPath,
      groupChain: chainNext.map((g) => g.id),
      i18nKey: group.i18nKey,
      icon: group.icon,
      description: collectDescriptionsFromGroup(group),
      tags: group.tags ?? [],
    });

    // индексируем элементы группы
    for (const item of group.items ?? []) {
      out.push({
        kind: 'item',
        id: item.id,
        groupPath: fullPath,
        groupChain: chainNext.map((g) => g.id),
        i18nKey: item.i18nKey,
        description: getItemDescription(item),
        tags: item.tags ?? [],
      });
    }

    // спускаемся
    Object.values(group.groups ?? {}).forEach((g) =>
      walk(g, [...path, group.id], chainNext)
    );
  };

  Object.values(settingsTree.groups).forEach((g) => walk(g, [], []));
  return out;
}

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, ''); // убираем диакритику

/** Поиск по индексу, t — переводчик из next-intl
 *  Если одно и то же совпадение относится к группе (например, нашли и в заголовке, и в описании),
 *  мы сворачиваем это в один общий пункт (на уровне группы).
 *  Для самих настроек (kind: 'item') — ничего не агрегируем.
 */
export function searchIndex(
  q: string,
  t: (key: string) => string,
  index: SearchEntry[]
): SearchResult[] {
  const query = normalize(q.trim());
  if (!query) return [];

  // Результаты по элементам (item) складываем как есть.
  const itemResults: SearchResult[] = [];
  // Для групп агрегируем по ключу пути группы.
  const groupMap = new Map<string, SearchResult>();

  for (const e of index) {
    const label = e.i18nKey ? t('settings.' + e.i18nKey) : '';

    const breadcrumb = e.groupChain.map((id) => getGroupLabelById(id, t));
    const tagsText = (e.tags ?? []).map((k) => t('tags.' + k));
    const hay = normalize(
      [label, e.description ?? '', ...tagsText, ...breadcrumb]
        .filter(Boolean)
        .join(' ')
    );

    if (!hay.includes(query)) continue;

    // простая оценка: начало слова важнее
    const idx = hay.indexOf(query);
    const score = idx === 0 ? 1000 : 100 - idx;

    const result: SearchResult = {
      entry: e,
      label,
      breadcrumb,
      score,
      icon: e.kind === 'group' ? e.icon : undefined,
    };

    if (e.kind === 'group') {
      // Агрегируем группы по их полному dot-path
      const key = e.groupPath; // уникально в пределах дерева
      const prev = groupMap.get(key);
      if (!prev || score > prev.score) {
        groupMap.set(key, result);
      }
      // если нашли несколько раз в разных полях — оставляем один, с лучшим score
    } else {
      // item оставляем как отдельный результат
      itemResults.push(result);
    }
  }

  // Если найден и group, и его child items — оставляем ТОЛЬКО group.
  const filteredItems = itemResults.filter(
    (r) => !groupMap.has(r.entry.groupPath)
  );

  const merged = [...groupMap.values(), ...filteredItems];
  merged.sort((a, b) => b.score - a.score);
  return merged.slice(0, 50);
}

function getGroupLabelById(id: string, t: (key: string) => string): string {
  // пробегаем дерево один раз — групп не так много
  const stack = Object.values(settingsTree.groups);
  while (stack.length) {
    const g = stack.pop()!;
    if (g.id === id) return g.i18nKey ? t('settings.' + g.i18nKey) : '';
    Object.values(g.groups ?? {}).forEach((sg) => stack.push(sg));
  }
  return id;
}
