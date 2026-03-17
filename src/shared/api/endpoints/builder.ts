import type { AnyEndpoint, EndpointShape, HttpMethod, DepRef } from "./types";

type Params = Record<string, any>;
type Query = Record<string, any>;

export const tag = (tag: string): DepRef => ({ kind: "tag", tag });
export const ref = (path: string): DepRef => ({ kind: "ref", path });

class EndpointBuilder<
  TResp,
  TBody = unknown,
  TParams extends Params = {},
  TQuery extends Query = {}
> {
  private ep: Omit<
    EndpointShape<TResp, TBody, TParams, TQuery>,
    "__resp" | "__body" | "__params" | "__query"
  > & {
    __resp?: any;
    __body?: any;
    __params?: any;
    __query?: any;
  };

  constructor(feature: string, name: string, method: HttpMethod, path: string) {
    this.ep = { feature, name, method, path, tags: [], deps: [] };
  }

  response<R>() {
    return this as unknown as EndpointBuilder<R, TBody, TParams, TQuery>;
  }
  body<B>() {
    return this as unknown as EndpointBuilder<TResp, B, TParams, TQuery>;
  }
  params<P extends Params>() {
    return this as unknown as EndpointBuilder<TResp, TBody, P, TQuery>;
  }
  query<Q extends Query>() {
    return this as unknown as EndpointBuilder<TResp, TBody, TParams, Q>;
  }

  tag(t: string) {
    this.ep.tags.push(t);
    return this;
  }
  deps(d: DepRef[]) {
    this.ep.deps.push(...d);
    return this;
  }

  build(): AnyEndpoint {
    // Возвращаем как AnyEndpoint (фантомные поля не нужны в рантайме)
    const { feature, name, method, path, tags, deps } = this.ep;
    return { feature, name, method, path, tags, deps } as AnyEndpoint;
  }
}

export function defineEndpoints<Feature extends string>(feature: Feature) {
  const factory = {
    get: (name: string, path: string) =>
      new EndpointBuilder<any>(feature, name, "GET", path),
    post: (name: string, path: string) =>
      new EndpointBuilder<any>(feature, name, "POST", path),
    put: (name: string, path: string) =>
      new EndpointBuilder<any>(feature, name, "PUT", path),
    patch: (name: string, path: string) =>
      new EndpointBuilder<any>(feature, name, "PATCH", path),
    delete: (name: string, path: string) =>
      new EndpointBuilder<any>(feature, name, "DELETE", path),
  };

  return function build<const T extends Record<string, EndpointBuilder<any>>>(
    defs: (e: typeof factory) => T
  ) {
    const built = defs(factory);
    const out: Record<string, AnyEndpoint> = {};
    for (const [k, v] of Object.entries(built)) out[k] = (v as any).build();
    return out as { readonly [K in keyof T]: AnyEndpoint };
  };
}
