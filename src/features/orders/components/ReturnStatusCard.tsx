import { RotateCcw, CreditCard, Building2 } from 'lucide-react'
import type { ReturnRequest } from '@/features/orders/types'

interface ReturnStatusCardProps {
  request: ReturnRequest
}

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`
}

function maskAccountNumber(accountNumber: string) {
  if (accountNumber.length <= 4) return accountNumber
  return `****${accountNumber.slice(-4)}`
}

export function ReturnStatusCard({ request }: ReturnStatusCardProps) {
  return (
    <div className="rounded-[10px] border-l-4 border-blue-500 bg-blue-50 p-3">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="size-5 text-blue-800" />
          <h3 className="text-lg font-semibold text-blue-900">Return Request</h3>
        </div>
        <span className="rounded-lg bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          {request.status}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-sm font-medium text-blue-600">Request ID</p>
          <p className="text-sm text-blue-900">{request.id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-blue-600">Requested On</p>
          <p className="text-sm text-blue-900">{request.requestedOn}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-blue-600">Pickup Status</p>
          <p className="text-sm text-blue-900">{request.pickupStatus}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-blue-600">Refund Amount</p>
          <p className="text-sm text-blue-900">{formatPrice(request.refundAmount)}</p>
        </div>
      </div>

      <div className="mb-3 rounded-[10px] border border-blue-200 bg-white p-3">
        <p className="mb-2 text-sm font-medium text-blue-600">Refund Method</p>
        {request.refundMethod === 'original' ? (
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-blue-800" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Return to Origin</p>
              <p className="text-sm text-blue-800">
                Refund to {request.originalPaymentMethod ?? 'original payment method'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-4 text-blue-800" />
            <div className="grid flex-1 grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium text-blue-600">Account Holder</p>
                <p className="text-blue-900">{request.bankAccount?.accountHolderName}</p>
              </div>
              <div>
                <p className="font-medium text-blue-600">Account Number</p>
                <p className="text-blue-900">
                  {maskAccountNumber(request.bankAccount?.accountNumber ?? '')}
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-600">IFSC Code</p>
                <p className="text-blue-900">{request.bankAccount?.ifscCode}</p>
              </div>
              <div>
                <p className="font-medium text-blue-600">Bank Name</p>
                <p className="text-blue-900">{request.bankAccount?.bankName}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-blue-600">Comment</p>
          <p className="text-sm text-blue-900">{request.comment}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-blue-600">Tracking</p>
          <p className="text-sm text-blue-900">{request.tracking}</p>
        </div>
      </div>

      <div className="space-y-2">
        {request.items.map((item) => (
          <div
            key={item.unitId}
            className="rounded-[10px] border border-slate-200 bg-white p-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700">{item.name}</p>
                <p className="text-xs text-slate-500">
                  ID: {item.unitIdentity} · SKU: {item.sku}
                </p>
              </div>
              <p className="text-base font-semibold text-slate-700">
                {formatPrice(item.refundAmount)}
              </p>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 border-t border-slate-100 pt-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-blue-600">Reason</p>
                <p className="text-sm text-blue-900">{item.reason}</p>
              </div>
              {item.comment && (
                <div>
                  <p className="text-xs font-medium text-blue-600">Comment</p>
                  <p className="text-sm text-blue-900">{item.comment}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
