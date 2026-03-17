import { defineEndpoints, tag } from "@shared/api/endpoints/builder";

const E = defineEndpoints("packs");
export const packsEndpoints = E((e) => ({
  list: e.get("list", "v1/packs").tag("packs:list"),
  byId: e.get("byId", "v1/packs/diagnostics/pack/:id").tag("packs:list"),
  statsByJob: e.get("statsByJob", "v1/packs/diagnostics/stats/job/:jobId").tag("packs:stats"),
}));
