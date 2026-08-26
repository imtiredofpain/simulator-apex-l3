import type { RouteConfig } from '@shared/navigation/types';
import { PATHS } from '@shared/config/pathRoute';
import { lazy } from 'react';

const DashboardPage = lazy(async () => {
  const module = await import('./ui/DashboardPage');
  return { default: module.DashboardPage };
});

export const DashboardRoutes = [
  {
    path: PATHS.dashboard,
    name: 'systemDashboard',
    element: DashboardPage,
    layout: 'app',
    permissions: [],
    groups: [],
    handle: {
      crumb: () => 'Дашборд системы',
    },
  },
] as const satisfies readonly RouteConfig[];
