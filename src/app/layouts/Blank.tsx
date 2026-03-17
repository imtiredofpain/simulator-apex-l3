import { Outlet } from "react-router-dom";

/**
 * Минимальный макет без хедера/меню.
 * Для страниц с собственным уникальным UI (welcome, error, т.п.).
 */
export function Blank({ children }: { children?: React.ReactNode }) {
  return (
    <div className="w-full h-full blank-shell">{children ?? <Outlet />}</div>
  );
}
