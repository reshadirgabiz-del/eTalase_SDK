import type { EtalaseApiClient } from './client';
import type { Order, CheckoutPayload, PublicOrderTracking } from '../types';

export function createOrdersApi(apiClient: EtalaseApiClient, _storeKey: string) {
  return {
    create: (payload: CheckoutPayload) =>
      apiClient.request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    track: (orderId: string, phone: string) => {
      const qs = new URLSearchParams({ orderId, phone });
      return apiClient.request<PublicOrderTracking>(`/orders/track?${qs}`);
    },

    submitProof: async (orderId: string, file: File, phone: string) => {
      const form = new FormData();
      form.append('file', file);
      form.append('phone', phone);
      return apiClient.request<{ success: boolean; proofUrl: string }>(`/orders/${orderId}/proof`, {
        method: 'POST',
        body: form,
      });
    },
  };
}
