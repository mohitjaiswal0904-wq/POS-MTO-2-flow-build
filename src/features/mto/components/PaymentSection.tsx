import { Check, ChevronDown, Wallet } from 'lucide-react'
import type { MtoItem, MtoOrderType, MtoPaymentStatus } from '@/features/mto/types'
import {
  itemAdvanceAmount,
  itemLineTotal,
  itemRemainingAmount,
} from '@/features/mto/utils/pricing'
import { formatCurrency } from '@/shared/lib/currency'
import { CurrencyField } from '@/shared/ui'
import { OrderTotalsSummary } from './OrderTotalsSummary'

export function PaymentSection({
  journey,
  items,
  itemsTotal,
  advanceTotal,
  remainingAmount,
  paymentStatus,
  paymentMethod,
  customerName,
  onItemChange,
  onApplyAllMode,
  onMethodChange,
  onBack,
  onConfirm,
}: {
  journey: MtoOrderType
  items: MtoItem[]
  itemsTotal: number
  advanceTotal: number
  remainingAmount: number
  paymentStatus: MtoPaymentStatus
  paymentMethod: string
  customerName: string
  onItemChange: (id: string, patch: Partial<MtoItem>) => void
  onApplyAllMode: (mode: 'full' | 'partial') => void
  onMethodChange: (method: string) => void
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Checkout</p>
          <p className="text-base font-semibold text-slate-800">
            Review product-level payments and confirm
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Check className="size-4" />
            Confirm Order
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50">
            <Wallet className="size-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Payment Details</h2>
        </div>

        <div className="space-y-4 p-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Journey:{' '}
            <span className="font-semibold text-slate-800">
              {journey === 'in_house' ? 'In-House Design' : 'Fully Custom'}
            </span>
            {' · '}
            Customer:{' '}
            <span className="font-semibold text-slate-800">{customerName || '—'}</span>
            {' · '}
            Status:{' '}
            <span className="font-semibold text-slate-800">{paymentStatus}</span>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">
              Apply payment type to all products
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onApplyAllMode('full')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-slate-400"
              >
                <p className="font-semibold text-slate-800">Full payment (all)</p>
                <p className="mt-1 text-sm text-slate-500">Collect full amount for every product</p>
              </button>
              <button
                type="button"
                onClick={() => onApplyAllMode('partial')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-slate-400"
              >
                <p className="font-semibold text-slate-800">Partial / Token (all)</p>
                <p className="mt-1 text-sm text-slate-500">
                  Set each product to advance; edit amounts below
                </p>
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-600">Product-level breakdown</p>
            <div className="space-y-3">
              {items.map((item, index) => {
                const line = itemLineTotal(item)
                const advance = itemAdvanceAmount(item)
                const remaining = itemRemainingAmount(item)
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Item #{index + 1} ·{' '}
                          {item.productName || item.skuReference || 'Custom product'}
                        </p>
                        <p className="text-sm text-slate-500">
                          Qty {item.quantity || 1}
                          {item.skuReference ? ` · ${item.skuReference}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onItemChange(item.id, { paymentMode: 'full' })}
                          className={`h-8 rounded-lg px-3 text-xs font-medium ${
                            item.paymentMode === 'full'
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 text-slate-600'
                          }`}
                        >
                          Full
                        </button>
                        <button
                          type="button"
                          onClick={() => onItemChange(item.id, { paymentMode: 'partial' })}
                          className={`h-8 rounded-lg px-3 text-xs font-medium ${
                            item.paymentMode === 'partial'
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 text-slate-600'
                          }`}
                        >
                          Partial
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <CurrencyField
                        label="Estimated price"
                        value={String(line)}
                        onChange={() => undefined}
                        readOnly
                      />
                      <CurrencyField
                        label={item.paymentMode === 'full' ? 'Amount paid' : 'Advance'}
                        value={item.paymentMode === 'full' ? String(line) : item.advancePayment}
                        onChange={(value) =>
                          onItemChange(item.id, { advancePayment: value })
                        }
                        readOnly={item.paymentMode === 'full'}
                      />
                      <CurrencyField
                        label="Remaining"
                        value={String(remaining)}
                        onChange={() => undefined}
                        readOnly
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Paid now {formatCurrency(advance)} · Due later {formatCurrency(remaining)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <OrderTotalsSummary
            itemsTotal={itemsTotal}
            advanceTotal={advanceTotal}
            remainingAmount={remainingAmount}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Payment Method
            </label>
            <div className="relative max-w-sm">
              <select
                value={paymentMethod}
                onChange={(e) => onMethodChange(e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
              >
                <option>Card</option>
                <option>UPI</option>
                <option>Cash</option>
                <option>Bank Transfer</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
