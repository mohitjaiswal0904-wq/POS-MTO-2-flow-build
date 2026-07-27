import { formatCurrency } from '@/shared/lib/currency'

export function OrderTotalsSummary({
  itemsTotal,
  advanceTotal,
  remainingAmount,
}: {
  itemsTotal: number
  advanceTotal: number
  remainingAmount: number
}) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold text-slate-800">Order totals</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Final amount
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(itemsTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Advance collected
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(advanceTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Remaining</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(remainingAmount)}
          </p>
        </div>
      </div>
    </section>
  )
}
