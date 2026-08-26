import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { buildRoutes } from "./assemble";
import { SignInRoutes } from "@features/Auth";

import { LinesRoutes } from "@features/Lines";
import { OrganizationsRoutes } from "@features/Organizations";
import { ControlModulesRoutes } from "@features/ControlModules";
import { ProductsRoutes } from "@features/Products";
import { ApiLogsRoutes } from "@features/ApiLogs";
import { TasksRoutes } from "@features/Tasks";
import { PackagesRoutes } from "@features/Packages";
import { ReportsRoutes } from "@features/Reports";
import { MaterialsRoutes } from "@features/Materials";
import { PacksRoutes } from "@features/Packs";
import { CodeGenerationRoutes } from "@features/CodeGeneration";
import { DashboardRoutes } from "@features/Dashboard";
import { HomeRoutes } from "./home";

export const routesConfig = [
  ...HomeRoutes,
  ...LinesRoutes,
  ...OrganizationsRoutes,
  ...ControlModulesRoutes,
  ...SignInRoutes,
  ...ProductsRoutes,
  ...ApiLogsRoutes,
  ...TasksRoutes,
  ...PackagesRoutes,
  ...ReportsRoutes,
  ...MaterialsRoutes,
  ...PacksRoutes,
  ...DashboardRoutes,
  ...CodeGenerationRoutes,
];

const routes: RouteObject[] = buildRoutes(routesConfig);

export const router = createBrowserRouter(routes);
