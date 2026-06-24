import type { EtalaseApiClient } from './client';
import type { PublicStoreInfo, PublicSettings, StoreInformation } from '../types';

type RawRecord = Record<string, unknown>;

function pickString(obj: RawRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return '';
}

function pickBoolean(obj: RawRecord, fallback: boolean, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'boolean') return value;
  }
  return fallback;
}

function pickNumber(obj: RawRecord, fallback: number, ...keys: string[]): number {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return fallback;
}

function normalizeStoreInfo(raw: RawRecord | null): PublicStoreInfo | null {
  if (!raw) return null;
  const storeName = pickString(raw, 'storeName', 'store_name', 'name');
  const storePhotoUrl = pickString(raw, 'storePhotoUrl', 'store_photo_url', 'logoUrl', 'storeLogo');
  if (!storeName && !storePhotoUrl) return null;
  return {
    storeName,
    ...(storePhotoUrl ? { storePhotoUrl } : {}),
  };
}

function normalizeSocialLinks(raw: unknown): PublicSettings['socialLinks'] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is RawRecord => !!item && typeof item === 'object')
    .map((item) => ({
      platform: pickString(item, 'platform', 'name', 'type'),
      url: pickString(item, 'url', 'href', 'link'),
    }))
    .filter((item) => item.platform && item.url);
}

function normalizeSettings(raw: RawRecord | null): PublicSettings | null {
  if (!raw) return null;
  return {
    storeName: pickString(raw, 'storeName', 'store_name', 'name'),
    storeDescription: pickString(raw, 'storeDescription', 'store_description', 'description'),
    logoUrl: pickString(raw, 'logoUrl', 'logo_url', 'storeLogo', 'store_logo'),
    originAddress: pickString(raw, 'originAddress', 'origin_address'),
    hideLocation: pickBoolean(raw, false, 'hideLocation', 'hide_location'),
    midtransEnabled: pickBoolean(raw, false, 'midtransEnabled', 'midtrans_enabled'),
    bankTransferEnabled: pickBoolean(raw, false, 'bankTransferEnabled', 'bank_transfer_enabled'),
    bankTransferText: pickString(raw, 'bankTransferText', 'bank_transfer_text'),
    bankAccountNumber: pickString(raw, 'bankAccountNumber', 'bank_account_number'),
    bankRecipientName: pickString(raw, 'bankRecipientName', 'bank_recipient_name'),
    bankName: pickString(raw, 'bankName', 'bank_name'),
    currency: pickString(raw, 'currency') || 'IDR',
    flatRateDeliveryEnabled: pickBoolean(raw, false, 'flatRateDeliveryEnabled', 'flat_rate_delivery_enabled'),
    flatRateDeliveryPrice: pickNumber(raw, 0, 'flatRateDeliveryPrice', 'flat_rate_delivery_price'),
    flatRateDeliveryName: pickString(raw, 'flatRateDeliveryName', 'flat_rate_delivery_name'),
    socialLinks: normalizeSocialLinks(raw.socialLinks ?? raw.social_links),
  };
}

export function createStoreApi(apiClient: EtalaseApiClient, _storeKey: string) {
  const getInfo = async (): Promise<PublicStoreInfo | null> => {
    const raw = await apiClient.request<RawRecord | null>('/stores/public');
    return normalizeStoreInfo(raw);
  };

  const getSettings = async (): Promise<PublicSettings | null> => {
    const raw = await apiClient.request<RawRecord | null>('/settings/public');
    return normalizeSettings(raw);
  };

  return {
    getInfo,
    getSettings,
    getInformation: async (): Promise<StoreInformation> => {
      const [info, settings] = await Promise.all([getInfo(), getSettings()]);
      return { info, settings };
    },
  };
}
