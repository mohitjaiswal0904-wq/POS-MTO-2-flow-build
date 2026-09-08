import type { Advice, AdviceUnitCounts } from '@/features/inventory/types'

const emptyCounts = (): AdviceUnitCounts => ({
  inwarded: 0,
  damaged: 0,
  missingBarcode: 0,
  missing: 0,
  pending: 0,
})

const WAREHOUSE = 'Palmonas Central Warehouse Pune'
const KHARADI = 'Palmonas Kharadi'
const BANER = 'Palmonas Baner'
const VIMAN = 'Palmonas Viman Nagar'
const PHOENIX = 'Palmonas Phoenix Mall Pune'
const WHITEFIELD = 'Palmonas Whitefield'
const BANJARA = 'Palmonas Banjara Hills'
const KOREGAON = 'Palmonas Koregaon Park'
const PERAMBUR = 'Perambur'
const HABSIGUDA = 'Habsiguda Hyderabad'
const SONIPAT = 'Sonipat'

export const advices: Advice[] = [
  {
    id: 'ADV2026082502220',
    type: 'Back to Warehouse',
    source: PERAMBUR,
    destination: WAREHOUSE,
    totalQty: 6,
    unitStatus: { ...emptyCounts(), inwarded: 1, missingBarcode: 5 },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '25 Aug 2026, 11:42 am',
    updatedAtIso: '2026-08-25T11:42:00',
  },
  {
    id: 'ADV2026082551156',
    type: 'Back to Warehouse',
    source: PERAMBUR,
    destination: WAREHOUSE,
    totalQty: 7,
    unitStatus: { ...emptyCounts(), inwarded: 4, missingBarcode: 3 },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '25 Aug 2026, 11:05 am',
    updatedAtIso: '2026-08-25T11:05:00',
  },
  {
    id: 'ADV2026082514954',
    type: 'Back to Warehouse',
    source: PERAMBUR,
    destination: WAREHOUSE,
    totalQty: 1,
    unitStatus: { ...emptyCounts(), missingBarcode: 1 },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '25 Aug 2026, 10:18 am',
    updatedAtIso: '2026-08-25T10:18:00',
  },
  {
    id: 'ADV2026082429526',
    type: 'Back to Warehouse',
    source: HABSIGUDA,
    destination: WAREHOUSE,
    totalQty: 4,
    unitStatus: { ...emptyCounts(), inwarded: 4 },
    status: 'INWARDED',
    createdBy: 'Test user',
    updatedAt: '24 Aug 2026, 7:36 pm',
    updatedAtIso: '2026-08-24T19:36:00',
  },
  {
    id: 'ADV2026082463892',
    type: 'Back to Warehouse',
    source: PERAMBUR,
    destination: WAREHOUSE,
    totalQty: 4,
    unitStatus: { ...emptyCounts(), missingBarcode: 4 },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '24 Aug 2026, 6:14 pm',
    updatedAtIso: '2026-08-24T18:14:00',
  },
  {
    id: 'ADV2026082430431',
    type: 'Back to Warehouse',
    source: SONIPAT,
    destination: WAREHOUSE,
    totalQty: 8,
    unitStatus: { ...emptyCounts(), inwarded: 2, missingBarcode: 6 },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '24 Aug 2026, 4:50 pm',
    updatedAtIso: '2026-08-24T16:50:00',
  },
  {
    id: 'ADV2026082496681',
    type: 'Back to Warehouse',
    source: PERAMBUR,
    destination: WAREHOUSE,
    totalQty: 3,
    unitStatus: { ...emptyCounts(), missingBarcode: 3 },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '24 Aug 2026, 3:27 pm',
    updatedAtIso: '2026-08-24T15:27:00',
  },
  {
    id: 'ADV2026082428379',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: HABSIGUDA,
    totalQty: 117,
    unitStatus: { ...emptyCounts(), pending: 117 },
    status: 'DISPATCHED',
    createdBy: 'Test user',
    updatedAt: '24 Aug 2026, 12:09 pm',
    updatedAtIso: '2026-08-24T12:09:00',
    fileName: 'outward_habsiguda_240826.csv',
    remark: 'Festival replenishment — hold damaged SKUs at source.',
    increffSubOrderId: 'INC-SO-88421',
    invoiceNo: 'INV-WH-240826-09',
  },
  {
    id: 'ADV2026081954538',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: KHARADI,
    totalQty: 9,
    unitStatus: { ...emptyCounts(), inwarded: 9 },
    status: 'INWARDED',
    createdBy: 'Test user',
    updatedAt: '19 Aug 2026, 9:56 pm',
    updatedAtIso: '2026-08-19T21:56:00',
  },
  {
    id: 'ADV2026081951770',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: BANER,
    totalQty: 38,
    unitStatus: { ...emptyCounts(), inwarded: 38 },
    status: 'INWARDED',
    createdBy: 'Test user',
    updatedAt: '19 Aug 2026, 7:04 pm',
    updatedAtIso: '2026-08-19T19:04:00',
  },
  {
    id: 'ADV2026081870089',
    type: 'Back to Warehouse',
    source: KHARADI,
    destination: WAREHOUSE,
    totalQty: 3,
    unitStatus: { ...emptyCounts(), pending: 3 },
    status: 'DISPATCHED',
    createdBy: 'Test user',
    updatedAt: '18 Aug 2026, 4:34 pm',
    updatedAtIso: '2026-08-18T16:34:00',
  },
  {
    id: 'ADV2026081822513',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: VIMAN,
    totalQty: 21,
    unitStatus: {
      inwarded: 17,
      damaged: 1,
      missingBarcode: 2,
      missing: 1,
      pending: 0,
    },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '18 Aug 2026, 4:34 pm',
    updatedAtIso: '2026-08-18T16:34:00',
  },
  {
    id: 'ADV2026081843543',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: PHOENIX,
    totalQty: 18,
    unitStatus: { ...emptyCounts(), pending: 18 },
    status: 'DISPATCHED',
    createdBy: 'Test user',
    updatedAt: '18 Aug 2026, 3:12 pm',
    updatedAtIso: '2026-08-18T15:12:00',
  },
  {
    id: 'ADV2026081848683',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: WHITEFIELD,
    totalQty: null,
    unitStatus: emptyCounts(),
    status: 'FAILED',
    createdBy: 'Test user',
    updatedAt: '18 Aug 2026, 1:40 pm',
    updatedAtIso: '2026-08-18T13:40:00',
  },
  {
    id: 'ADV2026081721837',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: BANJARA,
    totalQty: 12,
    unitStatus: { ...emptyCounts(), inwarded: 12 },
    status: 'INWARDED',
    createdBy: 'Test user',
    updatedAt: '17 Aug 2026, 6:22 pm',
    updatedAtIso: '2026-08-17T18:22:00',
  },
  {
    id: 'ADV2026081747234',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: KOREGAON,
    totalQty: 24,
    unitStatus: { ...emptyCounts(), inwarded: 24 },
    status: 'INWARDED',
    createdBy: 'Test user',
    updatedAt: '17 Aug 2026, 2:05 pm',
    updatedAtIso: '2026-08-17T14:05:00',
  },
  {
    id: 'ADV2026081445453',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: KHARADI,
    totalQty: null,
    unitStatus: emptyCounts(),
    status: 'FAILED',
    createdBy: 'Test user',
    updatedAt: '14 Aug 2026, 12:55 pm',
    updatedAtIso: '2026-08-14T12:55:00',
  },
  {
    id: 'ADV2026081401745',
    type: 'Back to Warehouse',
    source: BANER,
    destination: WAREHOUSE,
    totalQty: 2,
    unitStatus: { ...emptyCounts(), pending: 2 },
    status: 'DISPATCHED',
    createdBy: 'Test user',
    updatedAt: '14 Aug 2026, 12:24 pm',
    updatedAtIso: '2026-08-14T12:24:00',
  },
  {
    id: 'ADV2026081409427',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: KHARADI,
    totalQty: 68,
    unitStatus: {
      inwarded: 65,
      damaged: 1,
      missingBarcode: 1,
      missing: 1,
      pending: 0,
    },
    status: 'PARTIALLY_INWARDED',
    createdBy: 'Test user',
    updatedAt: '14 Aug 2026, 11:48 am',
    updatedAtIso: '2026-08-14T11:48:00',
  },
  {
    id: 'ADV2026080778882',
    type: 'Store Transfer Out',
    source: WAREHOUSE,
    destination: PHOENIX,
    totalQty: 15,
    unitStatus: { ...emptyCounts(), pending: 15 },
    status: 'DISPATCHED',
    createdBy: 'Test user',
    updatedAt: '07 Aug 2026, 5:10 pm',
    updatedAtIso: '2026-08-07T17:10:00',
  },
]

