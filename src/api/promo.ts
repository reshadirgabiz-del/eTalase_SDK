import type { EtalaseApiClient } from './client';
import type { PromoValidationResult, PromoValidatePayload } from '../types';

export function createPromoApi(apiClient: EtalaseApiClient, storeKey: string) {
  return {
    validate: (payload: PromoValidatePayload) =>
      apiClient.request<PromoValidationResult>('/promo-codes/validate', {
        method: 'POST',
        body: JSON.stringify({ storeId: storeKey, ...payload }),
      }),
  };
}
