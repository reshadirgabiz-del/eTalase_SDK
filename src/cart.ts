import type { CartItem, Product, ProductVariant } from './types';

function itemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

function effectivePrice(item: CartItem): number {
  if (item.variant) {
    return item.variant.discountedPrice ?? item.variant.price;
  }
  return item.product.discountedPrice ?? item.product.price;
}

export interface CartManagerOptions {
  storeId: string;
  persist?: boolean;
}

export class CartManager {
  private _items: CartItem[] = [];
  private readonly _listeners = new Set<() => void>();
  private readonly _storageKey: string;
  private readonly _persist: boolean;

  constructor(options: CartManagerOptions) {
    this._storageKey = `etalase-cart-${options.storeId}`;
    this._persist = options.persist ?? false;
    if (this._persist) this._hydrate();
  }

  private _hydrate(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) this._items = JSON.parse(raw) as CartItem[];
    } catch {
      // ignore corrupt storage
    }
  }

  private _save(): void {
    if (!this._persist || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._items));
    } catch {
      // ignore quota errors
    }
  }

  private _notify(): void {
    this._listeners.forEach((cb) => cb());
  }

  subscribe(cb: () => void): void {
    this._listeners.add(cb);
  }

  unsubscribe(cb: () => void): void {
    this._listeners.delete(cb);
  }

  addItem(product: Product, quantity = 1, variant?: ProductVariant): void {
    const key = itemKey(product.id, variant?.id);
    const existing = this._items.find(
      (i) => itemKey(i.product.id, i.variant?.id) === key,
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      this._items.push({ product, variant, quantity });
    }
    this._save();
    this._notify();
  }

  removeItem(key: string): void {
    this._items = this._items.filter(
      (i) => itemKey(i.product.id, i.variant?.id) !== key,
    );
    this._save();
    this._notify();
  }

  updateQuantity(key: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(key);
      return;
    }
    this._items = this._items.map((i) =>
      itemKey(i.product.id, i.variant?.id) === key ? { ...i, quantity } : i,
    );
    this._save();
    this._notify();
  }

  clear(): void {
    this._items = [];
    this._save();
    this._notify();
  }

  getItems(): CartItem[] {
    return [...this._items];
  }

  getTotal(): number {
    return this._items.reduce((sum, i) => sum + effectivePrice(i) * i.quantity, 0);
  }

  getItemCount(): number {
    return this._items.reduce((sum, i) => sum + i.quantity, 0);
  }

  getTotalWeightGrams(): number {
    return this._items.reduce(
      (sum, i) => sum + (i.product.weightGrams ?? 500) * i.quantity,
      0,
    );
  }

  toCheckoutItems(): { productId: string; variantId?: string; quantity: number }[] {
    return this._items.map((i) => ({
      productId: i.product.id,
      ...(i.variant ? { variantId: i.variant.id } : {}),
      quantity: i.quantity,
    }));
  }
}
