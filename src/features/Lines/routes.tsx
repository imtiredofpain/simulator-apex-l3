import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';
import { PATHS } from '@shared/config/pathRoute';

const LinesPage = lazy(
  async () => await import('./').then((m) => ({ default: m.LinesPage }))
);
const LinePage = lazy(
  async () => await import('./').then((m) => ({ default: m.LinePage }))
);

const LineCreate = lazy(
  async () => await import('./').then((m) => ({ default: m.LineCreate }))
);

const LineEdit = lazy(
  async () => await import('./').then((m) => ({ default: m.LineEdit }))
);

export const LinesRoutes = [
  {
    path: PATHS.lines.main,
    name: 'lines',
    element: LinesPage,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    handle: {
      crumb: () => 'Линии',
    },
    children: [
      {
        path: ':id',
        name: 'lines',
        element: LinePage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        handle: {
          crumb: () => 'Линия',
        },
        children: [
          {
            path: 'edit',
            name: 'lines',
            element: LineEdit,
            layout: 'app',
            permissions: [], // пусто => доступ всем
            groups: [], // пусто => доступ всем
            handle: {
              crumb: () => 'Изменение линии',
            },
          },
        ],
      },
      {
        path: 'create',
        name: 'lines',
        element: LineCreate,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
