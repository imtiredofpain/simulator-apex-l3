export type SettingScope = 'local' | 'user' | 'project';

export interface ServerSettingItem<T> {
  id: string;
  value: T;
  updatedAt: string;
  scope: Exclude<SettingScope, 'local'>; // только user | project
  projectId?: string | null;
}

export interface GetSettingsResponse {
  items: Array<ServerSettingItem<unknown>>;
}

export interface PatchSettingRequest<T> {
  id: string;
  value: T;
  scope: Exclude<SettingScope, 'local'>;
  projectId?: string | null;
}

export interface PatchSettingResponse<T> extends ServerSettingItem<T> {}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
