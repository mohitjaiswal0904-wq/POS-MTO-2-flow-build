export interface Customer {
  id: string
  serialNo: number
  name: string
  phone: string
  totalOrders: number
  totalSpent: string
  lastVisit: string
}

export interface CustomerAddress {
  id: string
  name: string
  fullAddress: string
  pincode: string
  city: string
  phone: string
}

export interface CustomerProductItem {
  id: string
  name: string
  metal: string
  stone: string
  addedOn: string
  price: number
}

export interface CustomerOrderSummary {
  id: string
  dateLabel: string
  status: 'completed' | 'pending' | 'cancelled'
  itemCount: number
  total: number
}

export type GiftCardStatus = 'active' | 'expiring_soon' | 'expired' | 'used'

export interface CustomerGiftCard {
  id: string
  code: string
  status: GiftCardStatus
  expiresOn: string
  balance: number
}

export interface CustomerProfile {
  id: string
  initials: string
  name: string
  customerSince: string
  email: string
  phone: string
  /** Fallback display string; prefer addresses + selectedAddressId */
  address: string
  addresses: CustomerAddress[]
  selectedAddressId: string
  birthday: string
  birthdayOfferUnlocked: boolean
  walletBalance: number
  averageOrderValue: number
  spendingByCategory: Array<{
    label: string
    amountLabel: string
    tone: 'gold' | 'silver' | 'demifine' | 'pearl'
  }>
  onlineCart: CustomerProductItem[]
  storeCart: CustomerProductItem[]
  storeCartStoreName: string
  wishlist: CustomerProductItem[]
  orderHistory: CustomerOrderSummary[]
  giftCards: CustomerGiftCard[]
}

export function formatCustomerAddress(address: CustomerAddress): string {
  return `${address.fullAddress}, ${address.city} - ${address.pincode}`
}

export function getSelectedAddress(profile: CustomerProfile): CustomerAddress | undefined {
  return (
    profile.addresses.find((entry) => entry.id === profile.selectedAddressId) ??
    profile.addresses[0]
  )
}
