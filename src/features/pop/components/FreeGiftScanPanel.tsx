import { useState, type FormEvent } from 'react'
import { Gift, ScanBarcode, ShieldCheck, X } from 'lucide-react'
import {
  findCatalogProductByBarcode,
  type CatalogProduct,
} from '@/features/cart/data/cartData'
import { formatCurrency } from '@/shared/lib/currency'
import type { PopFreeGift } from '@/features/pop/data/popPlans'

export function buildFreeGiftFromProduct(
  product: CatalogProduct,
  planId?: string,
): PopFreeGift {
  return {
    id: `gift-${Date.now()}`,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    mrp: product.price,
    issuedOn: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    planId,
    verifiedByScan: true,
  }
}

interface FreeGiftScanPanelProps {
  title?: string
  description?: string
  planId?: string
  onVerified: (gift: PopFreeGift) => void
  onCancel?: () => void
}

export function FreeGiftScanPanel({
  title = 'Scan product for free gift',
  description = 'Scan or enter the product barcode / SKU to verify and bill it as a free gift (₹0).',
  planId,
  onVerified,
  onCancel,
}: FreeGiftScanPanelProps) {
  const [code, setCode] = useState('')
  const [matched, setMatched] = useState<CatalogProduct | null>(null)
  const [error, setError] = useState('')

  const lookup = (event?: FormEvent) => {
    event?.preventDefault()
    const product = findCatalogProductByBarcode(code)
    if (!product) {
      setMatched(null)
      setError('Product not found. Try BC-SKU0005-0001 or SKU0005.')
      return
    }
    setError('')
    setMatched(product)
  }

  const confirm = () => {
    if (!matched) {
      setError('Scan and verify a product first.')
      return
    }
    onVerified(buildFreeGiftFromProduct(matched, planId))
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={code}
            autoFocus
            placeholder="Scan barcode or enter SKU"
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              setMatched(null)
              setError('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                lookup()
              }
            }}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm uppercase tracking-wide text-slate-800 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={() => lookup()}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Verify
        </button>
      </div>
      <p className="text-xs text-slate-400">Demo: BC-SKU0005-0001 · BC-SKU0001-0001 · SKU0004</p>

      {matched && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-950">{matched.name}</p>
              <p className="mt-0.5 text-xs text-emerald-800">
                {matched.sku} · {matched.barcode} · {matched.metal}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-slate-500 line-through">{formatCurrency(matched.price)}</span>
                <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                  Free gift · billed ₹0
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!matched}
          onClick={confirm}
          className="flex h-10 items-center gap-1.5 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Gift className="size-4" />
          Bill as free gift
        </button>
      </div>
    </div>
  )
}

interface AddFreeGiftModalProps {
  planId?: string
  onClose: () => void
  onAdd: (gift: PopFreeGift) => void
}

export function AddFreeGiftModal({ planId, onClose, onAdd }: AddFreeGiftModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Gift className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Issue free gift</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Scan the product tag to verify before billing as free.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-5 py-5">
          <FreeGiftScanPanel
            planId={planId}
            onVerified={(gift) => onAdd(gift)}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
