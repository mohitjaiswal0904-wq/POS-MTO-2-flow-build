import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, FileSpreadsheet, MapPin, Package, X } from 'lucide-react'
import { AppLayout } from '@/shared/components/layout'
import {
  canVoidAdvice,
  getAdviceById,
  getInwardedPercent,
  voidAdvice,
} from '@/features/inventory/data/advicesData'
import type { AdviceUnitStatus } from '@/features/inventory/types'

const UNIT_LABEL: Record<AdviceUnitStatus, { label: string; className: string }> = {
  inwarded: { label: 'Inwarded (GRN)', className: 'bg-emerald-100 text-emerald-800' },
  damaged: { label: 'Damaged', className: 'bg-red-100 text-red-700' },
  missing_barcode: { label: 'Missing Barcode', className: 'bg-orange-100 text-orange-700' },
  missing: { label: 'Missing', className: 'bg-slate-200 text-slate-700' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
}

function adviceStatusClass(status: string) {
  switch (status) {
    case 'INWARDED':
      return 'bg-emerald-100 text-emerald-800'
    case 'DISPATCHED':
      return 'bg-blue-100 text-blue-800'
    case 'PARTIALLY_INWARDED':
      return 'bg-amber-100 text-amber-800'
    case 'FAILED':
      return 'bg-red-100 text-red-700'
    case 'VOIDED':
      return 'bg-slate-200 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function buildUnits(adviceId: string, counts: {
  inwarded: number
  damaged: number
  missingBarcode: number
  missing: number
  pending: number
}) {
  const units: Array<{ barcode: string; status: AdviceUnitStatus }> = []
  const push = (status: AdviceUnitStatus, count: number) => {
    for (let i = 0; i < count; i += 1) {
      units.push({
        barcode: `BC-${adviceId.slice(-6)}-${String(units.length + 1).padStart(3, '0')}`,
        status,
      })
    }
  }
  push('inwarded', counts.inwarded)
  push('damaged', counts.damaged)
  push('missing_barcode', counts.missingBarcode)
  push('missing', counts.missing)
  push('pending', counts.pending)
  return units
}

export function AdviceDetailsPage() {
  const { adviceId = '' } = useParams()
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmVoid, setConfirmVoid] = useState(false)
  const advice = useMemo(() => getAdviceById(adviceId), [adviceId, refreshKey])
  const percent = advice ? getInwardedPercent(advice) : null
  const units = useMemo(
    () => (advice ? buildUnits(advice.id, advice.unitStatus) : []),
    [advice],
  )
  const voidable = advice ? canVoidAdvice(advice) : false

  if (!advice) {
    return (
      <AppLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <p className="text-base font-semibold text-slate-800">Advice not found</p>
          <button
            type="button"
            onClick={() => navigate('/inventory?tab=advices')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
          >
            Back to Inventory
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate('/inventory?tab=advices')}
                className="mt-0.5 flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <p className="text-sm text-slate-500">Advice</p>
                <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
                  {advice.id}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{advice.type}</p>
                {advice.fileName && (
                  <p className="mt-1 text-sm text-slate-500">
                    File: <span className="font-medium text-slate-700">{advice.fileName}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {voidable && (
                <button
                  type="button"
                  onClick={() => setConfirmVoid(true)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[#ffc9c9] bg-white px-3 text-sm font-medium leading-5 text-[#e7000b] hover:bg-red-50"
                >
                  <Ban className="size-4" />
                  Cancel advice
                </button>
              )}
              <span
                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${adviceStatusClass(advice.status)}`}
              >
                {advice.status}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-5xl space-y-3">
            <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <InfoCard
                icon={MapPin}
                label="Source"
                value={advice.source}
              />
              <InfoCard
                icon={MapPin}
                label="Destination"
                value={advice.destination}
              />
              <InfoCard
                icon={Package}
                label="Total Qty"
                value={
                  advice.totalQty == null
                    ? '—'
                    : `${advice.totalQty} units expected`
                }
              />
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-base font-semibold text-slate-800">Shipment details</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Meta
                  label="CSV / Excel file"
                  value={advice.fileName ?? '—'}
                  icon={FileSpreadsheet}
                />
                <Meta label="Increff Sub Order ID" value={advice.increffSubOrderId ?? '—'} />
                <Meta label="Invoice no." value={advice.invoiceNo ?? '—'} />
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500">Remark</p>
                  <p className="mt-0.5 whitespace-pre-wrap font-medium text-slate-700">
                    {advice.remark?.trim() ? advice.remark : '—'}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-800">Quantity distribution</h2>
                {percent != null && (
                  <p className="text-sm text-slate-500">
                    {advice.unitStatus.inwarded} of {advice.totalQty} inwarded ({percent}%)
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['inwarded', advice.unitStatus.inwarded],
                    ['damaged', advice.unitStatus.damaged],
                    ['missing_barcode', advice.unitStatus.missingBarcode],
                    ['missing', advice.unitStatus.missing],
                    ['pending', advice.unitStatus.pending],
                  ] as Array<[AdviceUnitStatus, number]>
                )
                  .filter(([, count]) => count > 0)
                  .map(([status, count]) => (
                    <span
                      key={status}
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${UNIT_LABEL[status].className}`}
                    >
                      {UNIT_LABEL[status].label}
                      <span className="font-semibold">{count}</span>
                    </span>
                  ))}
                {units.length === 0 && <p className="text-sm text-slate-500">No units on this advice.</p>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Meta label="Created by" value={advice.createdBy} />
                <Meta label="Updated at" value={advice.updatedAt} />
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-4">
              <h2 className="mb-4 text-base font-semibold text-slate-800">
                Units ({units.length})
              </h2>
              {advice.pieces && advice.pieces.length > 0 && (
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-sm font-medium text-slate-700">Scanned pieces</p>
                  <ul className="space-y-1">
                    {advice.pieces.map((piece) => (
                      <li key={piece.barcode} className="text-xs text-slate-600">
                        <span className="font-mono font-medium text-slate-800">{piece.barcode}</span>
                        {' · '}
                        {piece.sku} · {piece.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {units.length === 0 ? (
                <p className="text-sm text-slate-500">This advice did not generate unit barcodes.</p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {units.map((unit) => (
                    <div
                      key={unit.barcode}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <p className="font-mono text-sm text-slate-800">{unit.barcode}</p>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${UNIT_LABEL[unit.status].className}`}
                      >
                        {UNIT_LABEL[unit.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {confirmVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-[14px] border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Void this advice?</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {advice.id} will be marked VOIDED. Pending units will not be inwarded, and this
                  cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmVoid(false)}
                className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setConfirmVoid(false)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  voidAdvice(advice.id)
                  setConfirmVoid(false)
                  setRefreshKey((key) => key + 1)
                }}
                className="h-9 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                Void advice
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package
  label: string
  value: string
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function Meta({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: typeof Package
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-0.5 flex items-start gap-1.5">
        {Icon && <Icon className="mt-0.5 size-3.5 shrink-0 text-slate-400" />}
        <p className="break-all font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )
}
