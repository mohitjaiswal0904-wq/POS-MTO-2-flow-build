/** Format INR amounts for POS display. */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}
