import { defineEndpoints, tag } from '@shared/api/endpoints/builder';
import type { ApiEnvelope } from '@shared/api/contracts';
import type {
  IResponseUserSessionCheck,
  IUserLogin,
} from '@shared/types/users';

const E = defineEndpoints('auth');

export const authEndpoints = E((e) => ({
  login: e
    .post('login', 'v1/auth/login')
    .body<IUserLogin>()
    .response<ApiEnvelope<string>>()
    .tag('auth:login'),

  current: e
    .get('me', 'v1/users/current')
    .response<ApiEnvelope<IUserLogin>>()
    .tag('auth:current')
    .deps([tag('auth:login')]),

  logout: e
    .delete('logout', 'v1/auth/logout')
    .response<ApiEnvelope<void>>()
    .tag('auth:logout'),

  check: e
    .get('check', 'v1/auth/check')
    .response<ApiEnvelope<IResponseUserSessionCheck>>()
    .tag('auth:check'),
}));
