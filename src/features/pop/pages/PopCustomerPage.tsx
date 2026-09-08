import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/shared/components/layout'
import { PopCustomerWorkspace } from '@/features/pop/components/PopCustomerWorkspace'

export function PopCustomerPage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f6f2]">
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="mx-auto max-w-[1360px]">
            <button
              type="button"
              onClick={() => navigate('/pop')}
              className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </button>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              Customer account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Collect instalments, complete KYC, and manage free gifts for this customer.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-[1360px] space-y-5 px-6 py-6">
          <PopCustomerWorkspace />
        </main>
      </div>
    </AppLayout>
  )
}
