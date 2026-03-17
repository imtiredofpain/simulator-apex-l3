import { lazy } from 'react';
import type { RouteConfig } from '@shared/navigation/types';

const SignInPage = lazy(() => import('./ui/Sign-in'));

export const SignInRoutes = [
  {
    path: '/sign-in',
    name: 'signIn',
    element: SignInPage,
    // insideMainArea: true,
    layout: 'auth',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    handle: {
      crumb: () => 'Задачи',
    },
  },
] as const satisfies readonly RouteConfig[];
