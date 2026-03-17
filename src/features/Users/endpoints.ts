import { defineEndpoints } from '@shared/api/endpoints/builder';
import type { ApiEnvelope } from '@shared/api/contracts';

const E = defineEndpoints('users');

export const usersEndpoints = E((e) => ({
  me: e
    .get('current', '/users/current')
    .response<ApiEnvelope<string>>()
    .tag('users:current'),
}));
