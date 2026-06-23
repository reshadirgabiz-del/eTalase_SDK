import type { EtalaseApiClient } from './client';
import type { Product, PaginatedResponse, ProductImage, ProductPhotoSummary, ProductVariant } from '../types';

type RawRecord = Record<string, unknown>;

function pickString(obj: RawRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return '';
}

function pickNumber(obj: RawRecord, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function normalizeProductImage(raw: RawRecord, fallbackIndex: number): ProductImage {
  const id = pickString(raw, 'id') || `image-${fallbackIndex}`;
  const imageUrl = pickString(raw, 'imageUrl', 'image_url', 'url', 'src');
  const sortOrder = pickNumber(raw, 'sortOrder', 'sort_order', 'position') ?? fallbackIndex;
  const isThumbnail =
    typeof raw.isThumbnail === 'boolean'
      ? (raw.isThumbnail as boolean)
      : typeof raw.is_thumbnail === 'boolean'
        ? (raw.is_thumbnail as boolean)
        : fallbackIndex === 0;

  return { id, imageUrl, isThumbnail, sortOrder };
}

function normalizeProductVariant(raw: RawRecord): ProductVariant {
  return {
    id: pickString(raw, 'id'),
    name: pickString(raw, 'name'),
    sku: (raw.sku as string | null | undefined) ?? null,
    price: pickNumber(raw, 'price') ?? 0,
    discountedPrice:
      (pickNumber(raw, 'discountedPrice', 'discounted_price', 'compareAtPrice', 'compare_at_price') ??
        null) as number | null,
    stock: pickNumber(raw, 'stock') ?? 0,
    sortOrder: pickNumber(raw, 'sortOrder', 'sort_order', 'position') ?? 0,
    isActive:
      typeof raw.isActive === 'boolean'
        ? (raw.isActive as boolean)
        : typeof raw.is_active === 'boolean'
          ? (raw.is_active as boolean)
          : true,
  };
}

function normalizeProduct(raw: RawRecord): Product {
  const rawImages = Array.isArray(raw.images) ? (raw.images as RawRecord[]) : [];
  const images = rawImages.map((img, i) => normalizeProductImage(img, i));

  // Pick a representative imageUrl: prefer an explicit top-level field, otherwise
  // the first image with a non-empty URL.
  const topLevelImageUrl = pickString(raw, 'imageUrl', 'image_url', 'thumbnailUrl', 'thumbnail_url');
  const imageUrl = topLevelImageUrl || images.find((img) => img.imageUrl)?.imageUrl || '';

  // Promote the root-level `category` string into the tags array so existing
  // tag-based filters cover both shapes.
  const rawTags = Array.isArray(raw.tags) ? (raw.tags as unknown[]).filter((t) => typeof t === 'string') as string[] : [];
  const category = typeof raw.category === 'string' && raw.category.length > 0 ? raw.category : null;
  const tags = category && !rawTags.includes(category) ? [category, ...rawTags] : rawTags;

  const rawVariants = Array.isArray(raw.variants) ? (raw.variants as RawRecord[]) : [];

  return {
    id: pickString(raw, 'id'),
    name: pickString(raw, 'name'),
    sku: (raw.sku as string | null | undefined) ?? null,
    subtitle: (raw.subtitle as string | null | undefined) ?? null,
    description: pickString(raw, 'description'),
    price: pickNumber(raw, 'price') ?? 0,
    discountedPrice:
      (pickNumber(raw, 'discountedPrice', 'discounted_price', 'compareAtPrice', 'compare_at_price') ??
        null) as number | null,
    imageUrl,
    stock: pickNumber(raw, 'stock') ?? 0,
    tags,
    isActive:
      typeof raw.isActive === 'boolean'
        ? (raw.isActive as boolean)
        : typeof raw.is_active === 'boolean'
          ? (raw.is_active as boolean)
          : true,
    weightGrams:
      pickNumber(raw, 'weightGrams', 'weight_grams', 'weight') ?? 500,
    images,
    variants: rawVariants.map(normalizeProductVariant),
    createdAt: pickString(raw, 'createdAt', 'created_at'),
    updatedAt: pickString(raw, 'updatedAt', 'updated_at'),
  };
}

function normalizePaginated(
  raw: Record<string, unknown>,
): PaginatedResponse<Product> {
  const data = Array.isArray(raw.data) ? (raw.data as RawRecord[]).map(normalizeProduct) : [];

  // Backend may return either `{ total, page, limit }` flat or `{ pagination: { total, page, limit } }`.
  const pagination =
    raw.pagination && typeof raw.pagination === 'object'
      ? (raw.pagination as RawRecord)
      : raw;

  return {
    data,
    total: pickNumber(pagination, 'total') ?? data.length,
    page: pickNumber(pagination, 'page') ?? 1,
    limit: pickNumber(pagination, 'limit') ?? data.length,
  };
}

function getProductPhotos(product: Product): ProductImage[] {
  const photos = product.images ? [...product.images] : [];
  if (product.imageUrl && !photos.some((photo) => photo.imageUrl === product.imageUrl)) {
    photos.unshift({
      id: `${product.id}:main`,
      imageUrl: product.imageUrl,
      isThumbnail: true,
      sortOrder: 0,
    });
  }

  return photos;
}

function toProductPhotoSummary(product: Product): ProductPhotoSummary {
  return {
    productId: product.id,
    productName: product.name,
    photos: getProductPhotos(product),
  };
}

export function createProductsApi(apiClient: EtalaseApiClient, storeKey: string) {
  const list = async (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams({ storeId: storeKey });
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const res = await apiClient.request<Record<string, unknown>>(`/products?${qs}`);
    return normalizePaginated(res);
  };

  return {
    list,

    get: async (id: string) => {
      const raw = await apiClient.request<RawRecord>(`/products/${id}`);
      return normalizeProduct(raw);
    },

    listPhotos: async (params?: { page?: number; limit?: number }) => {
      const res = await list(params);
      return { ...res, data: res.data.map(toProductPhotoSummary) };
    },

    getPhotos: async (id: string) => {
      const raw = await apiClient.request<RawRecord>(`/products/${id}`);
      return toProductPhotoSummary(normalizeProduct(raw));
    },
  };
}
