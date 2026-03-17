/**
 * Реестр ссылок (links) на основе дерева маршрутов.
 *
 * Этот модуль предоставляет функцию {@link defineLinks},
 * которая принимает массив маршрутов (с полями `name`, `path`, `children`)
 * и возвращает типизированное дерево ссылок, совместимое с автодополнением VSCode
 * в виде `links.feature.subpage.url(...)`.
 *
 * Основные возможности:
 * - Склейка относительных путей (см. {@link joinPath})
 * - Подстановка параметров `:param` (см. {@link compilePath})
 * - Добавление query-параметров (см. {@link withQuery})
 * - Построение типизированного дерева ссылок (см. {@link defineLinks})
 *
 * Пример использования:
 * ```ts
 * import { defineLinks } from '@/shared/navigation/links-tree';
 *
 * export const links = defineLinks([
 *   { name: 'tasks', path: '/tasks', children: [
 *     { name: 'id', path: ':id' },
 *     { name: 'create', path: 'create' },
 *   ]},
 *   { name: 'welcome', path: '/welcome' },
 * ] as const);
 *
 * // Подсказки будут работать так:
 * links.tasks.path            // '/tasks'
 * links.tasks.id.url({ id: 42 })      // '/tasks/42'
 * links.tasks.create.url()            // '/tasks/create'
 * links.welcome.url(undefined, { ref: 'email' }) // '/welcome?ref=email'
 * ```
 */
import type {
  AnyRoute,
  LinksTree,
  NavigationParams,
  NavigationQuery,
  NodeRuntime,
} from './types';

/**
 * Склеивает базовый путь и сегмент с учётом ведущих/замыкающих слэшей.
 *
 * - Если `seg` начинается с `/`, он считается абсолютным и возвращается как есть.
 * - Иначе `seg` прибавляется к `base`, между ними ставится ровно один `/`.
 * - Пустой `seg` вернёт `base` (или `/`, если `base` пуст).
 *
 * @example
 * joinPath('/tasks', 'create')  // => '/tasks/create'
 * joinPath('/tasks/', '/abs')   // => '/abs'
 * joinPath('', 'tasks')         // => '/tasks'
 *
 * @param base Базовый путь (может оканчиваться на `/`)
 * @param seg  Сегмент пути (может начинаться с `/`)
 * @returns Абсолютный путь без дублей слэшей
 */
function joinPath(base: string, seg: string): string {
  if (!seg) return base || '/';
  if (seg.startsWith('/')) return seg; // already absolute
  const a = base.replace(/\/+$/, ''); // trim trailing slashes
  const b = seg.replace(/^\/+/, ''); // trim leading slashes
  return (a ? `${a}/` : '/') + b;
}

/**
 * Подставляет значения параметров в шаблон пути с двоеточиями.
 *
 * Шаблон поддерживает сегменты вида `:id`. Каждому сегменту должен соответствовать
 * ключ в объекте `params`. Значения кодируются через `encodeURIComponent`.
 *
 * @example
 * compilePath('/tasks/:id', { id: 10 })           // => '/tasks/10'
 * compilePath('/u/:name/:tab', { name: 'Ann', tab: 'logs' }) // => '/u/Ann/logs'
 *
 * @throws Если для какого-либо `:param` отсутствует значение в `params`.
 *
 * @param template Шаблон пути (может содержать `:param`)
 * @param params   Карта значений параметров
 * @returns Абсолютный путь с подставленными значениями
 */
function compilePath(template: string, params: NavigationParams = {}): string {
  return template.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const v = params[key];
    if (v === undefined) throw new Error(`Missing param :${key}`);
    return encodeURIComponent(String(v));
  });
}

/**
 * Добавляет к базовому URL строку запроса (query) из объекта.
 *
 * - Пропускает `undefined`-значения.
 * - Массивы превращает в повторяющиеся ключи (`a=1&a=2`).
 * - Остальные значения приводятся к строке через `String(...)`.
 *
 * @example
 * withQuery('/tasks', { q: 'gpu', page: 2 })         // => '/tasks?q=gpu&page=2'
 * withQuery('/tasks/10', { tags: ['a', 'b'] })       // => '/tasks/10?tags=a,b'
 * withQuery('/tasks', undefined)                     // => '/tasks'
 *
 * @param url   Базовый URL без query
 * @param query Объект с параметрами запроса
 * @returns URL с добавленной строкой запроса или исходный URL, если `query` пустой
 */
function withQuery(url: string, query?: NavigationQuery): string {
  if (!query) return url;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      // ФОрмируем массив через запятую
      const s = v.map(String).join(',');
      sp.append(k, s);
    } else sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Строит типизированное дерево ссылок из массива маршрутов.
 *
 * На вход подаются маршруты с полями `name`, `path` и `children`.
 * Возвращаемый объект содержит для каждого узла свойства:
 * - `path` — абсолютный шаблон пути
 * - `url(params?, query?)` — функция сборки итогового URL
 * и вложенные узлы по именам из `children`.
 *
 * Важно: чтобы VSCode подсказывал ключи (`links.tasks.id`), передавайте
 * литеральный массив с `as const`, например: `defineLinks([...routes] as const)`.
 *
 * @example
 * const links = defineLinks([
 *   { name: 'tasks', path: '/tasks', children: [ { name: 'id', path: ':id' } ] },
 * ] as const);
 * links.tasks.path            // '/tasks'
 * links.tasks.id.url({ id: 1 }) // '/tasks/1'
 *
 * @typeParam T Массив маршрутов с литеральными именами
 * @param routes Маршруты верхнего уровня
 * @returns Типизированное дерево ссылок с автодополнением
 */
export function defineLinks<const T extends readonly AnyRoute[]>(
  routes: T
): LinksTree<T> {
  function walk(node: AnyRoute, base = '') {
    const full = joinPath(base, node.path);
    const runtime: NodeRuntime = {
      __path: full,
      __name: node.name,
      __url: (params?: NavigationParams, query?: NavigationQuery) =>
        withQuery(compilePath(full, params), query),
      __meta: node.meta,
    };
    if (!node.children) return runtime;

    const children: Record<string, any> = {};
    for (const child of node.children) {
      children[child.name] = walk(child, full);
    }
    return Object.assign(runtime, children);
  }

  const out: Record<string, any> = {};
  for (const r of routes) {
    out[r.name] = walk(r, '');
  }
  return out as LinksTree<T>;
}
