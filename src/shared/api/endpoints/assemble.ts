import type { AnyEndpoint, HttpMethod, DepRef } from './types';
import type { InferResp, InferBody, InferParams, InferQuery } from './types';
import type { ParamsFromPath, Merge, IfEmpty } from './types-helpers';
import type { ApiEnvelope } from '../contracts';
import type { AxiosInstance } from 'axios';

import { queryClient } from '@app/providers/query';

// --- Batched invalidation bucket (accumulates within the same tick) ---
const __pendingInvalidate = new Set<string>();
let __invalidateFlushTimer: number | null = null;

function __scheduleInvalidateFlush() {
  if (__invalidateFlushTimer !== null) return;
  // Flush after 50ms to accumulate rapid calls
  __invalidateFlushTimer = window.setTimeout(() => {
    try {
      const keys = Array.from(__pendingInvalidate);
      __pendingInvalidate.clear();
      __invalidateFlushTimer = null;
      if (keys.length === 0) return;
      // Single wide invalidate using predicate to catch all matching query keys
      queryClient.invalidateQueries({
        predicate: (q: any) => {
          const parts = Array.isArray(q?.queryKey) ? q.queryKey : [q?.queryKey];
          return parts?.some?.(
            (p: unknown) =>
              typeof p === 'string' &&
              keys.some((k) => p === k || p.includes(k))
          );
        },
      });
    } catch (e) {
      console.error('[assembleEndpoints] batched invalidate failed', e);
    }
  }, 50);
}

function compilePath(template: string, params: Record<string, any> = {}) {
  return template.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const v = params[key];
    if (v === undefined) throw new Error(`Missing param :${key}`);
    return encodeURIComponent(String(v));
  });
}
function withQuery(url: string, query?: Record<string, any>) {
  if (!query) return url;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    Array.isArray(v)
      ? v.forEach((it) => sp.append(k, String(it)))
      : sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${url}?${qs}` : url;
}

type EndpointRuntimeFor<E extends AnyEndpoint> = {
  __path: string;
  __feature: string;
  __name: string;
  __method: HttpMethod;
  __tags: string[];
  __deps: DepRef[];

  // params = merge(ParamsFromPath<path>, InferParams<E>)
  // если в сумме пусто — делаем аргумент params опциональным
  url: IfEmpty<
    Merge<ParamsFromPath<E['path']>, InferParams<E>>,
    (params?: {}, query?: InferQuery<E>) => string,
    (
      params: Merge<ParamsFromPath<E['path']>, InferParams<E>>,
      query?: InferQuery<E>
    ) => string
  >;

  call<
    TResp = InferResp<E>,
    TRespEnvelope = ApiEnvelope<TResp>,
    TBody = InferBody<E>
  >(
    http: AxiosInstance,
    args?: {
      params?: Merge<ParamsFromPath<E['path']>, InferParams<E>>;
      query?: InferQuery<E>;
      body?: TBody;
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<TRespEnvelope>;
};

type FeatureRuntime<TFeature extends Record<string, AnyEndpoint>> = {
  [K in keyof TFeature]: EndpointRuntimeFor<TFeature[K]>;
} & {
  __tag(tag: string): { kind: 'tag'; tag: string };
};

export function assembleEndpoints<
  const TFeatures extends Record<string, Record<string, AnyEndpoint>>
>(features: TFeatures) {
  const runtime: any = {};

  for (const [feature, eps] of Object.entries(features)) {
    runtime[feature] = new Proxy(
      {},
      {
        get(_, name: string) {
          if (name === '__tag')
            return (t: string) => ({
              kind: 'tag',
              tag: `${feature}:${t}` as const,
            });
          const ep = (eps as Record<string, AnyEndpoint>)[name];
          if (!ep) return undefined;

          const absPath = ep.path.startsWith('/') ? ep.path : `/${ep.path}`;

          const obj = {
            __path: absPath,
            __feature: ep.feature,
            __name: ep.name,
            __method: ep.method,
            __tags: ep.tags.slice(),
            __deps: ep.deps.slice(),
            url: (params?: Record<string, any>, query?: Record<string, any>) =>
              withQuery(compilePath(absPath, params ?? {}), query),
            async call(http: AxiosInstance, args?: any) {
              const url = withQuery(
                compilePath(absPath, args?.params ?? {}),
                args?.query
              );
              const res = await http.request({
                url,
                method: ep.method,
                data: args?.body,
                headers: args?.headers,
                timeout: args?.timeout,
              });

              const tags = obj.__deps.map((dep) => {
                if (dep.kind === 'tag') return dep.tag;
                return `${feature}:${dep.path}`;
              });

              if (tags && tags.length > 0) {
                console.log('invalidate', tags);
                for (const t of tags) __pendingInvalidate.add(t);
                __scheduleInvalidateFlush();
              }

              return res.data;
            },
          } as EndpointRuntimeFor<any>;

          return obj;
        },
      }
    );
  }

  return runtime as { [F in keyof TFeatures]: FeatureRuntime<TFeatures[F]> };
}
