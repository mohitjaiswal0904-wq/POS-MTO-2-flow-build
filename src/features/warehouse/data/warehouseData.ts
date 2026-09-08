export type WarehouseStatus = 'Available' | 'In Transit' | 'Reserved'

export interface WarehouseItem {
  id: string
  sku: string
  productName: string
  category: string
  status: WarehouseStatus
  quantity: number
  bin: string
  price: number
  lastUpdated: string
}

export const warehouseItems: WarehouseItem[] = [
  {
    id: 'wh-1',
    sku: 'SSWER0762',
    productName: 'Molten Muse Drops',
    category: 'Earrings',
    status: 'Available',
    quantity: 18,
    bin: 'WH-A1-04',
    price: 58388,
    lastUpdated: '1 hour ago',
  },
  {
    id: 'wh-2',
    sku: 'PMWSSER470-MC',
    productName: 'Sculpted Dual-Tone Drop Hoops',
    category: 'Earrings',
    status: 'Available',
    quantity: 12,
    bin: 'WH-A1-12',
    price: 62400,
    lastUpdated: '3 hours ago',
  },
  {
    id: 'wh-3',
    sku: 'PM-EARRINGS-054-B',
    productName: 'Classic Round Hoop Earrings',
    category: 'Earrings',
    status: 'In Transit',
    quantity: 6,
    bin: 'Dispatch',
    price: 19800,
    lastUpdated: '5 hours ago',
  },
  {
    id: 'wh-4',
    sku: 'PM-EARRINGS-032',
    productName: 'Athena Solitaire Hoop Earrings',
    category: 'Earrings',
    status: 'Reserved',
    quantity: 4,
    bin: 'WH-B2-03',
    price: 41250,
    lastUpdated: 'Yesterday',
  },
  {
    id: 'wh-5',
    sku: 'SSWER0869',
    productName: 'Sun Ripple Hoops',
    category: 'Earrings',
    status: 'Available',
    quantity: 22,
    bin: 'WH-A2-08',
    price: 28990,
    lastUpdated: 'Yesterday',
  },
  {
    id: 'wh-6',
    sku: 'PM-EARRINGS-072-G',
    productName: 'Tiny Iris Star Drop Hoop Earrings',
    category: 'Earrings',
    status: 'In Transit',
    quantity: 9,
    bin: 'Dispatch',
    price: 15400,
    lastUpdated: '2 days ago',
  },
  {
    id: 'wh-7',
    sku: 'SKU0003',
    productName: 'Gold Chain Necklace',
    category: 'Necklace',
    status: 'Available',
    quantity: 7,
    bin: 'WH-C1-02',
    price: 41250,
    lastUpdated: '2 days ago',
  },
  {
    id: 'wh-8',
    sku: 'SKU0004',
    productName: 'Rose Gold Bangle',
    category: 'Bangle',
    status: 'Reserved',
    quantity: 3,
    bin: 'WH-B3-01',
    price: 28990,
    lastUpdated: '3 days ago',
  },
]
