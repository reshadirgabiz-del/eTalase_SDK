import { createProductsApi } from './api/products';
import { createStoreApi } from './api/store';
import { createDeliveryApi } from './api/delivery';
import { createOrdersApi } from './api/orders';
import { createPromoApi } from './api/promo';
import { createOrderLinksApi } from './api/order-links';
import { EtalaseApiClient } from './api/client';
import { CartManager } from './cart';
import { type EtalaseSdkConfigInput, createEtalaseConfig } from './config';

export interface EtalaseClientOptions extends EtalaseSdkConfigInput {
  apiUrl?: string;
  storeKey: string;
  persist?: boolean;
}

export class EtalaseClient {
  readonly api: EtalaseApiClient;
  readonly products: ReturnType<typeof createProductsApi>;
  readonly store: ReturnType<typeof createStoreApi>;
  readonly delivery: ReturnType<typeof createDeliveryApi>;
  readonly orders: ReturnType<typeof createOrdersApi>;
  readonly promo: ReturnType<typeof createPromoApi>;
  readonly orderLinks: ReturnType<typeof createOrderLinksApi>;
  readonly cart: CartManager;

  constructor({ apiUrl, storeKey, persist, credentials }: EtalaseClientOptions) {
    const config = createEtalaseConfig({ apiUrl, storeKey, credentials });
    this.api = new EtalaseApiClient(config);
    this.products = createProductsApi(this.api, config.storeKey);
    this.store = createStoreApi(this.api, config.storeKey);
    this.delivery = createDeliveryApi(this.api, config.storeKey);
    this.orders = createOrdersApi(this.api, config.storeKey);
    this.promo = createPromoApi(this.api, config.storeKey);
    this.orderLinks = createOrderLinksApi(this.api);
    this.cart = new CartManager({ storeKey: config.storeKey, persist });
  }
}

export function createEtalaseClient(options: EtalaseClientOptions): EtalaseClient {
  return new EtalaseClient(options);
}
