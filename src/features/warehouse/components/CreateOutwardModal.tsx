import { useRef, useState, type DragEvent } from 'react'
import { FileSpreadsheet, Upload, X } from 'lucide-react'
import { PALMONAS_LOCATIONS } from '@/features/inventory/data/stores'
import type { Advice } from '@/features/inventory/types'

const WAREHOUSE = 'Palmonas Central Warehouse Pune'
const MAX_FILE_BYTES = 5 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

const WAREHOUSES = PALMONAS_LOCATIONS.filter((location) => location.includes('Warehouse'))
const STORES = PALMONAS_LOCATIONS.filter((location) => !location.includes('Warehouse'))

interface CreateOutwardModalProps {
  onClose: () => void
  onCreate: (advice: Advice) => void
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function countUnitsInFile(file: File): Promise<number | null> {
  if (!file.name.toLowerCase().endsWith('.csv')) return null
  const text = await file.text()
  const rows = text.split(/\r?\n/).filter((row) => row.trim().length > 0)
  return Math.max(rows.length - 1, 0)
}

export function CreateOutwardModal({ onClose, onCreate }: CreateOutwardModalProps) {
  const [source, setSource] = useState(WAREHOUSE)
  const [destination, setDestination] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [increffSubOrderId, setIncreffSubOrderId] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptFile = (next: File | undefined) => {
    if (!next) return
    const name = next.name.toLowerCase()
    if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
      setError('Upload a .csv or .xlsx outward report.')
      return
    }
    if (next.size > MAX_FILE_BYTES) {
      setError('File is larger than 5 MB.')
      return
    }
    setError('')
    setFile(next)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    acceptFile(event.dataTransfer.files[0])
  }

  const canCreate = Boolean(destination && file) && !submitting

  const handleCreate = async () => {
    if (!file) {
      setError('Choose an outward file to upload.')
      return
    }
    if (!destination) {
      setError('Select the destination store.')
      return
    }

    setSubmitting(true)
    const totalQty = await countUnitsInFile(file)
    const stamp = new Date()
    const id = `ADV${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 900000) + 100000)}`

    onCreate({
      id,
      type: 'Store Transfer Out',
      source,
      destination,
      totalQty,
      unitStatus: {
        inwarded: 0,
        damaged: 0,
        missingBarcode: 0,
        missing: 0,
        pending: totalQty ?? 0,
      },
      status: 'DISPATCHED',
      createdBy: 'Test user',
      updatedAt: stamp.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      updatedAtIso: stamp.toISOString(),
      fileName: file.name,
      remark: remark.trim() || undefined,
      increffSubOrderId: increffSubOrderId.trim() || undefined,
      invoiceNo: invoiceNo.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-7 py-5">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Create outward</h3>
            <p className="mt-1 text-[15px] text-slate-500">
              Upload an outward file to dispatch inventory to a store.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-7 py-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="outward-source"
                className="block text-[15px] font-medium text-slate-800"
              >
                Source warehouse
              </label>
              <select
                id="outward-source"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[15px] text-slate-800 focus:border-violet-400 focus:outline-none"
              >
                {WAREHOUSES.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="outward-destination"
                className="block text-[15px] font-medium text-slate-800"
              >
                Destination store
              </label>
              <select
                id="outward-destination"
                value={destination}
                onChange={(event) => {
                  setDestination(event.target.value)
                  setError('')
                }}
                className={`mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[15px] focus:border-violet-400 focus:outline-none ${
                  destination ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                <option value="">Select store...</option>
                {STORES.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Choose the warehouse this outward ships from, then the destination store.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="outward-increff"
                className="block text-[15px] font-medium text-slate-800"
              >
                Increff Sub Order ID
              </label>
              <input
                id="outward-increff"
                type="text"
                value={increffSubOrderId}
                onChange={(event) => setIncreffSubOrderId(event.target.value)}
                placeholder="e.g. INC-SO-88421"
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[15px] text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="outward-invoice"
                className="block text-[15px] font-medium text-slate-800"
              >
                Invoice no.
              </label>
              <input
                id="outward-invoice"
                type="text"
                value={invoiceNo}
                onChange={(event) => setInvoiceNo(event.target.value)}
                placeholder="e.g. INV-WH-240826-09"
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[15px] text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="outward-remark" className="block text-[15px] font-medium text-slate-800">
              Remark
            </label>
            <textarea
              id="outward-remark"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              rows={3}
              placeholder="Shown on the advice page and warehouse ledger"
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
            />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-[15px] text-slate-600">
              Choose a CSV or Excel outward report (max 5 MB), then click Create to upload and
              process it in the background.
            </p>

            <div
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`mt-4 rounded-xl border-2 border-dashed bg-white transition-colors ${
                dragging ? 'border-violet-400 bg-violet-50/50' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 px-6 py-10"
              >
                {file ? (
                  <>
                    <FileSpreadsheet className="size-8 text-violet-500" />
                    <span className="text-base font-medium text-slate-800">{file.name}</span>
                    <span className="text-sm text-slate-500">
                      {formatSize(file.size)} · Click to choose a different file
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="size-8 text-slate-400" />
                    <span className="text-base font-medium text-slate-700">
                      Choose .csv or .xlsx
                    </span>
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(event) => acceptFile(event.target.files?.[0])}
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!canCreate}
                className={`h-11 rounded-lg px-7 text-[15px] font-medium text-white transition-colors ${
                  canCreate ? 'bg-violet-600 hover:bg-violet-700' : 'cursor-not-allowed bg-violet-300'
                }`}
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
