import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints('control-modules');
export const controlModulesEndpoints = E((e) => ({
  list: e.get('list', 'v1/control-modules').tag('control-modules:list'),
  byId: e.get('byId', 'v1/control-modules/:id').tag('control-modules:byId'),
  create: e
    .post('create', 'v1/control-modules')
    .tag('control-modules:create')
    .deps([tag('control-modules:list')]),
  update: e
    .patch('update', 'v1/control-modules/:id')
    .deps([tag('control-modules:byId'), tag('control-modules:list')]),
}));
