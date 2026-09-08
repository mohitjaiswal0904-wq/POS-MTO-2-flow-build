export interface GoldWeights {
  grossWeight: number
  netGoldWeight: number
  stoneWeight: number
  unit: 'g'
}

export interface PriceBreakup {
  goldValue: number
  makingCharges: number
  stoneCharges: number
  wastage: number
  gst: number
}

export interface CartItem {
  id: string
  name: string
  sku: string
  barcode: string
  price: number
  compareAtPrice: number
  metal: string
  stone: string
  purity: string
  quantity: number
  giftWrap: boolean
  detailsOpen: boolean
  weights: GoldWeights
  priceBreakup: PriceBreakup
  offers: string[]
}

export interface CartCustomer {
  id: string
  name: string
  mobile: string
  email: string
}

export type PaymentMethod = 'cash' | 'card' | 'upi'

export interface DeliveryAddress {
  fullName: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  phone: string
  city: string
  country: string
}

export interface AppliedOffer {
  id: string
  label: string
  type: 'discount' | 'gift_card' | 'manual_discount'
  /** Credit amount for gift cards / coupon discounts (INR). */
  amount?: number
  planId?: string
  giftCardCode?: string
  /** Custom coupon code for store-applied discounts. */
  couponCode?: string
  reason?: string
}
