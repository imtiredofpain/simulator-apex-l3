import {
  Accessibility,
  // AlertTriangle,
  // BarChart,
  // Bell,
  // Clock,
  // Code,
  Cpu,
  // Globe,
  // DollarSign,
  // Inbox,
  // Mail,
  // Monitor,
  // MousePointer2,
  // Plug,
  // Ruler,
  // ScanEye,
  Settings,
  // ShieldCheck,
  SwatchBook,
  User,
  Info,
  // PenTool,
  // Pencil,
  // Factory,
  // BriefcaseConveyorBelt,
  BicepsFlexed,
} from 'lucide-react';
import { zBoolean, zTheme } from './model/validation';
import type { SettingsTree, SettingsGroup, ThemeSetting } from './model/types';
import z from 'zod';

const appearance: SettingsGroup = {
  id: 'appearance',
  i18nKey: 'appearance.title',
  icon: SwatchBook,
  groups: {
    theme: {
      id: 'theme',
      i18nKey: 'appearance.theme.title',
      icon: SwatchBook,
      items: [
        {
          id: 'theme',
          type: 'theme',
          scope: 'local',
          defaultValue: 'system',
          i18nKey: 'appearance.theme.items.theme',
          schema: zTheme,
        } as ThemeSetting,
      ],
    },
    // cursor: {
    //   id: 'cursor',
    //   i18nKey: 'appearance.cursor.title',
    //   icon: MousePointer2,
    //   items: [
    //     {
    //       id: 'useSystemCursor',
    //       type: 'switch',
    //       scope: 'local',
    //       defaultValue: false,
    //       i18nKey: 'appearance.cursor.items.useSystemCursor',
    //       schema: zBoolean,
    //     },
    //     {
    //       id: 'smoothCursor',
    //       type: 'switch',
    //       scope: 'local',
    //       defaultValue: false,
    //       i18nKey: 'appearance.cursor.items.smoothCursor',
    //       schema: zBoolean,
    //     },
    //   ],
    // },
    universalAccessibility: {
      id: 'universalAccessibility',
      i18nKey: 'appearance.universalAccessibility.title',
      icon: Accessibility,
      items: [
        {
          id: 'switchLabel',
          type: 'switch',
          scope: 'local',
          defaultValue: false,
          i18nKey: 'appearance.universalAccessibility.items.switchLabel',
          schema: zBoolean,
          description:
            'Добавляет цветную метку и точку на переключателях, чтобы состояние («вкл.»/«выкл.») читалось быстрее.',
        },
        {
          id: 'zoomFactor',
          scope: 'local',
          type: 'custom',
          defaultValue: 1,
          i18nKey: 'appearance.universalAccessibility.items.zoomFactor',
          schema: z.number(),
          renderer: 'zoom-factor',
          description: 'Выберите удобный масштаб интерфейса.',
        },
      ],
    },
  },
};

// Безопасность
// const security: SettingsGroup = {
//   id: 'security',
//   i18nKey: 'security.title',
//   icon: ShieldCheck,
//   groups: {
//     // network: {
//     //   id: 'network',
//     //   i18nKey: 'security.network.title',
//     //   icon: Globe,
//     //   items: [
//     //     {
//     //       id: 'proxyExternalImages',
//     //       type: 'switch',
//     //       scope: 'local',
//     //       defaultValue: true,
//     //       i18nKey: 'security.network.items.proxyExternalImages',
//     //       description:
//     //         'Открывать внешние изображения через безопасный прокси, чтобы скрыть ваш IP-адрес и защититься от потенциально вредоносных источников.',
//     //       schema: zBoolean,
//     //     },
//     //   ],
//     // },
//     metricks: {
//       id: 'securityMetricks',
//       i18nKey: 'security.metricks.title',
//       icon: ScanEye,
//       items: [
//         {
//           id: 'switchMetricks',
//           type: 'switch',
//           scope: 'local',
//           defaultValue: true,
//           i18nKey: 'security.metricks.items.switchMetricks',
//           description:
//             'Анонимная аналитика о том, как используется интерфейс: открываемые разделы и функции, длительность сессии, время отклика. Помогает улучшать навигацию и производительность. Мы не собираем содержимое ваших проектов и персональные данные — только агрегированные события.',
//           schema: zBoolean,
//         },
//         {
//           id: 'switchErrors',
//           type: 'switch',
//           scope: 'local',
//           defaultValue: true,
//           i18nKey: 'security.metricks.items.switchErrors',
//           description:
//             'Автоматические отчёты о сбоях и исключениях: код и тип ошибки, технические логи (стек вызовов), версия приложения, браузер и ОС. Нужны, чтобы быстрее находить и исправлять проблемы. Содержимое ваших файлов не отправляется; потенциально чувствительные данные не сохраняются.',
//           schema: zBoolean,
//         },
//       ],
//     },
//   },
// };

