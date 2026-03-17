import { lazy } from 'react';
import type { RouteConfig } from '@shared/navigation/types';
import { Home } from 'lucide-react';

const Page404 = lazy(() => import('./ui/NotFound'));

export const notFoundRoutes = [
  {
    path: '*',
    name: 'notFound',
    element: Page404,
    // insideMainArea: true,
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    handle: {
      crumb: () => 'Задачи',
    },
    meta: {
      title: 'Список задач',
      description: 'Обзор и фильтрация задач',
      icon: Home,
      extra: { feature: 'tasks', order: 10 },
    },
  },
] as const satisfies readonly RouteConfig[];
