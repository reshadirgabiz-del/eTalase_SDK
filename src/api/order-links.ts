import { request } from '../http';
import type { OrderLinkPublic } from '../types';

export function createOrderLinksApi(baseUrl: string) {
  return {
    getPublic: (linkId: string) =>
      request<OrderLinkPublic>(baseUrl, `/order-links/${linkId}/public`),
  };
}
