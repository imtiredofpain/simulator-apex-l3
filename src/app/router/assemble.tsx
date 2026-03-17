import { Suspense } from 'react';
import type { RouteObject, UIMatch } from 'react-router-dom';
import { Guard } from './Guard';
import { AppShell } from '../layouts/AppShell';
import type { LayoutKind, RouteConfig } from '@shared/navigation/types';
import { AuthShell } from '../layouts/AuthShell';
import { Blank } from '../layouts/Blank';
import { FullscreenShell } from '../layouts/FullscreenShell';
import { routesConfig } from '.';

function joinPath(base: string, seg: string): string {
  if (!seg) return base || '/';
  if (seg.startsWith('/')) return seg; // absolute
  const a = base.replace(/\/+$/, '');
  const b = seg.replace(/^\/+/, '');
  return (a ? `${a}/` : '/') + b;
}

function layoutElement(kind: LayoutKind | undefined) {
  switch (kind ?? 'app') {
    case 'blank':
      return <Blank />;
    case 'auth':
      return <AuthShell />;
    case 'fullscreen':
      return <FullscreenShell />;
    case 'app':
    default:
      return <AppShell />;
  }
}

function asElement(Cmp?: React.LazyExoticComponent<React.ComponentType>) {
  return Cmp ? (
    <Suspense fallback={null}>
      <Cmp />
    </Suspense>
  ) : undefined;
}

/**
 * Превращает RouteConfig-дерево в плоский список RouteObject с абсолютными путями
 * и уже навешанным Guard. Элементы НЕ оборачиваются в layout здесь.
 */
function flattenConfigs(
  cfgs: RouteConfig[],
  base = '',
  inheritedLayout?: LayoutKind
): Array<{ layout: LayoutKind; route: RouteObject; cfg: RouteConfig }> {
  const out: Array<{
    layout: LayoutKind;
    route: RouteObject;
    cfg: RouteConfig;
  }> = [];

  for (const cfg of cfgs) {
    const layout = (cfg.layout ?? inheritedLayout ?? 'app') as LayoutKind;
    const fullPath = joinPath(base, cfg.path);

    //@ts-ignore
    const element = asElement(cfg.element);
    const guarded = element ? (
      <Guard
        needPermissions={cfg.permissions}
        needGroups={cfg.groups}
        innRequired={cfg.meta?.innRequired}
      >
        {element}
      </Guard>
    ) : undefined;

    const route: RouteObject = {
      path: fullPath,
      index: cfg.index,
      handle: cfg.handle,
      element: guarded,
    };

    out.push({ layout, route, cfg });

    if (cfg.children?.length) {
      out.push(...flattenConfigs(cfg.children, fullPath, layout));
    }
  }

  return out;
}

// --- Route resolver ---
export type MatchedRoute = {
  /** Итоговый RouteObject, который уходит в router */
  route: RouteObject;
  /** Исходный RouteConfig из вашего дерева */
  config: RouteConfig;
  /** Спарсенные из URL параметры */
  params: Record<string, string>;
  /** Какой layout применится */
  layout: LayoutKind;
  /** Удобные шорткаты */
  path: string; // абсолютный путь паттерна
  handle?: RouteObject['handle'];
  index?: boolean;
};

