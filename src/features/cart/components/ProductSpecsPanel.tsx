import type { CartItem } from '@/features/cart/types'
import { formatCurrency } from '@/shared/lib/currency'

export function ProductSpecsPanel({ item }: { item: CartItem }) {
  const breakupTotal =
    item.priceBreakup.goldValue +
    item.priceBreakup.makingCharges +
    item.priceBreakup.stoneCharges +
    item.priceBreakup.wastage +
    item.priceBreakup.gst

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>Product info</SectionTitle>
        <dl className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          <InfoRow label="SKU" value={item.sku} mono />
          <InfoRow label="Barcode" value={item.barcode} mono />
          <InfoRow label="Purity" value={item.purity} />
          <InfoRow label="Metal" value={item.metal} />
          <InfoRow label="Stone" value={item.stone} />
        </dl>
      </section>

      <section>
        <SectionTitle>Gold weights</SectionTitle>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 text-right font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              <WeightRow label="Gross weight" value={item.weights.grossWeight} unit={item.weights.unit} />
              <WeightRow
                label="Net gold weight"
                value={item.weights.netGoldWeight}
                unit={item.weights.unit}
                emphasize
              />
              <WeightRow label="Stone weight" value={item.weights.stoneWeight} unit={item.weights.unit} />
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionTitle>Price breakup</SectionTitle>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-3 py-2 font-medium">Component</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <BreakupRow label="Gold value" value={item.priceBreakup.goldValue} />
              <BreakupRow label="Making charges" value={item.priceBreakup.makingCharges} />
              <BreakupRow label="Stone charges" value={item.priceBreakup.stoneCharges} />
              <BreakupRow label="Wastage" value={item.priceBreakup.wastage} />
              <BreakupRow label="GST" value={item.priceBreakup.gst} />
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="px-3 py-3 text-sm font-semibold text-slate-900">Unit total</td>
                <td className="px-3 py-3 text-right text-sm font-semibold text-slate-900">
                  {formatCurrency(breakupTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {item.offers.length > 0 && (
        <section>
          <SectionTitle>Offers</SectionTitle>
          <ul className="mt-3 space-y-2">
            {item.offers.map((offer) => (
              <li
                key={offer}
                className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-sm text-emerald-900"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="font-medium">{offer}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-sm font-semibold text-slate-800">{children}</h3>
  )
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 px-3 py-2.5 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-sm font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}

function WeightRow({
  label,
  value,
  unit,
  emphasize = false,
}: {
  label: string
  value: number
  unit: string
  emphasize?: boolean
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className={`px-3 py-2.5 ${emphasize ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
        {label}
      </td>
      <td
        className={`px-3 py-2.5 text-right tabular-nums ${
          emphasize ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'
        }`}
      >
        {value.toFixed(2)} {unit}
      </td>
    </tr>
  )
}

function BreakupRow({ label, value }: { label: string; value: number }) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-3 py-2.5 text-slate-600">{label}</td>
      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-slate-800">
        {formatCurrency(value)}
      </td>
    </tr>
  )
}
