import { useState } from 'react'
import { X } from 'lucide-react'
import type { Advice, AdviceType } from '@/features/inventory/types'
import { PALMONAS_LOCATIONS } from '@/features/inventory/data/stores'
import { SearchableStoreSelect } from '@/features/inventory/components/SearchableStoreSelect'
import { BatchScanModal, type ScannedPiece } from '@/features/inventory/components/BatchScanModal'

const WAREHOUSE = 'Palmonas Central Warehouse Pune'

interface NewAdviceModalProps {
  onClose: () => void
  onCreate: (advice: Advice) => void
}

export function NewAdviceModal({ onClose, onCreate }: NewAdviceModalProps) {
  const [type, setType] = useState<AdviceType>('Back to Warehouse')
  const [source, setSource] = useState('Palmonas Kharadi')
  const [destination, setDestination] = useState(WAREHOUSE)
  const [pieces, setPieces] = useState<ScannedPiece[]>([])
  const [showScanner, setShowScanner] = useState(false)
  const [error, setError] = useState('')

  const handleTypeChange = (next: AdviceType) => {
    setType(next)
    if (next === 'Back to Warehouse') {
      setSource('Palmonas Kharadi')
      setDestination(WAREHOUSE)
    } else {
      setSource(WAREHOUSE)
      setDestination('Palmonas Kharadi')
    }
  }

  const handleCreate = () => {
    if (!source || !destination) {
      setError('Select source and destination store.')
      return
    }
    if (pieces.length === 0) {
      setError('Scan at least one piece before creating the advice.')
      return
    }

    const stamp = new Date()
    const id = `ADV${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 900000) + 100000)}`
    const totalQty = pieces.length

    onCreate({
      id,
      type,
      source,
      destination,
      totalQty,
      unitStatus: {
        inwarded: 0,
        damaged: 0,
        missingBarcode: 0,
        missing: 0,
        pending: totalQty,
      },
      status: 'DISPATCHED',
      createdBy: 'Store associate',
      updatedAt: stamp.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      updatedAtIso: stamp.toISOString(),
      pieces,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-[14px] border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">New Advice</h3>
            <p className="mt-0.5 text-sm text-slate-500">Create a stock transfer advice</p>
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

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Type</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as AdviceType)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
            >
              <option value="Back to Warehouse">Back to Warehouse</option>
              <option value="Store Transfer Out">Store Transfer Out</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SearchableStoreSelect
              label="Source"
              value={source}
              options={PALMONAS_LOCATIONS}
              allowEmpty={false}
              onChange={setSource}
            />
            <SearchableStoreSelect
              label="Store (destination)"
              value={destination}
              options={PALMONAS_LOCATIONS}
              allowEmpty={false}
              onChange={setDestination}
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Pieces</p>
                <p className="text-xs text-slate-500">
                  {pieces.length === 0
                    ? 'Scan multiple barcodes in one modal — no PDP per piece'
                    : `${pieces.length} piece${pieces.length === 1 ? '' : 's'} queued`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800"
              >
                {pieces.length === 0 ? 'Scan pieces' : 'Scan more'}
              </button>
            </div>
            {pieces.length > 0 && (
              <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto">
                {pieces.map((piece) => (
                  <li key={piece.barcode} className="text-xs text-slate-600">
                    <span className="font-mono">{piece.barcode}</span> · {piece.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create advice
          </button>
        </div>
      </div>

      {showScanner && (
        <BatchScanModal
          onClose={() => setShowScanner(false)}
          onConfirm={(scanned) => {
            setPieces((current) => {
              const existing = new Set(current.map((piece) => piece.barcode.toLowerCase()))
              return [
                ...current,
                ...scanned.filter((piece) => !existing.has(piece.barcode.toLowerCase())),
              ]
            })
            setShowScanner(false)
            setError('')
          }}
        />
      )}
    </div>
  )
}
