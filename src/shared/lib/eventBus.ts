type Listener<T> = (payload: T) => void;

export interface EventBus<TMap extends Record<string, unknown>> {
  on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): () => void;
  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void;
}

export function createEventBus<
  TMap extends Record<string, unknown>,
>(): EventBus<TMap> {
  const map = new Map<keyof TMap, Set<Listener<unknown>>>();

  return {
    on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>) {
      const set = map.get(event) ?? new Set<Listener<unknown>>();
      set.add(listener as Listener<unknown>);
      map.set(event, set as Set<Listener<unknown>>);
      return () => {
        const cur = map.get(event);
        cur?.delete(listener as Listener<unknown>);
      };
    },
    emit<K extends keyof TMap>(event: K, payload: TMap[K]) {
      const set = map.get(event);
      set?.forEach((l) => (l as Listener<TMap[K]>)(payload));
    },
  };
}
