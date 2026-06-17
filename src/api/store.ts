import { request } from '../http';
import type { PublicStoreInfo, PublicSettings } from '../types';

export function createStoreApi(baseUrl: string, storeId: string) {
  return {
    getInfo: () =>
      request<PublicStoreInfo | null>(baseUrl, `/stores/${storeId}/public`),

    getSettings: () =>
      request<PublicSettings | null>(baseUrl, `/settings/public?storeId=${storeId}`),
  };
}
