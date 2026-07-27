# POS UI

Jewelry Point-of-Sale iPad UI — React + TypeScript + Vite + Tailwind.

This is a **production-handoff prototype**: feature screens, flows, and mock data are structured so developers can wire real APIs without reshaping the UI.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run preview  # serve dist/
```

## Architecture

```
src/
  app/                 # Shell: providers + router
  features/
    orders/            # Sales orders + returns
    inventory/         # Stock + SKU / barcode history
    mto/               # Made-to-order wizard + order history
  shared/              # Layout, form UI, currency helpers
  styles/              # Global CSS / Tailwind entry
```

- Import with the `@/` alias (maps to `src/`).
- Each feature exposes a public barrel: `@/features/<name>`.
- Mock data lives under each feature’s `data/` folder — replace with API clients there.

## Routes

| Path | Feature |
|------|---------|
| `/orders` | Orders list |
| `/orders/:orderId` | Order details + returns |
| `/inventory` | Inventory stock |
| `/inventory/history` | SKU history |
| `/inventory/history/barcode` | Barcode history |
| `/inventory/:itemId/history` | Product history |
| `/mto` | MTO create wizard |
| `/mto/orders` | MTO order list |
| `/mto/orders/:orderId` | MTO order details |

See [docs/HANDOFF.md](docs/HANDOFF.md) for integration notes for the production team.
