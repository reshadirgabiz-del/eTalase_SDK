import type { EtalaseApiClient } from './client';
import type { DeliveryOption, DeliveryEstimatePayload } from '../types';

export function createDeliveryApi(apiClient: EtalaseApiClient, storeKey: string) {
  return {
    estimate: (payload: DeliveryEstimatePayload) =>
      apiClient.request<DeliveryOption[]>('/delivery/estimate', {
        method: 'POST',
        body: JSON.stringify({ storeId: storeKey, ...payload }),
      }),
  };
}
