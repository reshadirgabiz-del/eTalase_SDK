# eTalase SDK Merchant Domain Testing

This repository does not currently include an automated test runner. Use these manual checks after building the SDK.

## Build

```bash
npm run build
```

## Initialization

```ts
import { EtalaseClient } from 'etalase-module';

const etalase = new EtalaseClient({
  storeKey: 'store_public_xxx',
  apiUrl: 'https://api.e-talase.com',
});
```

`apiUrl` is optional and defaults to `https://api.e-talase.com`.

## Domain Scenarios

- Main eTalase app: initialize with a valid public store key and confirm product, store, delivery, promo, order, order tracking, order link, and proof upload requests include `x-etalase-store-key`.
- Builder preview: add the preview origin to the backend allowlist for the store and verify the same requests succeed.
- Localhost development: add the exact localhost origin, including port, to the backend allowlist and verify requests succeed.
- Merchant custom domain: add and verify the production domain in the eTalase dashboard, then verify requests succeed from that domain.
- Unauthorized domain: load the same storefront from a domain that is not verified for the store and confirm the SDK surfaces: `This domain is not authorized for this eTalase store. Add and verify this domain in your eTalase dashboard.`

The SDK must not set the browser `Origin` header, must not use `mode: "no-cors"`, and must not send backend secret keys.
