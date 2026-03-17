import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';
import { PATHS } from '@shared/config/pathRoute';

const ControlModulesPage = lazy(
  async () =>
    await import('./').then((m) => ({ default: m.ControlModulesPage }))
);

const ControlModulePage = lazy(
  async () => await import('./').then((m) => ({ default: m.ControlModulePage }))
);

const ControlModuleCreatePage = lazy(
  async () =>
    await import('./').then((m) => ({ default: m.ControlModuleCreate }))
);

const ControlModuleEditPage = lazy(
  async () => await import('./').then((m) => ({ default: m.ControlModuleEdit }))
);

export const ControlModulesRoutes = [
  {
    path: PATHS.controlModules.main,
    name: 'controlModules',
    element: ControlModulesPage,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    handle: {
      crumb: () => 'Модули управления',
    },
    children: [
      {
        path: ':id',
        name: 'controlModule',
        element: ControlModulePage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        handle: {
          crumb: () => 'Модуль управления',
        },
        children: [
          {
            path: 'edit',
            name: 'controlModule',
            element: ControlModuleEditPage,
            layout: 'app',
            permissions: [], // пусто => доступ всем
            groups: [], // пусто => доступ всем
            handle: {
              crumb: () => 'Модуль управления',
            },
          },
        ],
      },
      {
        path: 'create',
        name: 'controlModule',
        element: ControlModuleCreatePage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        handle: {
          crumb: () => 'Модуль управления',
        },
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
