import { createProductsApi } from './api/products';
import { createStoreApi } from './api/store';
import { createDeliveryApi } from './api/delivery';
import { createOrdersApi } from './api/orders';
import { createPromoApi } from './api/promo';
import { createOrderLinksApi } from './api/order-links';
import { CartManager } from './cart';

export interface EtalaseClientOptions {
  apiUrl: string;
  storeId: string;
  persist?: boolean;
}

export class EtalaseClient {
  readonly products: ReturnType<typeof createProductsApi>;
  readonly store: ReturnType<typeof createStoreApi>;
  readonly delivery: ReturnType<typeof createDeliveryApi>;
  readonly orders: ReturnType<typeof createOrdersApi>;
  readonly promo: ReturnType<typeof createPromoApi>;
  readonly orderLinks: ReturnType<typeof createOrderLinksApi>;
  readonly cart: CartManager;

  constructor({ apiUrl, storeId, persist }: EtalaseClientOptions) {
    const base = apiUrl.replace(/\/$/, '');
    this.products = createProductsApi(base, storeId);
    this.store = createStoreApi(base, storeId);
    this.delivery = createDeliveryApi(base, storeId);
    this.orders = createOrdersApi(base);
    this.promo = createPromoApi(base, storeId);
    this.orderLinks = createOrderLinksApi(base);
    this.cart = new CartManager({ storeId, persist });
  }
}
