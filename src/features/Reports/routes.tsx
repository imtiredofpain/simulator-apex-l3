import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';

const ListPage = lazy(() => import('./ui/List'));
const ListByTypePage = lazy(() => import('./ui/ListByType'));
const ReportPage = lazy(() => import('./ui/Report'));

export const ReportsRoutes = [
  {
    path: PATHS.reports.main,
    name: "Reports list",
    element: ListPage,
    // insideMainArea: true,
    layout: "app",
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    handle: {
      crumb: () => "Отчёты",
    },
    children: [
      {
        path: ":type",
        name: "Reports list by type",
        element: ListByTypePage,
        layout: "app",
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        handle: {
          crumb: () => "Отчёты по типу",
        },
        children: [
          {
            path: ":id",
            name: "Report",
            element: ReportPage,
            layout: "app",
            permissions: [], // пусто => доступ всем
            groups: [], // пусто => доступ всем
            handle: {
              crumb: () => "Отчёт",
            },
          },
        ],
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
