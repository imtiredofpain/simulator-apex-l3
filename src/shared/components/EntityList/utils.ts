export function extractSearchableValues(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return [
      String(value)
        .trim()
        .toLowerCase()
        .replaceAll("ё", "е"),
    ];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractSearchableValues);
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap(extractSearchableValues);
  }

  return [];
}
