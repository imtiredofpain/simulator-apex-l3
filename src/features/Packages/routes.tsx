import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';

const PackagesPage = lazy(
  async () => await import('./').then((m) => ({ default: m.PackagesPage }))
);

const PackagePage = lazy(
  async () => await import('./').then((m) => ({ default: m.PackagePage }))
);

const NoImplement = lazy(
  () => import('@shared/components/NoImplement/NoImplement')
);

// const PackagePage = lazy(
//   async () => await import('./').then((m) => ({ default: m.Product }))
// );

const CreatePackagePage = lazy(
  async () => await import('./').then((m) => ({ default: m.CreatePackagePage }))
);

// const EditPackegePage = lazy(
//   async () => await import('./').then((m) => ({ default: m.EditProduct }))
// );

export const PackagesRoutes = [
  {
    path: PATHS.packages.main,
    name: 'packages',
    element: PackagesPage,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    meta: {
      innRequired: true,
    },
    handle: {
      crumb: () => 'Упаковки',
    },
    children: [
      {
        path: ':id',
        name: 'package',
        element: PackagePage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        handle: {
          crumb: () => 'Упаковка',
        },
        meta: {
          innRequired: true,
        },
        children: [
          {
            path: 'edit',
            name: 'edit package',
            element: NoImplement,
            layout: 'app',
            permissions: [], // пусто => доступ всем
            groups: [], // пусто => доступ всем
            meta: {
              innRequired: true,
            },
            handle: {
              crumb: () => 'Редактирование упаковки',
            },
          },
        ],
      },
      {
        path: 'create',
        name: 'create package',
        element: CreatePackagePage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => 'Создание упаковки',
        },
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
