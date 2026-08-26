import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';

const HomeRedirect = lazy(() => import('./HomeRedirect'));

export const HomeRoutes = [
  {
    path: PATHS.home,
    name: 'home',
    element: HomeRedirect,
    layout: 'app',
    permissions: [],
    groups: [],
  },
] as const satisfies readonly RouteConfig[];
