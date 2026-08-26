import { PATHS } from '@shared/config/pathRoute';
import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';

const ListTasksPage = lazy(() => import('./ui/List'));
const TaskPage = lazy(() => import('./ui/Task'));
const TaskCreate = lazy(() => import('./ui/Create'));
const TaskEdit = lazy(() => import('./ui/Edit'));

export const TasksRoutes = [
  {
    path: PATHS.tasks.main,
    name: 'tasks',
    element: ListTasksPage,
    layout: 'app',
    permissions: [], // пусто => доступ всем
    groups: [], // пусто => доступ всем
    meta: {
      innRequired: true,
    },
    handle: {
      crumb: () => 'Задания',
    },
    children: [
      {
        path: ':id',
        name: 'task',
        element: TaskPage,
        layout: 'app',
        permissions: [], // пусто => доступ всем
        groups: [], // пусто => доступ всем
        meta: {
          innRequired: true,
        },
        handle: {
          crumb: () => 'Задание',
        },
        children: [
          {
            path: 'edit',
            name: 'task',
            element: TaskEdit,
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
        path: PATHS.tasks.create,
        name: 'create task',
        element: TaskCreate,
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
