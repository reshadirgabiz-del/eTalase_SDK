# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**eTalase Module** — a framework-agnostic TypeScript npm SDK that lets any custom webpage connect to the eTalase storefront API (browsing products, managing a cart, running checkout, tracking orders). It wraps the public endpoints of the eTalase NestJS backend without requiring Clerk auth or any frontend framework.

## Commands

```bash
npm install      # install devDependencies (typescript, tsup)
npm run build    # compile to dist/ (ESM + CJS + type declarations)
npm run dev      # watch mode build
```

## Architecture

### Entry points

- `src/index.ts` — barrel export: `EtalaseClient`, `CartManager`, `EtalaseApiError`, and all types
- `src/client.ts` — `EtalaseClient` class; constructor wires together all API objects and `CartManager`
- `src/cart.ts` — `CartManager`: plain class with `subscribe/unsubscribe` event emitter pattern, optional `localStorage` persistence keyed as `etalase-cart-<storeId>`
- `src/http.ts` — base `request<T>()` helper and `EtalaseApiError`
- `src/types.ts` — all TypeScript types derived from `jastip-live/src/lib/types.ts`

### API modules (`src/api/`)

Each file exports a factory `create*Api(baseUrl, storeId?)` that returns a bound object. `EtalaseClient` calls these in its constructor and exposes them as named properties:

| Property | File | Endpoints covered |
|---|---|---|
| `client.products` | `api/products.ts` | `GET /products`, `GET /products/:id` |
| `client.store` | `api/store.ts` | `GET /stores/:id/public`, `GET /settings/public` |
| `client.delivery` | `api/delivery.ts` | `POST /delivery/estimate` |
| `client.orders` | `api/orders.ts` | `POST /orders`, `GET /orders/track`, `POST /orders/:id/proof` |
| `client.promo` | `api/promo.ts` | `POST /promo-codes/validate` |
| `client.orderLinks` | `api/order-links.ts` | `GET /order-links/:id/public` |

### Build

tsup outputs `dist/index.js` (CJS), `dist/index.mjs` (ESM), and `dist/index.d.ts` / `dist/index.d.mts`. The `exports` field in `package.json` handles dual-module resolution.

### Existing platform reference (as reference only, do not update)

- eTalase merchant dashboard: https://github.com/reshadirgabiz-del/jastip-live.git
- eTalase backend: https://github.com/reshadirgabiz-del/jastip-backend.git — deployed at `https://jastip-backend-nine.vercel.app`
