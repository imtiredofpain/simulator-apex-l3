import type { LevenshteinOptions, SearchStrategy } from "./Strategy";
import { extractSearchableValues } from "./utils";

export function localSearch<T>(
  data: T[],
  query: string,
  config: {
    keys: Array<keyof T | ((item: T) => unknown)>;
    strategies: ReadonlyArray<SearchStrategy<unknown | LevenshteinOptions>>;
    threshold: number;
  }
): T[] {
  if (!query) return data;

  const normalizedQuery = query.trim();

  return data.filter((item) =>
    config.keys.some((key) => {
      const rawValue = typeof key === "function" ? key(item) : item[key];

      const values = extractSearchableValues(rawValue);

      return values.some((value) =>
        config.strategies.some((strategy) =>
          strategy.match(value, normalizedQuery, {
            threshold: config.threshold,
          })
        )
      );
    })
  );
}
