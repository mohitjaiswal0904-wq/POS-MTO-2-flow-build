import type { AdviceUnitCounts } from '@/features/inventory/types'

export interface UnitStatusLegendEntry {
  key: keyof AdviceUnitCounts
  label: string
  chipClass: string
  dotClass: string
  barClass: string
}

export const UNIT_STATUS_LEGEND: UnitStatusLegendEntry[] = [
  {
    key: 'inwarded',
    label: 'Inwarded (GRN)',
    chipClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dotClass: 'bg-emerald-500',
    barClass: 'bg-emerald-500',
  },
  {
    key: 'damaged',
    label: 'Damaged',
    chipClass: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    dotClass: 'bg-red-500',
    barClass: 'bg-red-500',
  },
  {
    key: 'missingBarcode',
    label: 'Missing Barcode',
    chipClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dotClass: 'bg-blue-500',
    barClass: 'bg-blue-500',
  },
  {
    key: 'missing',
    label: 'Missing',
    chipClass: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    dotClass: 'bg-orange-500',
    barClass: 'bg-orange-500',
  },
  {
    key: 'pending',
    label: 'Pending',
    chipClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dotClass: 'bg-amber-400',
    barClass: 'bg-amber-400',
  },
]
