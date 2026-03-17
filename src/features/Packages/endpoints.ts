import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints('package');
export const packagesEndpoints = E((e) => ({
  list: e.get('list', 'v1/package').tag('package:list'),
  byId: e.get('byId', 'v1/package/:id').tag('package:byId'),
  create: e
    .post('create', 'v1/package')
    .tag('package:create')
    .deps([tag('package:list')]),
  update: e
    .patch('update', 'v1/package/:id')
    .deps([tag('package:byId'), tag('package:list')]),
}));
