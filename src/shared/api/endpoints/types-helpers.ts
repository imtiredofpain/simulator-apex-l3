export type ExtractPathParams<S extends string> =
  S extends `${string}:${infer P}/${infer R}`
    ? P | ExtractPathParams<`/${R}`>
    : S extends `${string}:${infer P}`
    ? P
    : never;

type StrNum = string | number;

export type ParamsFromPath<Path extends string> = [
  ExtractPathParams<Path>
] extends [never]
  ? {}
  : { [K in ExtractPathParams<Path>]: StrNum };

export type Merge<A, B> = Omit<A, keyof B> & B;

export type IfEmpty<T, Y, N> = keyof T extends never ? Y : N;
