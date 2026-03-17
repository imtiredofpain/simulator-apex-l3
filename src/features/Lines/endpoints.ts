import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints('lines');
export const linesEndpoints = E((e) => ({
  list: e.get('list', 'v1/lines').tag('lines:list'),
  create: e.post('create', 'v1/lines').deps([tag('lines:list')]),
  byId: e.get('byId', 'v1/lines/:id').tag('lines:byId'),
  update: e
    .patch('update', 'v1/lines/:id')
    .deps([tag('lines:byId'), tag('lines:list')]),
}));
