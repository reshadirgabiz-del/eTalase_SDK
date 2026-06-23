# eTalase SDK AI Agent Reference

Use this file when an AI agent needs to integrate, modify, or reason about the eTalase SDK.

## Package Purpose

This repository is a framework-agnostic TypeScript SDK for eTalase merchant-hosted storefronts. It acts like a storefront API client for product browsing, cart management, checkout, delivery estimates, promo validation, order tracking, order links, and payment proof upload.

It is not currently a React component library. It exports classes, factory functions, and TypeScript types from `src/index.ts`.

## Public Initialization Contract

Preferred usage:

```ts
import { EtalaseClient } from 'etalase-module';

const etalase = new EtalaseClient({
  storeKey: 'store_public_xxx',
  apiUrl: 'https://api.e-talase.com',
  persist: true,
});
```

Also available:

```ts
import { createEtalaseClient, ETalaseProvider, createETalaseProvider } from 'etalase-module';
```

`ETalaseProvider` is a lightweight framework-agnostic wrapper with a `.client` property. It is not a JSX/React provider.

## Configuration

- `storeKey: string` is required.
- `apiUrl?: string` is optional and defaults to `https://api.e-talase.com`.
- `persist?: boolean` enables localStorage cart persistence.
- `credentials?: RequestCredentials` should only be used if the backend requires cookie/session-based behavior. Otherwise omit it.

Missing `storeKey` must throw exactly:

```txt
eTalase SDK requires a public store key. Pass storeKey to ETalaseProvider.
```

## Request Contract

All backend requests must go through `src/api/client.ts`.

The API client must:

- Add `x-etalase-store-key: <storeKey>` to every request.
- Let the browser send the current website `Origin` automatically.
- Avoid manually setting `Origin`.
- Avoid setting `Access-Control-Allow-Origin`; that is a backend response header.
- Avoid `mode: "no-cors"`.
- Avoid backend secret keys.
- Use `credentials` only when explicitly configured.

Important implementation file:

```txt
src/api/client.ts
```

## Backend Security Model

The backend should validate:

- public store key from `x-etalase-store-key`
- browser request origin from `Origin`
- whether the origin is verified for that store

The backend should not use wildcard CORS for merchant storefront requests. It should return CORS headers for the exact verified origin.

The SDK must not:

- verify merchant domains itself
- bypass CORS
- require one deployment per merchant
- expose secret keys

## Error Contract

Unauthorized domain message:

```txt
This domain is not authorized for this eTalase store. Add and verify this domain in your eTalase dashboard.
```

Relevant exports:

```ts
EtalaseApiError
EtalaseNetworkError
UNAUTHORIZED_DOMAIN_MESSAGE
```

Notes:

- If the backend returns a readable 401 or 403 response, throw `EtalaseApiError` with the unauthorized-domain message.
- If the browser blocks access because of CORS, JavaScript may only see a failed fetch. Throw `EtalaseNetworkError` with a helpful message that includes the unauthorized-domain guidance.

## Exported API Surface

Main exports from `src/index.ts`:

- `EtalaseClient`
- `createEtalaseClient`
- `EtalaseApiClient`
- `ETalaseProvider`
- `createETalaseProvider`
- `DEFAULT_ETALASE_API_URL`
- `createEtalaseConfig`
- `CartManager`
- `EtalaseApiError`
- `EtalaseNetworkError`
- `UNAUTHORIZED_DOMAIN_MESSAGE`
- TypeScript domain types such as `Product`, `CartItem`, `DeliveryOption`, `Order`, `CheckoutPayload`, `PublicSettings`, `PublicOrderTracking`, and `PromoValidationResult`

Client properties:

- `etalase.products`
- `etalase.store`
- `etalase.delivery`
- `etalase.orders`
- `etalase.promo`
- `etalase.orderLinks`
- `etalase.cart`
- `etalase.api`

## API Modules

All factories should receive `EtalaseApiClient` rather than raw `baseUrl` strings.

- `src/api/products.ts`
  - `list({ page?, limit? })`
  - `get(id)`
- `src/api/store.ts`
  - `getInfo()`
  - `getSettings()`
- `src/api/delivery.ts`
  - `estimate(payload)`
- `src/api/promo.ts`
  - `validate(payload)`
- `src/api/orders.ts`
  - `create(payload)`
  - `track(orderId, phone)`
  - `submitProof(orderId, file, phone)`
- `src/api/order-links.ts`
  - `getPublic(linkId)`

## Checkout Notes

`CheckoutPayload.storeId` is optional for new integrations. The SDK injects the configured public store key into order creation request bodies for backend compatibility:

```ts
body: JSON.stringify({ ...payload, storeId: payload.storeId ?? storeKey })
```

Do not reintroduce a required `storeId` initialization option. The public initialization field is `storeKey`.

## Cart Notes

`CartManager` is local state only. It does not call the backend.

When `persist: true`, cart data is stored under:

```txt
etalase-cart-<storeKey>
```

## Testing Requirements

There is currently no automated test runner configured. Build verification:

```bash
npm run build
```

Manual domain checks:

- main eTalase app
- builder preview
- localhost with exact origin and port allowlisted
- merchant custom domain after backend approval
- unauthorized domain should fail with the clear unauthorized-domain message

See `docs/manual-testing.md` for the human checklist.

## Do Not Do

- Do not use wildcard CORS as an SDK solution.
- Do not manually set `Origin`.
- Do not add `Access-Control-Allow-Origin` request headers.
- Do not add `mode: "no-cors"`.
- Do not expose backend secret keys.
- Do not introduce React as a dependency unless the package intentionally becomes a React SDK.
- Do not route new backend calls around `EtalaseApiClient`.
