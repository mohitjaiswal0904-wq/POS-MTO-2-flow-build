export const PALMONAS_LOCATIONS = [
  'Habsiguda Hyderabad',
  'Palmonas Baner',
  'Palmonas Banjara Hills',
  'Palmonas Central Warehouse Pune',
  'Palmonas Kharadi',
  'Palmonas Koregaon Park',
  'Palmonas Phoenix Mall Pune',
  'Palmonas Viman Nagar',
  'Palmonas Whitefield',
  'Perambur',
  'Sonipat',
].sort((a, b) => a.localeCompare(b))

export const ADVICE_STATUSES = [
  'INWARDED',
  'DISPATCHED',
  'PARTIALLY_INWARDED',
  'FAILED',
  'VOIDED',
] as const
