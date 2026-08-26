import { defineEndpoints } from '@shared/api/endpoints/builder';

const E = defineEndpoints('dashboard');

export const dashboardEndpoints = E((e) => ({
  system: e.get('system', 'v1/admin/dashboard').tag('dashboard:system'),
}));
