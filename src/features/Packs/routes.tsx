import { PATHS } from "@shared/config/pathRoute";
import type { RouteConfig } from "@shared/navigation/types";
import { lazy } from "react";

const PacksPage = lazy(() => import('./ui/PacksList'));
const PackDetail = lazy(
  async () => await import("./ui/PackDetail").then((m) => ({ default: m.PackDetail })),
);
const PackStatsPage = lazy(
  async () => await import("./ui/PackStatsPage").then((m) => ({ default: m.PackStatsPage })),
);
const NoImplement = lazy(
  () => import("@shared/components/NoImplement/NoImplement"),
);

export const PacksRoutes = [
  {
    path: PATHS.packs.main,
    name: "packs",
    element: PacksPage,
    layout: "app",
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    meta: {
      innRequired: true,
    },
    handle: {
      crumb: () => "Пакеты",
    },
    children: [
      {
        path: "stats",
        name: "packsStats",
        element: PackStatsPage,
        layout: "app",
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => "Статистика",
        },
      },
      {
        path: ":id",
        name: "pack",
        element: PackDetail,
        layout: "app",
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => "Пакет",
        },
        children: [
          {
            path: "edit",
            name: "edit material",
            element: NoImplement,
            layout: "app",
            permissions: [], // пусто => доступ всем
            groups: [], // пусто => доступ всем
            meta: {
              innRequired: true,
            },
            handle: {
              crumb: () => "Редактирование",
            },
          },
        ],
      },
      {
        path: "create",
        name: "create pack",
        element: NoImplement,
        layout: "app",
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => "Создание",
        },
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
