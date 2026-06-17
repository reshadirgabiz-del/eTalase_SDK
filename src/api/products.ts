import { request } from '../http';
import type { Product, PaginatedResponse } from '../types';

function normalizeProduct(raw: Record<string, unknown>): Product {
  return {
    ...(raw as unknown as Product),
    imageUrl: (raw.imageUrl as string) || (raw.image_url as string) || '',
    weightGrams: (raw.weightGrams as number) || (raw.weight_grams as number) || 500,
    images: (raw.images as Product['images']) ?? [],
    variants: (raw.variants as Product['variants']) ?? [],
  };
}

export function createProductsApi(baseUrl: string, storeId: string) {
  return {
    list: async (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams({ storeId });
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const res = await request<PaginatedResponse<Record<string, unknown>>>(
        baseUrl,
        `/products?${qs}`,
      );
      return { ...res, data: res.data.map(normalizeProduct) } as PaginatedResponse<Product>;
    },

    get: async (id: string) => {
      const raw = await request<Record<string, unknown>>(baseUrl, `/products/${id}`);
      return normalizeProduct(raw);
    },
  };
}
