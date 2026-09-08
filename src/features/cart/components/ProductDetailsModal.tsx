import { X } from 'lucide-react'
import type { CartItem } from '@/features/cart/types'
import { formatCurrency } from '@/shared/lib/currency'
import { ProductSpecsPanel } from '@/features/cart/components/ProductSpecsPanel'

interface ProductDetailsModalProps {
  item: CartItem
  onClose: () => void
}

export function ProductDetailsModal({ item, onClose }: ProductDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex gap-3">
            <div className="size-20 shrink-0 rounded-[10px] bg-gradient-to-br from-amber-50 to-amber-100" />
            <div>
              <p className="text-lg font-semibold text-slate-800">{item.name}</p>
              <p className="mt-1 font-mono text-sm text-slate-500">{item.sku}</p>
              <p className="mt-2 text-xl font-bold text-slate-800">{formatCurrency(item.price)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {item.metal}
                </span>
                <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {item.stone}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">
          <ProductSpecsPanel item={item} />
        </div>
      </div>
    </div>
  )
}
