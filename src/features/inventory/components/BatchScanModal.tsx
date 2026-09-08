import { useMemo, useState } from 'react'
import { ScanLine, X } from 'lucide-react'
import { getUnitByBarcode, skuCatalog } from '@/features/inventory/data/skuHistoryData'

export interface ScannedPiece {
  barcode: string
  sku: string
  name: string
}

interface BatchScanModalProps {
  onClose: () => void
  onConfirm: (pieces: ScannedPiece[]) => void
}

export function BatchScanModal({ onClose, onConfirm }: BatchScanModalProps) {
  const [code, setCode] = useState('')
  const [pieces, setPieces] = useState<ScannedPiece[]>([])
  const [error, setError] = useState('')

  const sampleCodes = useMemo(
    () => skuCatalog.flatMap((entry) => entry.units.slice(0, 2).map((unit) => unit.barcode)).slice(0, 4),
    [],
  )

  const addScan = (raw: string) => {
    const barcode = raw.trim()
    if (!barcode) {
      setError('Scan or enter a barcode.')
      return
    }
    if (pieces.some((piece) => piece.barcode.toLowerCase() === barcode.toLowerCase())) {
      setError('This barcode is already in the list.')
      return
    }

    const match = getUnitByBarcode(barcode)
    const next: ScannedPiece = match
      ? { barcode: match.unit.barcode, sku: match.sku.sku, name: match.sku.productName }
      : { barcode, sku: 'UNMATCHED', name: 'Scanned piece' }

    setPieces((current) => [...current, next])
    setCode('')
    setError('')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Scan pieces</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Keep this modal open and scan each barcode. Pieces are queued here — no PDP per scan.
            </p>
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

        <div className="space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Barcode</label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <ScanLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={code}
                  placeholder="Scan barcode and press Enter"
                  onChange={(e) => {
                    setCode(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addScan(code)
                    }
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => addScan(code)}
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
              >
                Scan
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Example: scan three pieces in a row, then add them all at once.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sampleCodes.map((barcode) => (
                <button
                  key={barcode}
                  type="button"
                  onClick={() => addScan(barcode)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600 hover:bg-white"
                >
                  {barcode}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="rounded-lg border border-slate-200">
            <div className="border-b border-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              Queued pieces ({pieces.length})
            </div>
            {pieces.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">No pieces scanned yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {pieces.map((piece, index) => (
                  <li key={piece.barcode} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div>
                      <p className="font-mono text-sm font-medium text-slate-800">{piece.barcode}</p>
                      <p className="text-xs text-slate-500">
                        {piece.sku} · {piece.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">#{index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPieces((current) => current.filter((entry) => entry.barcode !== piece.barcode))
                        }
                        className="text-xs font-medium text-slate-500 hover:text-slate-800"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
            disabled={pieces.length === 0}
            onClick={() => onConfirm(pieces)}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Add {pieces.length || ''} {pieces.length === 1 ? 'piece' : 'pieces'}
          </button>
        </div>
      </div>
    </div>
  )
}
