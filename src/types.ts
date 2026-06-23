export interface ProductImage {
  id: string;
  imageUrl: string;
  isThumbnail: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  discountedPrice?: number | null;
  stock: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  subtitle?: string | null;
  description: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl: string;
  stock: number;
  tags?: string[];
  isActive: boolean;
  weightGrams?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPhotoSummary {
  productId: string;
  productName: string;
  photos: ProductImage[];
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Address {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface DeliveryOption {
  courierId: string;
  courierName: string;
  courierCode: string;
  serviceName: string;
  serviceType: string;
  price: number;
  estimatedDays: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  sku?: string | null;
  price: number;
  quantity: number;
}

export interface AppliedPromoCode {
  code: string;
  discountAmount: number;
  appliesTo: string;
}

export interface BankDetails {
  bankTransferText: string;
  bankAccountNumber: string;
  bankRecipientName: string;
  bankName: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  paymentMethod: 'midtrans' | 'bank_transfer';
  items: OrderItem[];
  address: Address;
  deliveryOption: DeliveryOption;
  subtotal: number;
  deliveryFee: number;
  promoDiscount: number;
  total: number;
  midtransToken?: string;
  midtransRedirectUrl?: string;
  midtransClientKey?: string;
  bankDetails?: BankDetails | null;
  trackingNumber?: string;
  proofUrl?: string | null;
  appliedPromoCodes?: AppliedPromoCode[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPayload {
  storeId?: string;
  items: { productId: string; variantId?: string; quantity: number }[];
  address: Address;
  deliveryOption: DeliveryOption;
  promoCodes?: string[];
  paymentMethod?: 'midtrans' | 'bank_transfer';
}

export interface PublicSettings {
  storeName: string;
  storeDescription: string;
  logoUrl: string;
  originAddress: string;
  hideLocation: boolean;
  midtransEnabled: boolean;
  bankTransferEnabled: boolean;
  bankTransferText: string;
  bankAccountNumber: string;
  bankRecipientName: string;
  bankName: string;
  currency: string;
  flatRateDeliveryEnabled: boolean;
  flatRateDeliveryPrice: number;
  flatRateDeliveryName: string;
  socialLinks: { platform: string; url: string }[];
}

export interface PublicStoreInfo {
  storeName: string;
  storePhotoUrl?: string;
}

export interface StoreInformation {
  info: PublicStoreInfo | null;
  settings: PublicSettings | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PromoValidationResult {
  valid: { code: string; discountAmount: number; description: string }[];
  invalid: { code: string; reason: string }[];
  totalDiscount: number;
  finalTotal: number;
}

export interface PublicOrderTracking {
  id: string;
  status: OrderStatus;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  total: number;
  recipientName: string;
  destinationCity: string;
  destinationProvince: string;
  courier: { name: string; service: string };
  items: { productName: string; sku?: string | null; quantity: number }[];
  store: { name: string | null; photoUrl: string | null };
}

export interface OrderLinkPublicItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    stock: number;
  } | null;
}

export interface OrderLinkPublic {
  id: string;
  store_id: string;
  items: OrderLinkPublicItem[];
  expires_at: string | null;
  is_permanent: boolean;
  message: string | null;
  created_at: string;
}

export interface DeliveryEstimatePayload {
  destinationAddress: string;
  totalWeightGrams: number;
  locationId?: string;
}

export interface PromoValidatePayload {
  codes: string[];
  items: { productId: string; quantity: number }[];
  deliveryPrice: number;
}
