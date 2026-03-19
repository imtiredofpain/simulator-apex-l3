export const PATHS = {
  //Главная
  home: "/",

  // Линии
  lines: {
    main: "/lines",
    create: "/lines/create",
    byId: (id: string | number) => `/lines/${id}` as const,
    edit: (id: string | number) => `/lines/${id}/edit` as const,
  },

  // Конфигурация (группа без собственного пути)
  organizations: {
    main: "/organizations",
    create: "/organizations/create",
    byId: (id: string | number) => `/organizations/${id}` as const,
    edit: (id: string | number) => `/organizations/${id}/edit` as const,
  },

  // Модули управления
  controlModules: {
    main: "/controlmodules",
    create: "/controlmodules/create",
    byId: (id: string | number) => `/controlmodules/${id}` as const,
    edit: (id: string | number) => `/controlmodules/${id}/edit` as const,
  },

  products: {
    main: "/products",
    create: "/products/create",
    byId: (id: string | number) => `/products/${id}` as const,
    edit: (id: string | number) => `/products/${id}/edit` as const,
  },

  apiLogs: {
    main: "/api-logs",
    byId: (id: string | number) => `/api-logs/${id}` as const,
  },

  packages: {
    main: "/packages",
    create: "/packages/create",
    byId: (id: string | number) => `/packages/${id}` as const,
    edit: (id: string | number) => `/packages/${id}/edit` as const,
  },

  tasks: {
    main: "/tasks",
    create: "/tasks/create",
    byId: (id: string | number) => `/tasks/${id}` as const,
    edit: (id: string | number) => `/tasks/${id}/edit` as const,
  },

  users: "/users",

  // Авторизация
  signIn: "/sign-in",

  materials: {
    main: "/materials",
    create: "/materials/create",
    byId: (id: string | number) => `/materials/${id}` as const,
    edit: (id: string | number) => `/materials/${id}/edit` as const,
  },

  packs: {
    main: "/packs",
    create: "/packs/create",
    byId: (id: string | number) => `/packs/${id}` as const,
    edit: (id: string | number) => `/packs/${id}/edit` as const,
    stats: "/packs/stats",
  },

  //   roles: '/roles',
  //   settings: '/settings',

  //   // Склад
  //   warehouse: '/warehouse',
  //   nomenclature: '/nomenclature',
  //   stock: '/stock',

  //   // Задачи / производство
  //   tasks: '/tasks',
  //   task: (id: string) => `/tasks/${id}` as const,

  // Генерация кодов
  codeGeneration: {
    main: "/code-generation",
    create: "/code-generation/create",
    byId: (id: string | number) => `/code-generation/${id}` as const,
    edit: (id: string | number) => `/code-generation/${id}/edit` as const,
    generate: "/code-generation/generate",
  },

  // Отчёты
  reports: {
    main: "/reports",
    byId: (type: string, id: string | number) =>
      `/reports/${type}/${id}` as const,
    byType: (id: string | number) => `/reports/${id}` as const,
    edit: (id: string | number) => `/reports/${id}/edit` as const,
    create: "/reports/create",
  },

  //   // Справочники
  //   directories: {
  //     root: '/directories',
  //     equipment: '/directories/equipment',
  //     materials: '/directories/materials',
  //     defects: '/directories/defects',
  //   },

  //   // Админка (скрытая)
  //   admin: '/admin',
} as const;
