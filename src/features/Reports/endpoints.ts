import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints("documents");
export const documentsEndpoints = E((e) => ({
  list: e.get("list", "v1/documents").tag("documents:list"),
  listTypes: e.get("listTypes", "v1/documents/types").tag("documents:listTypes"),
  create: e.post("create", "v1/documents").deps([tag("documents:list")]),
  byId: e.get("byId", "v1/documents/:id").tag("documents:byId"),
  update: e
    .patch("update", "v1/documents/:id")
    .deps([tag("documents:byId"), tag("documents:list")]),
  remove: e
    .delete("remove", "v1/admin/documents/:id")
    .tag("documents:remove")
    .deps([tag("documents:byId"), tag("documents:list")]),
}));