// const notifications: SettingsGroup = {
//   id: 'notifications',
//   i18nKey: 'notifications.title',
//   icon: Bell,
//   groups: {
//     scriptIssues: {
//       id: 'scriptIssues',
//       i18nKey: 'notifications.scriptIssues.title',
//       icon: AlertTriangle,
//       items: [
//         {
//           id: 'scriptIssuesNotifications',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: ['email', 'web'],
//           i18nKey: 'notifications.scriptIssues.items.scriptIssuesNotifications',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     developerEmailing: {
//       id: 'developerEmailing',
//       i18nKey: 'notifications.developerEmailing.title',
//       icon: Mail,
//       items: [
//         {
//           id: 'developerEmailingNotifications',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: [],
//           i18nKey:
//             'notifications.developerEmailing.items.developerEmailingNotifications',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     monitoring: {
//       id: 'monitoring',
//       i18nKey: 'notifications.monitoring.title',
//       icon: Monitor,
//       items: [
//         {
//           id: 'monitoringAlerts',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: [],
//           i18nKey: 'notifications.monitoring.items.monitoringAlerts',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     billing: {
//       id: 'billing',
//       i18nKey: 'notifications.billing.title',
//       icon: DollarSign,
//       items: [
//         {
//           id: 'billingNotifications',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: ['email', 'web'],
//           i18nKey: 'notifications.billing.items.billingNotifications',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     usage: {
//       id: 'usage',
//       i18nKey: 'notifications.usage.title',
//       icon: BarChart,
//       items: [
//         {
//           id: 'usageAnomalyNotifications',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: ['email', 'web'],
//           i18nKey: 'notifications.usage.items.usageAnomalyNotifications',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     scriptDevelopment: {
//       id: 'scriptDevelopment',
//       i18nKey: 'notifications.scriptDevelopment.title',
//       icon: Code,
//       items: [
//         {
//           id: 'scriptDevelopmentNotifications',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: ['email'],
//           i18nKey:
//             'notifications.scriptDevelopment.items.scriptDevelopmentNotifications',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     scheduledRuns: {
//       id: 'scheduledRuns',
//       i18nKey: 'notifications.scheduledRuns.title',
//       icon: Clock,
//       items: [
//         {
//           id: 'scheduledRunsNotifications',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: [],
//           i18nKey:
//             'notifications.scheduledRuns.items.scheduledRunsNotifications',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     integrations: {
//       id: 'integrations',
//       i18nKey: 'notifications.integrations.title',
//       icon: Plug,
//       items: [
//         {
//           id: 'integrationFailureNotifications',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: ['email', 'web'],
//           i18nKey:
//             'notifications.integrations.items.integrationFailureNotifications',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//     otherEmailCommunication: {
//       id: 'otherEmailCommunication',
//       i18nKey: 'notifications.otherEmailCommunication.title',
//       icon: Inbox,
//       items: [
//         {
//           id: 'emailCommunicationPreferences',
//           type: 'checkbox',
//           scope: 'user',
//           defaultValue: [],
//           i18nKey:
//             'notifications.otherEmailCommunication.items.emailCommunicationPreferences',
//           schema: zStringArray,
//           options: [
//             { value: 'email', i18nKey: 'common.email' },
//             { value: 'web', i18nKey: 'common.web' },
//           ],
//         },
//       ],
//     },
//   },
// };

