import { useState } from 'react'
import { UserPlus, WalletCards } from 'lucide-react'
import { PaymentSearchModal } from '@/features/pop/components/PaymentSearchModal'
import { PopViewSwitch } from '@/features/pop/components/PopViewSwitch'

interface PopPageHeaderProps {
  onEnroll: () => void
}

export function PopPageHeader({ onEnroll }: PopPageHeaderProps) {
  const [paymentOpen, setPaymentOpen] = useState(false)

  return (
    <>
      <header className="flex h-[168px] shrink-0 flex-col border-b border-slate-200 bg-white px-6 pt-5">
        <div className="flex w-full min-h-0 flex-1 items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
                5 + 1 Plan
              </span>
              <span className="text-xs text-slate-400">Plan of Purchase</span>
            </div>
            <h1 className="mt-2 truncate text-[26px] font-semibold tracking-tight text-slate-900">
              Customer savings plan
            </h1>
            <p className="mt-1 truncate text-sm text-slate-500">
              Enroll customers, calculate benefits, and explain redemption in one place.
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPaymentOpen(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              <WalletCards className="size-4" />
              Payment
            </button>
            <button
              type="button"
              onClick={onEnroll}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <UserPlus className="size-4" />
              Enroll customer
            </button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1360px]">
          <PopViewSwitch />
        </div>
      </header>

      {paymentOpen && <PaymentSearchModal onClose={() => setPaymentOpen(false)} />}
    </>
  )
}
