import { defineEndpoints } from '@shared/api/endpoints/builder';

const E = defineEndpoints('organizations');
export const organizationsEndpoints = E((e) => ({
  list: e.get('list', 'v1/organizations').tag('organizations:list'),
}));
