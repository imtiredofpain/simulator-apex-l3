import { defineEndpoints } from '@shared/api/endpoints/builder';
import type { ApiEnvelope } from '@shared/api/contracts';

const build = defineEndpoints('status');

export const statusEndpoints = build((e) => ({
  check: e
    .get('check', '/check/health')
    .response<ApiEnvelope>()
    .tag('status:check'),

  checkDataBase: e
    .get('check', '/check/db-connect')
    .response<ApiEnvelope>()
    .tag('status:check:db'),
}));