function normalizeUrlPath(url: string): string {
  // remove query/hash, collapse multiple slashes, remove trailing slash except root
  const clean = url.split(/[?#]/, 1)[0] || '/';
  const collapsed = clean.replace(/\/+$/, '');
  return collapsed === '' ? '/' : collapsed;
}

function compilePattern(pattern: string): { re: RegExp; keys: string[] } {
  // React Router style: ":id" params and optional splat "*"
  // Ensure leading slash
  let pat = pattern || '/';
  if (!pat.startsWith('/')) pat = '/' + pat;

  const keys: string[] = [];
  // escape regex specials first
  pat = pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  // convert ":param" segments
  pat = pat.replace(/:(\w+)/g, (_, key: string) => {
    keys.push(key);
    return '([^/]+)';
  });
  // convert splat "*" (only one allowed typically)
  pat = pat.replace(/\*/g, () => {
    keys.push('splat');
    return '(.*)';
  });

  // allow optional trailing slash in URL when matching
  const source = `^${pat.replace(/\/$/, '')}/?$`;
  return { re: new RegExp(source), keys };
}

function scorePath(pat: string | undefined): [number, number, number, number] {
  // Higher is more specific
  const p = (pat || '/').replace(/^\/+|\/+$/g, '');
  if (!p) return [0, 0, 0, 0];
  const segs = p.split('/');
  let statics = 0,
    params = 0,
    splats = 0;
  for (const s of segs) {
    if (s === '*') {
      splats++;
      continue;
    }
    if (s.startsWith(':')) params++;
    else statics++;
  }
  // tuple: more statics → better; fewer params → better; no splat → better; longer total → better
  return [statics, -params, -splats, p.length];
}

function bySpecificityDesc(
  a: { route: RouteObject },
  b: { route: RouteObject }
) {
  const sa = scorePath(a.route.path);
  const sb = scorePath(b.route.path);
  // Compare tuples
  for (let i = 0; i < sa.length; i++) {
    const d = sb[i] - sa[i];
    if (d) return d;
  }
  return 0;
}

/**
 * Возвращает RouteObject и params для заданного URL (например, "/lines/1").
 * Матчит по абсолютному пути, учитывая ":params" и "*".
 */
export function resolveRouteByUrl(
  url: string,
  configs: RouteConfig[] = routesConfig
): MatchedRoute | null {
  const target = normalizeUrlPath(url);
  const flat = flattenConfigs(configs);

  const sorted = flat.slice().sort(bySpecificityDesc);

  for (const { layout, route, cfg } of sorted) {
    const pat = route.path || '/';
    const { re, keys } = compilePattern(pat);
    const m = re.exec(target);
    if (!m) continue;

    const params: Record<string, string> = {};
    keys.forEach((k, i) => (params[k] = m[i + 1] ?? ''));

    // index-маршрут: дополнительно считаем совпадением, если путь тот же базовый
    if (route.index && pat !== '/' && !re.test(target)) continue;

    return {
      route,
      config: cfg,
      params,
      layout,
      path: route.path || '/',
      handle: route.handle,
      index: route.index,
    };
  }

  return null;
}

/**
 * Резолвит по UIMatch (например, последний элемент из useMatches()).
 * Параметры берём из match.params, а совпадение ищем по pathname с ранжированием специфичности.
 */
export function resolveRouteFromMatch(
  match: UIMatch,
  configs: RouteConfig[] = routesConfig
): MatchedRoute | null {
  const flat = flattenConfigs(configs);
  const sorted = flat.slice().sort(bySpecificityDesc);
  const pathname = normalizeUrlPath(match.pathname || '/');

  for (const { layout, route, cfg } of sorted) {
    const pat = route.path || '/';
    const { re } = compilePattern(pat);
    if (!re.test(pathname)) continue;

    return {
      route,
      config: cfg,
      params: (match.params as Record<string, string>) || {},
      layout,
      path: route.path || '/',
      handle: route.handle,
      index: route.index,
    };
  }
  return null;
}

/**
 * Возвращает плоский массив абсолютных путей всех роутов из RouteConfig-дерева.
 * Дубликаты исключаются; пути нормализуются (без лишних слешей, корень = "/").
 */
export function listAllPaths(configs: RouteConfig[] = routesConfig): string[] {
  const flat = flattenConfigs(configs);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const { route } of flat) {
    const p = normalizeUrlPath(route.path || '/');
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }

  // Отсортируем по специфичности так же, как матчер (более конкретные выше)
  out.sort((a, b) => {
    const sa = scorePath(a);
    const sb = scorePath(b);
    for (let i = 0; i < sa.length; i++) {
      const d = sb[i] - sa[i];
      if (d) return d;
    }
    return 0;
  });

  return out;
}

export type Breadcrumb = {
  /** Абсолютный путь сегмента URL (напр. "/projects", "/projects/42") */
  path: string;
  /** Итоговый RouteObject, который уходит в router */
  route: RouteObject;
  /** Исходный RouteConfig из вашего дерева */
  config: RouteConfig;
  /** Спарсенные из URL параметры для данного куска пути */
  params: Record<string, string>;
  /** Какой layout применится */
  layout: LayoutKind;
  handle?: RouteObject['handle'];
  index?: boolean;
};

/**
 * Строит массив "хлебных крошек" для переданного URL.
 * Пример: "/a/b/c" → ["/a", "/a/b", "/a/b/c"],
 * и к каждому сегменту подбирается наиболее специфичный роут из конфигурации.
 */
export function buildBreadcrumbs(
  url: string = window.location.hash.replace(/^#/, ''),
  configs: RouteConfig[] = routesConfig
): Breadcrumb[] {
  const target = normalizeUrlPath(url);

  // Список кумулятивных путей: "/a/b/c" → ["/a", "/a/b", "/a/b/c"]
  const segments: string[] =
    target === '/'
      ? ['/']
      : target
          .replace(/^\/+|\/+$/g, '')
          .split('/')
          .map((_, i, arr) => '/' + arr.slice(0, i + 1).join('/'));

  const flat = flattenConfigs(configs);
  const sorted = flat.slice().sort(bySpecificityDesc);

  const crumbs: Breadcrumb[] = [];

  for (const cum of segments) {
    let found: Breadcrumb | undefined;

    for (const { layout, route, cfg } of sorted) {
      const pat = route.path || '/';
      const { re, keys } = compilePattern(pat);
      const m = re.exec(cum);
      if (!m) continue;

      const params: Record<string, string> = {};
      keys.forEach((k, i) => (params[k] = m[i + 1] ?? ''));

      found = {
        path: route.path || '/',
        route,
        config: cfg,
        params,
        layout,
        handle: route.handle,
        index: route.index,
      };
      break; // берём самый специфичный первый матч
    }

    if (found) crumbs.push(found);
  }

  return crumbs;
}

export function buildRoutes(configs: RouteConfig[]): RouteObject[] {
  // 1) Плоский список { layout, route }
  const flat = flattenConfigs(configs);

  // 2) Группируем по layout
  const byLayout = new Map<LayoutKind, RouteObject[]>();
  for (const { layout, route } of flat) {
    const arr = byLayout.get(layout) ?? [];
    arr.push(route);
    byLayout.set(layout, arr);
  }

  // 3) Строим layout-роуты. У каждого — element=Layout, children=routes с абсолютными путями
  const result: RouteObject[] = [];
  for (const [layout, children] of byLayout.entries()) {
    result.push({
      path: '/',
      element: layoutElement(layout),
      children,
    });
  }

  return result;
}
