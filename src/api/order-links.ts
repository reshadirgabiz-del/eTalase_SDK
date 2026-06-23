import type { EtalaseApiClient } from './client';
import type { OrderLinkPublic } from '../types';

export function createOrderLinksApi(apiClient: EtalaseApiClient) {
  return {
    getPublic: (linkId: string) =>
      apiClient.request<OrderLinkPublic>(`/order-links/${linkId}/public`),
  };
}
