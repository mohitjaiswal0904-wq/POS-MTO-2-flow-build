import type { CartCustomer, CartItem, DeliveryAddress } from '@/features/cart/types'

export const GIFT_WRAP_FEE = 50
export const WALLET_BALANCE = 700

const sharedBreakup = {
  goldValue: 28450,
  makingCharges: 4850,
  stoneCharges: 2200,
  wastage: 727,
  gst: 1500,
}

const sharedWeights = {
  grossWeight: 4.82,
  netGoldWeight: 3.95,
  stoneWeight: 0.87,
  unit: 'g' as const,
}

export type CatalogProduct = Omit<CartItem, 'id' | 'quantity' | 'giftWrap' | 'detailsOpen'>

export const catalogProducts: CatalogProduct[] = [
  {
    name: 'Gold Pearl Earrings 1',
    sku: 'SKU0001',
    barcode: 'BC-SKU0001-0001',
    price: 36727,
    compareAtPrice: 36727,
    metal: '9KT Rose Gold',
    stone: 'Lab Diamond',
    purity: '9KT / 37.5%',
    weights: sharedWeights,
    priceBreakup: sharedBreakup,
    offers: ['Buy One get one free', 'Festive Offer - ₹1000'],
  },
  {
    name: 'Gold Pearl Earrings 2',
    sku: 'SKU0002',
    barcode: 'BC-SKU0002-0001',
    price: 58388,
    compareAtPrice: 79983,
    metal: '9KT Rose Gold',
    stone: 'Pearl',
    purity: '9KT / 37.5%',
    weights: sharedWeights,
    priceBreakup: sharedBreakup,
    offers: ['Get for ₹899 · MONSOON3', 'Buy 3 for ₹2699'],
  },
  {
    name: 'Gold Chain Necklace',
    sku: 'SKU0003',
    barcode: 'BC-SKU0003-0001',
    price: 41250,
    compareAtPrice: 45800,
    metal: '18KT Yellow Gold',
    stone: 'None',
    purity: '18KT / 75%',
    weights: { ...sharedWeights, grossWeight: 6.1, netGoldWeight: 6.1, stoneWeight: 0 },
    priceBreakup: sharedBreakup,
    offers: ['Flat 10% Off'],
  },
  {
    name: 'Rose Gold Bangle',
    sku: 'SKU0004',
    barcode: 'BC-SKU0004-0001',
    price: 28990,
    compareAtPrice: 32990,
    metal: '9KT Rose Gold',
    stone: 'Lab Diamond',
    purity: '9KT / 37.5%',
    weights: sharedWeights,
    priceBreakup: sharedBreakup,
    offers: ['First Purchase Bonus'],
  },
  {
    name: 'Gold Stud Earrings',
    sku: 'SKU0005',
    barcode: 'BC-SKU0005-0001',
    price: 15400,
    compareAtPrice: 18900,
    metal: '22KT Yellow Gold',
    stone: 'None',
    purity: '22KT / 91.6%',
    weights: { ...sharedWeights, grossWeight: 2.4, netGoldWeight: 2.4, stoneWeight: 0 },
    priceBreakup: sharedBreakup,
    offers: ['Festive Offer - ₹1000'],
  },
]

export function findCatalogProductByBarcode(raw: string): CatalogProduct | undefined {
  const code = raw.trim().toUpperCase()
  if (!code) return undefined
  return catalogProducts.find(
    (product) =>
      product.barcode.toUpperCase() === code ||
      product.sku.toUpperCase() === code ||
      product.barcode.toUpperCase().endsWith(code),
  )
}

export const initialCartItems: CartItem[] = [
  {
    id: 'cart-1',
    quantity: 2,
    giftWrap: true,
    detailsOpen: false,
    ...catalogProducts[0],
    barcode: 'BC-SKU0001-0001',
  },
  {
    id: 'cart-2',
    quantity: 2,
    giftWrap: true,
    detailsOpen: false,
    ...catalogProducts[0],
    barcode: 'BC-SKU0001-0002',
  },
]

export const cartCustomer: CartCustomer = {
  id: 'CUS-0001',
  name: 'Aarav Kapoor',
  mobile: '8090835885',
  email: 'aarav.kapoor@gmail.com',
}

export const availableDiscounts = [
  'Buy One get one free',
  'Flat 10% Off',
  'Festive Offer - ₹1000',
  'First Purchase Bonus',
]

/** Store coupons keyed by code → discount amount (INR). */
export const customCoupons: Record<string, number> = {
  FESTIVE10: 1000,
  WELCOME500: 500,
  FLAT2000: 2000,
  MONSOON3: 899,
}

export const emptyDelivery: DeliveryAddress = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  phone: '',
  city: '',
  country: '',
}
