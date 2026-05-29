import type { RouteConfig } from '@shared/navigation/types';
import { lazy } from 'react';
import { PATHS } from '@shared/config/pathRoute';

const ScriptsPage = lazy(
  async () => await import('./').then((m) => ({ default: m.ScriptsPage }))
);
const ScriptDetail = lazy(
  async () => await import('./').then((m) => ({ default: m.ScriptDetail }))
);
const ScriptCreate = lazy(
  async () => await import('./').then((m) => ({ default: m.ScriptCreate }))
);
const ScriptEdit = lazy(
  async () => await import('./').then((m) => ({ default: m.ScriptEdit }))
);
const GeneratePage = lazy(
  async () => await import('./').then((m) => ({ default: m.GeneratePage }))
);
const DashboardPage = lazy(
  async () => await import('./ui/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

export const CodeGenerationRoutes = [
  {
    path: PATHS.dashboard,
    name: 'systemDashboard',
    element: DashboardPage,
    layout: 'app',
    permissions: [],
    groups: [],
    handle: {
      crumb: () => 'Р”Р°С€Р±РѕСЂРґ СЃРёСЃС‚РµРјС‹',
    },
  },
  {
    path: PATHS.codeGeneration.main,
    name: 'codeGeneration',
    element: ScriptsPage,
    layout: 'app',
    permissions: [],
    groups: [],
    handle: {
      crumb: () => 'Генерация кодов',
    },
    children: [
      {
        path: ':id',
        name: 'codeGeneration',
        element: ScriptDetail,
        layout: 'app',
        permissions: [],
        groups: [],
        handle: {
          crumb: () => 'Скрипт',
        },
      },
      {
        path: ':id/edit',
        name: 'codeGeneration',
        element: ScriptEdit,
        layout: 'app',
        permissions: [],
        groups: [],
        handle: {
          crumb: () => 'Редактирование скрипта',
        },
      },
      {
        path: 'create',
        name: 'codeGeneration',
        element: ScriptCreate,
        layout: 'app',
        permissions: [],
        groups: [],
        handle: {
          crumb: () => 'Создание скрипта',
        },
      },
      {
        path: 'generate',
        name: 'codeGeneration',
        element: GeneratePage,
        layout: 'app',
        permissions: [],
        groups: [],
        handle: {
          crumb: () => 'Генерация',
        },
      },
    ],
  },
] as const satisfies readonly RouteConfig[];
