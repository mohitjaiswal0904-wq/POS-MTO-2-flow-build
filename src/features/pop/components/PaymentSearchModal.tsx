import { useState, type FormEvent } from 'react'
import { Search, WalletCards, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getPopCustomerByPhone } from '@/features/pop/data/popPlans'

interface PaymentSearchModalProps {
  onClose: () => void
}

export function PaymentSearchModal({ onClose }: PaymentSearchModalProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const digits = query.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Enter a 10-digit mobile number.')
      return
    }
    const customer = getPopCustomerByPhone(digits)
    if (!customer) {
      setError('No customer or POP plan found for this number.')
      return
    }
    onClose()
    navigate(`/pop/lookup?phone=${digits}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <WalletCards className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Collect payment</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Search by phone number to open the customer account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <label htmlFor="payment-phone" className="text-sm font-medium text-slate-700">
            Phone number
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="payment-phone"
              type="tel"
              inputMode="numeric"
              autoFocus
              maxLength={14}
              value={query}
              placeholder="Enter 10-digit phone number"
              onChange={(event) => {
                setQuery(event.target.value.replace(/[^\d]/g, '').slice(0, 10))
                setError('')
              }}
              className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>
          <p className="text-xs text-slate-400">Try 8090835885 or 9876543210</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Open account
          </button>
        </div>
      </form>
    </div>
  )
}
