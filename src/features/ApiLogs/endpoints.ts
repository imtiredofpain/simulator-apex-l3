import { defineEndpoints } from '@shared/api/endpoints/builder';

const E = defineEndpoints('apiLogs');
export const apiLogsEndpoints = E((e) => ({
  list: e.get('list', 'v1/integration-logs').tag('apiLogs:list'),
  byId: e.get('byId', 'v1/integration-logs/:id').tag('apiLogs:byId'),
}));
