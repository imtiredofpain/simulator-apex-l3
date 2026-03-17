import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';

const ProductsPage = lazy(
  async () => await import('./').then((m) => ({ default: m.Products }))
);

const ProductPage = lazy(
  async () => await import('./').then((m) => ({ default: m.Product }))
);

const CreateProductPage = lazy(
  async () => await import('./').then((m) => ({ default: m.CreateProduct }))
);

const EditProductPage = lazy(
  async () => await import('./').then((m) => ({ default: m.EditProduct }))
);

export const ProductsRoutes = [
  {
    path: PATHS.products.main,
    name: 'products',
    element: ProductsPage,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    meta: {
      innRequired: true,
    },
    handle: {
      crumb: () => 'Продукты',
    },
    children: [
      {
        path: ':id',
        name: 'products',
        element: ProductPage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => 'Продукт',
        },
        children: [
          {
            path: 'edit',
            name: 'products',
            element: EditProductPage,
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
        name: 'products',
        element: CreateProductPage,
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