const general: SettingsGroup = {
  id: "general",
  i18nKey: "general.title",
  icon: Settings,
  groups: {
    performance: {
      id: "performance",
      i18nKey: "general.performance.title",
      tags: [
        "general.performance.tags.performance",
        "general.performance.tags.cpu",
        "general.performance.tags.system",
      ],
      icon: Cpu,
      items: [
        {
          id: "powerSavingMode",
          type: "select",
          scope: "local",
          defaultValue: "auto",
          i18nKey: "general.performance.items.powerSavingMode",
          schema: z.enum(["off", "auto", "on"]),
          options: [
            { value: "off", i18nKey: "common.off" },
            { value: "auto", i18nKey: "common.auto" },
            { value: "on", i18nKey: "common.on" },
          ],
          description:
            "Экономит ресурсы: уменьшает анимации, частоту обновления превью и фоновую активность. В режиме «Авто» включается при работе от батареи или высокой нагрузке.",
        },
        {
          id: "countItemsLogs",
          type: "select",
          scope: "local",
          defaultValue: "auto",
          i18nKey: "general.performance.items.countItemsLogs",
          schema: z.enum(["50", "100", "200", "500", "1000", "auto"]),
          options: [
            { value: "50", i18nKey: "common.50" },
            { value: "100", i18nKey: "common.100" },
            { value: "200", i18nKey: "common.200" },
            { value: "500", i18nKey: "common.500" },
            { value: "1000", i18nKey: "common.1k" },
            { value: "auto", i18nKey: "common.auto" },
          ],
          description:
            "Количество элементов, которые будут приходить в приложение за 1 запрос. Увеличивает скорость работы клиентского приложения, но увеличивает нагрузку на сервер L2.",
        },
      ],
    },
    quickTimeRangePresets: {
      id: "quickTimeRangePresets",
      i18nKey: "general.quickTimeRangePresets.title",
      tags: [
        "general.quickTimeRangePresets.tags.usability",
        "general.quickTimeRangePresets.tags.speed",
        "general.quickTimeRangePresets.tags.time",
      ],
      icon: BicepsFlexed,
      items: [
        {
          id: "tableDensityMode",
          type: "select",
          scope: "local",
          defaultValue: "comfortable",
          i18nKey: "general.quickTimeRangePresets.items.tableDensityMode",
          schema: z.enum(["comfortable", "compact"]),
          options: [
            { value: "comfortable", i18nKey: "common.tableDensityComfortable" },
            { value: "compact", i18nKey: "common.tableDensityCompact" },
          ],
          description:
            "Выберите режим отображения таблиц: «Обычный» — стандартные отступы и высота строк, «Компактный» — больше строк на экране за счёт уменьшенных отступов.",
        },
        {
          id: "defaultTabActive",
          type: "select",
          scope: "local",
          defaultValue: "info",
          i18nKey: "general.reports.items.defaultTabActive",
          schema: z.enum(["history", "info"]),
          options: [
            { value: "info", i18nKey: "common.tabs.info" },
            { value: "history", i18nKey: "common.tabs.history" },
          ],
          description:
            "Выберите вкладку по умолчанию в отчете. Эта вкладка будет активна при открытии отчета.",
        },
        {
          id: "showTimeRangeQuickPresets",
          type: "switch",
          scope: "local",
          defaultValue: true,
          i18nKey:
            "general.quickTimeRangePresets.items.showTimeRangeQuickPresets",
          schema: zBoolean,
          description:
            "Показывать быстрые пресеты в поле выбора диапазона времени. При включении отображаются только первые 4 пресета списка для максимально быстрого выбора.",
        },
      ],
    },
    // color: {
    //   id: 'color',
    //   i18nKey: 'general.color.title',
    //   icon: SwatchBook,
    //   items: [
    //     {
    //       id: 'colorFormat',
    //       type: 'select',
    //       scope: 'local',
    //       defaultValue: 'hex',
    //       i18nKey: 'general.color.items.colorFormat',
    //       schema: z.enum([
    //         'hex',
    //         'rgba',
    //         'hsla',
    //         'lab',
    //         'lch',
    //         'oklab',
    //         'oklch',
    //       ]),
    //       options: [
    //         { value: 'hex', i18nKey: 'common.hex' },
    //         { value: 'rgba', i18nKey: 'common.rgb' },
    //         { value: 'hsla', i18nKey: 'common.hsl' },
    //         { value: 'lab', i18nKey: 'common.lab' },
    //         { value: 'lch', i18nKey: 'common.lch' },
    //         { value: 'oklab', i18nKey: 'common.oklab' },
    //         { value: 'oklch', i18nKey: 'common.oklch' },
    //       ],
    //       description:
    //         'Формат отображения цвета в инспекторе, экспорте и в других местах.',
    //     },
    //     {
    //       id: 'includeHash',
    //       type: 'switch',
    //       scope: 'local',
    //       defaultValue: true,
    //       i18nKey: 'general.color.items.includeHash',
    //       schema: zBoolean,
    //       description: 'Включать символ # в HEX.',
    //     },
    //   ],
    // },
    // unitsAndFormats: {
    //   id: 'unitsAndFormats',
    //   i18nKey: 'general.unitsAndFormats.title',
    //   icon: Ruler,
    //   items: [
    //     {
    //       id: 'lengthUnit',
    //       type: 'select',
    //       scope: 'local',
    //       defaultValue: 'px',
    //       i18nKey: 'general.unitsAndFormats.items.lengthUnit',
    //       schema: z.enum(['px', 'pt', 'in', 'cm', 'mm']),
    //       options: [
    //         { value: 'px', i18nKey: 'common.px' },
    //         { value: 'pt', i18nKey: 'common.pt' },
    //         { value: 'in', i18nKey: 'common.in' },
    //         { value: 'cm', i18nKey: 'common.cm' },
    //         { value: 'mm', i18nKey: 'common.mm' },
    //       ],
    //       description:
    //         'Единицы длины по умолчанию для инструментов и инспектора.',
    //     },
    //     {
    //       id: 'angleUnit',
    //       type: 'select',
    //       scope: 'local',
    //       defaultValue: 'deg',
    //       i18nKey: 'general.unitsAndFormats.items.angleUnit',
    //       schema: z.enum(['deg', 'rad', 'grad', 'turn']),
    //       options: [
    //         { value: 'deg', i18nKey: 'common.deg' },
    //         { value: 'rad', i18nKey: 'common.rad' },
    //         { value: 'grad', i18nKey: 'common.grad' },
    //         { value: 'turn', i18nKey: 'common.turn' },
    //       ],
    //       description: 'Единицы для углов (повороты, градиенты и т. п.).',
    //     },
    //     {
    //       id: 'numericPrecision',
    //       type: 'select',
    //       scope: 'local',
    //       defaultValue: '2',
    //       i18nKey: 'general.unitsAndFormats.items.numericPrecision',
    //       schema: z.enum(['0', '1', '2', '3']),
    //       options: [
    //         { value: '0', i18nKey: 'common.precision0' },
    //         { value: '1', i18nKey: 'common.precision1' },
    //         { value: '2', i18nKey: 'common.precision2' },
    //         { value: '3', i18nKey: 'common.precision3' },
    //       ],
    //       description: 'Количество знаков после запятой для числовых значений.',
    //     },
    //     {
    //       id: 'subpixelRounding',
    //       type: 'select',
    //       scope: 'local',
    //       defaultValue: 'auto',
    //       i18nKey: 'general.unitsAndFormats.items.subpixelRounding',
    //       schema: z.enum(['none', 'round', 'floor', 'ceil', 'auto']),
    //       options: [
    //         { value: 'none', i18nKey: 'common.none' },
    //         { value: 'round', i18nKey: 'common.round' },
    //         { value: 'floor', i18nKey: 'common.floor' },
    //         { value: 'ceil', i18nKey: 'common.ceil' },
    //         { value: 'auto', i18nKey: 'common.auto' },
    //       ],
    //       description:
    //         'Как округлять субпиксельные значения при экспорте/копировании.',
    //     },
    //   ],
    // },
    // guides: {
    //   id: 'guides',
    //   i18nKey: 'general.guides.title',
    //   icon: Ruler,
    //   items: [
    //     {
    //       id: 'guideSnapEnabled',
    //       type: 'switch',
    //       scope: 'local',
    //       defaultValue: true,
    //       i18nKey: 'general.guides.items.guideSnapEnabled',
    //       schema: zBoolean,
    //       description:
    //         'Включает прилипание направляющих к точкам и линиям. Удерживайте Alt, чтобы временно инвертировать.',
    //     },
    //     {
    //       id: 'typeDots',
    //       type: 'select',
    //       scope: 'local',
    //       defaultValue: 'dots',
    //       i18nKey: 'general.guides.items.dots',
    //       schema: z.enum([
    //         'dots',
    //         'grid',
    //         'cross',
    //         'none',
    //       ]),
    //       options: [
    //         { value: 'dots', i18nKey: 'common.dots' },
    //         { value: 'grid', i18nKey: 'common.grid' },
    //         { value: 'cross', i18nKey: 'common.cross' },
    //         { value: 'none', i18nKey: 'common.none' },
    //       ],
    //       description:
    //         'Визуальные маркеры расстояния.',
    //     },
    //   ],
    // },
  },
};

