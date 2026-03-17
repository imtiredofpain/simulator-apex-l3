import { lazy } from 'react';
import type { RouteConfig } from '@shared/navigation/types';
import { PATHS } from '@shared/config/pathRoute';

const ApiLogsPage = lazy(
  async () => await import('./').then((m) => ({ default: m.ApiLogs }))
);

export const ApiLogsRoutes = [
  {
    path: PATHS.apiLogs.main,
    name: 'apiservice',
    element: ApiLogsPage,
    // insideMainArea: true,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    meta: {
      innRequired: true,
    },
    handle: {
      crumb: () => 'API логи',
    },
  },
] as const satisfies readonly RouteConfig[];
