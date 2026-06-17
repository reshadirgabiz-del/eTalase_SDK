import { request } from '../http';
import type { Order, CheckoutPayload, PublicOrderTracking } from '../types';

export function createOrdersApi(baseUrl: string) {
  return {
    create: (payload: CheckoutPayload) =>
      request<Order>(baseUrl, '/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    track: (orderId: string, phone: string) => {
      const qs = new URLSearchParams({ orderId, phone });
      return request<PublicOrderTracking>(baseUrl, `/orders/track?${qs}`);
    },

    submitProof: async (orderId: string, file: File, phone: string) => {
      const form = new FormData();
      form.append('file', file);
      form.append('phone', phone);
      const res = await fetch(`${baseUrl}/orders/${orderId}/proof`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error((err as { message?: string }).message ?? 'Upload failed');
      }
      return res.json() as Promise<{ success: boolean; proofUrl: string }>;
    },
  };
}
