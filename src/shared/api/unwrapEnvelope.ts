/**
 * Unwraps an envelope by recursively accessing the "data" or "result" property
 * until it reaches a value that is not an object with one of those properties.
 * Useful for unwrapping API responses which may contain multiple layers of envelopes.
 * @param value the value to unwrap
 * @returns the unwrapped value
 */
export function unwrapEnvelope<T>(value: unknown): T {
  // Разворачиваем до тех пор, пока встречаем { data } или { result }
  let current: any = value as any;
  let guard = 0;
  while (current && ("data" in current || "result" in current) && guard < 4) {
    current = (current.data ?? current.result) as any;
    guard++;
  }
  return current as T;
}
