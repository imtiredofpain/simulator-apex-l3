import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';

const MaterialsPage = lazy(
  async () => await import('./').then((m) => ({ default: m.MaterialsList }))
);

const NoImplement = lazy(
  () => import('@shared/components/NoImplement/NoImplement')
);

// const ProductPage = lazy(
//   async () => await import('./').then((m) => ({ default: m.Product }))
// );

// const CreateProductPage = lazy(
//   async () => await import('./').then((m) => ({ default: m.CreateProduct }))
// );

// const EditProductPage = lazy(
//   async () => await import('./').then((m) => ({ default: m.EditProduct }))
// );

export const MaterialsRoutes = [
  {
    path: PATHS.materials.main,
    name: 'materials',
    element: MaterialsPage,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    meta: {
      innRequired: true,
    },
    handle: {
      crumb: () => 'Материалы',
    },
    children: [
      {
        path: ':id',
        name: 'material',
        element: NoImplement,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => 'Материал',
        },
        children: [
          {
            path: 'edit',
            name: 'edit material',
            element: NoImplement,
            layout: 'app',
            permissions: [], // пусто => доступ всем
            groups: [], // пусто => доступ всем
            meta: {
              innRequired: true,
            },
            handle: {
              crumb: () => 'Редактирование',
            },
          },
        ],
      },
      {
        path: 'create',
        name: 'create material',
        element: NoImplement,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => 'Создание',
        },
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
