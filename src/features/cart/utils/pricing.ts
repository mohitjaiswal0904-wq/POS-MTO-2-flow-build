import type { CartItem } from '@/features/cart/types'
import { GIFT_WRAP_FEE } from '@/features/cart/data/cartData'

export function getItemLineTotal(item: CartItem): number {
  const wrap = item.giftWrap ? GIFT_WRAP_FEE * item.quantity : 0
  return item.price * item.quantity + wrap
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getItemLineTotal(item), 0)
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
