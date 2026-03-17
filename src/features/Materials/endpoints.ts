import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints("materials");
export const materialsEndpoints = E((e) => ({
  list: e.get("list", "v1/materials").tag("materials:list"),
  create: e.post("create", "v1/materials").deps([tag("materials:list")]),
  byId: e.get("byId", "v1/materials/:id").tag("materials:byId"),
  update: e
    .patch("update", "v1/materials/:id")
    .deps([tag("materials:byId"), tag("materials:list")]),
}));
