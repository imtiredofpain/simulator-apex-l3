import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';

const OrganizationsPage = lazy(
  async () => await import('./').then((m) => ({ default: m.OrganizationsPage }))
);

const OrganizationPage = lazy(
  async () => await import('./').then((m) => ({ default: m.Organization }))
);

export const OrganizationsRoutes = [
  {
    path: PATHS.organizations.main,
    name: 'organizations',
    element: OrganizationsPage,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    handle: {
      crumb: () => 'Организации',
    },
    children: [
      {
        path: ':id',
        name: 'organizations',
        element: OrganizationPage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        handle: {
          crumb: () => 'Организация',
        },
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
