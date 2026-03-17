import { type ReactNode, isValidElement, type ReactElement } from "react";

/**
 * Безопасно извлекает текст из React-узла.
 * - Игнорирует null/undefined/boolean
 * - Обходит массивы и вложенные элементы
 * - Не вызывает компоненты, работает только с уже созданными элементами
 */
export function extractText(node: ReactNode): string {
  const chunks: string[] = [];

  const walk = (child: ReactNode): void => {
    if (child == null || typeof child === "boolean") {
      return;
    }

    if (typeof child === "string" || typeof child === "number") {
      chunks.push(String(child));
      return;
    }

    if (Array.isArray(child)) {
      child.forEach(walk);
      return;
    }

    if (isValidElement(child)) {
      // Не вызываем компоненты, просто залезаем в их children
      const element = child as ReactElement<{ children?: ReactNode }>;
      walk(element.props.children);
      return;
    }

    // Всё остальное (порталы, символы и т.п.) — пропускаем
  };

  walk(node);

  // Можно сделать join(' ') если хочешь разделять текст пробелами
  return chunks.join("");
}
