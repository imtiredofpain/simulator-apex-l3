import { defineEndpoints } from '@shared/api/endpoints/builder';

const build = defineEndpoints('enums');

export const enumsEndpoints = build((e) => ({
  list: e.get('list', 'v1/enums').tag('enums:list'),

  get: e
    .get('get', 'v1/enums/:name')
    .params<{ name: string }>()
    .tag('enums:get'),
}));