// const manufacture: SettingsGroup = {
//   id: 'manufacture',
//   i18nKey: 'manufacture.title',
//   icon: Factory,
//   tags: ['manufacture.tags.global'],
//   groups: {
//     lines: {
//       id: 'lines',
//       i18nKey: 'lines.title',
//       icon: BriefcaseConveyorBelt,
//       items: [
//         {
//           id: 'linesDisplayMode',
//           type: 'select',
//           scope: 'local',
//           defaultValue: 'tasks',
//           i18nKey: 'manufacture.lines.items.sideLong',
//           schema: z.enum(['all', 'tasks', 'none']),
//           options: [
//             { value: 'none', i18nKey: 'manufacture.lines.none' },
//             { value: 'all', i18nKey: 'manufacture.lines.allLines' },
//             { value: 'tasks', i18nKey: 'manufacture.lines.onlyTasks' },
//           ],
//           description:
//             'Влияет то, по какой логике будет выводиться список линий в боковом меню',
//         },
//       ],
//     },
//   },
// };

const profile: SettingsGroup = {
  id: 'profile',
  i18nKey: 'profile.title',
  icon: User,
  sidebarRenderer: 'profile-card',
  renderer: 'profile-section',
  tags: ['profile.tags.profile', 'profile.tags.personal'],
};

const about: SettingsGroup = {
  id: 'about',
  i18nKey: 'about.title',
  icon: Info,
  renderer: 'profile-section',
};

export const settingsTree: SettingsTree = {
  groups: {
    profile,
    general,
    // manufacture,
    appearance,
    // security,
    'separator:1': true,
    about,
  },
};
