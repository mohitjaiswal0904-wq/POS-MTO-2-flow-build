# Developer handoff — POS UI

Product-designed POS iPad flows packaged for integration into the current production app.

## What this repo is

- **UI + interaction prototype** with realistic jewelry POS journeys
- **Feature-based** layout so teams can own domains independently
- **Mock data** in place of backend services (swap at the feature `data/` boundary)

## Domains

### Orders (`src/features/orders`)

- Customer order list and order details
- Unit-level returns (modal + status card)
- Context: `ReturnProvider` / `useReturn`
- Mock: `data/mockData.ts`
- Business helpers: `utils/returnLogic.ts`

**Prod plug-in:** replace `mockData` fetches with order/return APIs; keep `ReturnContext` or move to your global store.

### Inventory (`src/features/inventory`)

- Stock table, product history, SKU history, barcode terminal history
- Catalog + units mock: `data/skuHistoryData.ts`, `data/inventoryData.ts`
- Types include `SkuCatalog` (also consumed by MTO for live SKU search)

**Prod plug-in:** point catalog/history loaders at inventory services; preserve barcode event shapes if possible.

### MTO (`src/features/mto`)

- Dual journey: In-House Design Customization vs Fully Custom Design
- Multi-item order on one page; per-item pricing (estimated price / advance / remaining)
- In-house: catalog images only (no upload); Fully custom: per-item image upload
- Context: `MtoProvider` / `useMto`
- Page orchestration: `pages/MtoPage.tsx`
- UI pieces: `components/*`
- Pricing math: `utils/pricing.ts`

**Prod plug-in:**

1. Persist `placeOrder` via MTO create API instead of in-memory context
2. Load SKU catalog from inventory service (`getSkuByCode` / `searchSkuCatalog`)
3. Upload images to object storage; store URLs on line items

## Shared layer (`src/shared`)

| Path | Purpose |
|------|---------|
| `components/layout` | `AppLayout`, `Sidebar` |
| `ui` | `Field`, `CurrencyField`, `SectionBlock` |
| `lib/currency` | `formatCurrency` |

## App shell (`src/app`)

- `providers.tsx` — wraps Return + MTO providers
- `router.tsx` — all routes (keep URLs stable when embedding)
- `App.tsx` — BrowserRouter + providers

## Embedding into production

1. Copy `src/features/*` and `src/shared/*` (or mount this app as a micro-frontend).
2. Keep route paths unless you update deep links and sidebar together.
3. Replace mock modules first; leave components alone until APIs settle.
4. Auth / store / employee context should wrap `AppProviders` from your host app.

## Conventions for contributors

- Prefer `@/features/...` and `@/shared/...` imports
- Keep feature barrels (`index.ts`) as the public API for the app router
- Do not reintroduce a flat `src/pages` dump — add pages under the owning feature
- Mock data files are temporary; annotate API TODOs next to fetch seams when you add them

## Verification checklist

- [ ] `npm run build` passes
- [ ] Orders → open order → return flow
- [ ] Inventory → SKU history → barcode history
- [ ] MTO in-house: search SKU → customise → add another product → payment
- [ ] MTO fully custom: form + images → payment → order details
