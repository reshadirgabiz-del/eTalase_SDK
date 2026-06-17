import { request } from '../http';
import type { DeliveryOption, DeliveryEstimatePayload } from '../types';

export function createDeliveryApi(baseUrl: string, storeId: string) {
  return {
    estimate: (payload: DeliveryEstimatePayload) =>
      request<DeliveryOption[]>(baseUrl, '/delivery/estimate', {
        method: 'POST',
        body: JSON.stringify({ storeId, ...payload }),
      }),
  };
}
