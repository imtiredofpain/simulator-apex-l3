import { Navigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';

function HomeRedirect() {
  return <Navigate to={PATHS.dashboard} replace />;
}

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
