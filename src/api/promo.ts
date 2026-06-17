import { request } from '../http';
import type { PromoValidationResult, PromoValidatePayload } from '../types';

export function createPromoApi(baseUrl: string, storeId: string) {
  return {
    validate: (payload: PromoValidatePayload) =>
      request<PromoValidationResult>(baseUrl, '/promo-codes/validate', {
        method: 'POST',
        body: JSON.stringify({ storeId, ...payload }),
      }),
  };
}
