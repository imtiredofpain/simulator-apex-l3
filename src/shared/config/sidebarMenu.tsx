import {
  ClipboardList,
  Group,
  LogsIcon,
  Package,
  ShoppingBasketIcon,
  Shredder,
  SlidersHorizontal,
  SquareSquare,
  BarChart3,
} from "lucide-react";
import type {
  SidebarGroupComponentItem,
  SidebarGroupItem,
  SidebarSimpleItem,
} from "@shared/navigation/types";
import { PATHS } from "./pathRoute";
import { ReportsSideBarList } from "@features/Reports";

export const sidebarMenuConfig: {
  simple: SidebarSimpleItem[];
  groups?: SidebarGroupItem[];
  async?: SidebarGroupComponentItem[];
} = {
  simple: [
    {
      title: "Задания",
      icon: ClipboardList,
      to: PATHS.tasks.main,
    },
    {
      title: "Материалы",
      icon: Group,
      to: PATHS.materials.main,
    },
    {
      title: "Упаковка",
      icon: Package,
      to: PATHS.packages.main,
    },
    {
      title: "Продукция",
      icon: ShoppingBasketIcon,
      to: PATHS.products.main,
    },
    {
      title: "ApiLogs",
      icon: LogsIcon,
      to: PATHS.apiLogs.main,
    },
  ],
  groups: [
    {
      title: "Конфигурация",
      icon: SlidersHorizontal,
      children: [
        {
          title: "Организация",
          to: PATHS.organizations.main,
        },
        {
          title: "Модули управления",
          to: PATHS.controlModules.main,
        },
        {
          title: "Линии",
          to: PATHS.lines.main,
        },
      ],
    },
    {
      title: "Пакеты",
      icon: SquareSquare,
      children: [
        {
          title: "Список пакетов",
          to: PATHS.packs.main,
        },
        {
          title: "Статистика",
          icon: BarChart3,
          to: PATHS.packs.stats,
        },
      ],
    },
  ],
  async: [
    {
      title: "Отчёты",
      icon: Shredder,
      to: PATHS.reports.main,
      component: ReportsSideBarList,
    },
  ],
} as const;
