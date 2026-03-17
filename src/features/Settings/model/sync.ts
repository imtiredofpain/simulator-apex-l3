import type {
  ApiResult,
  GetSettingsResponse,
  PatchSettingRequest,
  PatchSettingResponse,
} from '@shared/types/api';

export interface SyncAdapter {
  getAll(): Promise<ApiResult<GetSettingsResponse>>;
  patch<T>(
    payload: PatchSettingRequest<T>
  ): Promise<ApiResult<PatchSettingResponse<T>>>;
}

export class NullSyncAdapter implements SyncAdapter {
  async getAll(): Promise<ApiResult<GetSettingsResponse>> {
    return { ok: false, error: 'Backend is not ready' };
  }
  async patch<T>(): // _payload: PatchSettingRequest<T>
  Promise<ApiResult<PatchSettingResponse<T>>> {
    return { ok: false, error: 'Backend is not ready' };
  }
}

export const syncAdapter: SyncAdapter = new NullSyncAdapter();
