import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints('tasks');
export const tasksEndpoints = E((e) => ({
  list: e.get('list', 'v1/jobs').tag('jobs:list'),
  create: e.post('create', 'v1/jobs').deps([tag('jobs:list')]),
  byId: e.get('byId', 'v1/jobs/:id').tag('jobs:byId'),
  delete: e.delete('delete', 'v1/jobs/:id').tag('jobs:delete:byId'),
  update: e
    .patch('update', 'v1/jobs/:id')
    .deps([tag('jobs:byId'), tag('jobs:list')]),
  action: e.post('action', 'v1/jobs/:id/action').deps([tag('jobs:byId')]),
}));
