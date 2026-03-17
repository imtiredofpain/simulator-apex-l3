import { assembleEndpoints } from "@shared/api/endpoints/assemble";
import { authEndpoints } from "@features/Auth/endpoints";
import { statusEndpoints } from "@features/Status";
import getAxios from "./http";
import { linesEndpoints } from "@features/Lines";
import { controlModulesEndpoints } from "@features/ControlModules";
import { organizationsEndpoints } from "@features/Organizations";
import { productsEndpoints } from "@features/Products";
import { apiLogsEndpoints } from "@features/ApiLogs";
import { enumsEndpoints } from "./hooks/enums/endpoints";
import { packagesEndpoints } from "@features/Packages";
import { tasksEndpoints } from "@features/Tasks";
import { materialsEndpoints } from "@features/Materials";
import { documentsEndpoints } from "@features/Reports";
import { packsEndpoints } from "@features/Packs";
import { codeGenerationEndpoints } from "@features/CodeGeneration";

export const endpoints = assembleEndpoints({
  auth: authEndpoints,
  status: statusEndpoints,
  lines: linesEndpoints,
  packages: packagesEndpoints,
  tasks: tasksEndpoints,
  materials: materialsEndpoints,
  controlModules: controlModulesEndpoints,
  organizations: organizationsEndpoints,
  products: productsEndpoints,
  apiLogs: apiLogsEndpoints,
  enums: enumsEndpoints,
  documents: documentsEndpoints,
  packs: packsEndpoints,
  codeGeneration: codeGenerationEndpoints,
} as const);

export const http = getAxios();
export type Endpoints = typeof endpoints;
