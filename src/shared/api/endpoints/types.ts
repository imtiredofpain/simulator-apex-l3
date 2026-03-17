export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type DepRef =
  | { kind: "ref"; path: string }
  | { kind: "tag"; tag: string };

export interface EndpointShape<
  TResp,
  TBody = unknown,
  TParams extends Record<string, any> = {},
  TQuery extends Record<string, any> = {}
> {
  method: HttpMethod;
  feature: string; // 'tasks'
  name: string; // 'byId'
  path: string; // '/tasks/:id'
  tags: string[];
  deps: DepRef[];

  // Фантомные маркеры для вывода типов (в рантайме их нет)
  __resp?: (v: TResp) => TResp;
  __body?: (v: TBody) => TBody;
  __params?: (v: TParams) => TParams;
  __query?: (v: TQuery) => TQuery;
}

export type AnyEndpoint = EndpointShape<any, any, any, any>;
export type FeatureEndpoints = Record<string, AnyEndpoint>;

export type InferResp<E> = E extends { __resp?: (v: infer R) => any }
  ? R
  : unknown;
export type InferBody<E> = E extends { __body?: (v: infer B) => any }
  ? B
  : unknown;
export type InferParams<E> = E extends { __params?: (v: infer P) => any }
  ? P
  : {};
export type InferQuery<E> = E extends { __query?: (v: infer Q) => any }
  ? Q
  : {};