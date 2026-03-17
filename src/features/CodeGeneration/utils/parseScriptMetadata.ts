export interface ScriptMetadata {
  name?: string;
  version?: string;
  description?: string;
  requiredParameters: string[];
  optionalParameters: string[];
}

/**
 * Извлекает объект metadata из текста скрипта.
 * Ищет блок `var metadata = { ... };` и парсит его через Function.
 */
export function parseScriptMetadata(scriptCode: string): ScriptMetadata | null {
  // Ищем блок var metadata = { ... }; или const metadata = { ... };
  const match = scriptCode.match(
    /(?:var|let|const)\s+metadata\s*=\s*(\{[\s\S]*?\});/
  );
  if (!match?.[1]) return null;

  try {
    // Безопасный парсинг через Function (изолированный скоуп, без доступа к DOM)
    const fn = new Function(`"use strict"; return (${match[1]});`);
    const obj = fn();

    if (!obj || typeof obj !== 'object') return null;

    return {
      name: typeof obj.name === 'string' ? obj.name : undefined,
      version: typeof obj.version === 'string' ? obj.version : undefined,
      description: typeof obj.description === 'string' ? obj.description : undefined,
      requiredParameters: Array.isArray(obj.requiredParameters)
        ? obj.requiredParameters.filter((p: unknown) => typeof p === 'string')
        : [],
      optionalParameters: Array.isArray(obj.optionalParameters)
        ? obj.optionalParameters.filter((p: unknown) => typeof p === 'string')
        : [],
    };
  } catch {
    return null;
  }
}
