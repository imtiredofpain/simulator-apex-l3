import { includesStrategy, layoutStrategy, levenshteinStrategy, type SearchStrategy } from "./Strategy";

export function defautConfigSearch<T>(data: (keyof T)[]) {
  return {
    has: true,
    local: {
      keys: data as (keyof T)[],
      threshold: 2,
      strategies: [
        includesStrategy,
        layoutStrategy,
        levenshteinStrategy as SearchStrategy<unknown>,
      ],
    },
  };
};