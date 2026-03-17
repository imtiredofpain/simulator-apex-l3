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

export const routesConfig = [
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
];

const routes: RouteObject[] = buildRoutes(routesConfig);

export const router = createBrowserRouter(routes);