const extraAdvices: Advice[] = []
const advicePatches = new Map<string, Partial<Advice>>()

export function addAdvice(advice: Advice) {
  extraAdvices.unshift(advice)
}

export function canVoidAdvice(advice: Advice): boolean {
  return advice.status === 'DISPATCHED'
}

export function voidAdvice(id: string): Advice | undefined {
  const current = getAdviceById(id)
  if (!current || !canVoidAdvice(current)) return current

  const now = new Date()
  const patch: Partial<Advice> = {
    status: 'VOIDED',
    updatedAt: now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    updatedAtIso: now.toISOString(),
  }
  advicePatches.set(id, { ...advicePatches.get(id), ...patch })
  return getAdviceById(id)
}

export function getAllAdvices(): Advice[] {
  return [...extraAdvices, ...advices].map((advice) => {
    const patch = advicePatches.get(advice.id)
    return patch ? { ...advice, ...patch } : advice
  })
}

export function getAdviceById(id: string): Advice | undefined {
  return getAllAdvices().find((advice) => advice.id === id)
}

export function getInwardedCount(advice: Advice): number {
  return advice.unitStatus.inwarded
}

export function getInwardedPercent(advice: Advice): number | null {
  if (!advice.totalQty) return null
  return Math.round((advice.unitStatus.inwarded / advice.totalQty) * 100)
}

export function matchesAdviceSearch(advice: Advice, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase().replace(/\s+/g, '')
  if (!query) return true

  const haystack = [
    advice.id,
    advice.type,
    advice.source,
    advice.destination,
    advice.status,
    advice.createdBy,
    advice.updatedAt,
    advice.fileName,
    advice.remark,
    advice.increffSubOrderId,
    advice.invoiceNo,
    ...(advice.pieces?.flatMap((piece) => [piece.barcode, piece.sku, piece.name]) ?? []),
  ]
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, '')

  return haystack.includes(query)
}
