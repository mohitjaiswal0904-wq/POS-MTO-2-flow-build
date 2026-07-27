import { useMemo, useState } from 'react'
import { X, ChevronDown, ChevronUp, Check, CreditCard, Building2 } from 'lucide-react'
import type { BankAccount, OrderProduct, RefundMethod, ReturnItem, ReturnReason, ReturnRequest } from '@/features/orders/types'
import { RETURN_POLICY, RETURN_REASONS } from '@/features/orders/data/mockData'
import {
  buildReturnItem,
  calculateTotalRefund,
  getReturnableUnits,
  groupUnitsByProduct,
} from '@/features/orders/utils/returnLogic'

export interface ReturnSubmitPayload {
  items: ReturnItem[]
  refundMethod: RefundMethod
  bankAccount?: BankAccount
}

interface ReturnRequestModalProps {
  products: OrderProduct[]
  originalPaymentMethod: string
  existingReturnRequest: ReturnRequest | null
  onClose: () => void
  onSubmit: (payload: ReturnSubmitPayload) => void
}

interface UnitFormState {
  selected: boolean
  expanded: boolean
  reason: ReturnReason
  comment: string
}

const emptyBankAccount: BankAccount = {
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
}

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`
}

function createInitialFormState(
  products: OrderProduct[],
  existingReturnRequest: ReturnRequest | null,
): Record<string, UnitFormState> {
  return Object.fromEntries(
    getReturnableUnits(products, existingReturnRequest).map((unit) => [
      unit.unitId,
      {
        selected: false,
        expanded: false,
        reason: 'Changed mind' as ReturnReason,
        comment: '',
      },
    ]),
  )
}

export function ReturnRequestModal({
  products,
  originalPaymentMethod,
  existingReturnRequest,
  onClose,
  onSubmit,
}: ReturnRequestModalProps) {
  const returnableUnits = useMemo(
    () => getReturnableUnits(products, existingReturnRequest),
    [products, existingReturnRequest],
  )

  const groupedUnits = useMemo(
    () => groupUnitsByProduct(returnableUnits),
    [returnableUnits],
  )

  const [formState, setFormState] = useState<Record<string, UnitFormState>>(() =>
    createInitialFormState(products, existingReturnRequest),
  )
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(
    existingReturnRequest?.refundMethod ?? 'original',
  )
  const [bankAccount, setBankAccount] = useState<BankAccount>(
    existingReturnRequest?.bankAccount ?? emptyBankAccount,
  )

  const updateUnit = (unitId: string, updates: Partial<UnitFormState>) => {
    setFormState((prev) => ({
      ...prev,
      [unitId]: { ...prev[unitId], ...updates },
    }))
  }

  const toggleUnitSelection = (unitId: string) => {
    const current = formState[unitId]
    updateUnit(unitId, {
      selected: !current.selected,
      expanded: !current.selected ? true : current.expanded,
    })
  }

  const updateBankField = (field: keyof BankAccount, value: string) => {
    setBankAccount((prev) => ({ ...prev, [field]: value }))
  }

  const isBankFormValid =
    bankAccount.accountHolderName.trim() !== '' &&
    bankAccount.accountNumber.trim().length >= 9 &&
    bankAccount.ifscCode.trim().length === 11 &&
    bankAccount.bankName.trim() !== ''

  const selectedItems = useMemo(() => {
    return returnableUnits
      .filter((unit) => formState[unit.unitId]?.selected)
      .map((unit) => {
        const state = formState[unit.unitId]
        return buildReturnItem(unit, state.reason, state.comment)
      })
  }, [returnableUnits, formState])

  const totalRefund = calculateTotalRefund(selectedItems)

  const handleSubmit = () => {
    if (selectedItems.length === 0) return
    if (refundMethod === 'bank_transfer' && !isBankFormValid) return

    onSubmit({
      items: selectedItems,
      refundMethod,
      bankAccount: refundMethod === 'bank_transfer' ? bankAccount : undefined,
    })
  }

  const canSubmit =
    selectedItems.length > 0 && (refundMethod === 'original' || isBankFormValid)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50 shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-semibold text-slate-700">Return Request</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="mb-1 text-sm font-medium text-slate-700">Select Items to Return</p>
          <p className="mb-3 text-xs text-slate-500">
            Each product has a unique identity. Select and configure returns individually.
          </p>

          {returnableUnits.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              All items in this order have already been returned.
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(groupedUnits.entries()).map(([productId, units]) => {
                const firstUnit = units[0]
                return (
                  <div key={productId}>
                    {firstUnit.totalInLine > 1 && (
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        {firstUnit.name} · SKU {firstUnit.sku} · {units.length} unit
                        {units.length > 1 ? 's' : ''} available
                      </p>
                    )}
                    <div className="space-y-2">
                      {units.map((unit) => {
                        const state = formState[unit.unitId]
                        const unitRefund = buildReturnItem(unit, state.reason, state.comment).refundAmount

                        return (
                          <div
                            key={unit.unitId}
                            className={`rounded-[10px] border bg-white p-3 transition-colors ${
                              state.selected ? 'border-slate-900' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleUnitSelection(unit.unitId)}
                                className={`flex size-5 shrink-0 items-center justify-center rounded-[3px] ${
                                  state.selected ? 'bg-slate-900' : 'border border-slate-300 bg-white'
                                }`}
                              >
                                {state.selected && (
                                  <Check className="size-3.5 text-white" strokeWidth={3} />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-700">{unit.name}</p>
                                <p className="text-xs text-slate-500">
                                  ID: {unit.unitIdentity}
                                  {unit.totalInLine > 1 && ` · Unit ${unit.unitIndex} of ${unit.totalInLine}`}
                                </p>
                              </div>

                              <p className="text-sm font-semibold text-slate-700">
                                {formatPrice(unitRefund)}
                              </p>

                              {state.selected && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateUnit(unit.unitId, { expanded: !state.expanded })
                                  }
                                  className="text-slate-500"
                                >
                                  {state.expanded ? (
                                    <ChevronUp className="size-4" />
                                  ) : (
                                    <ChevronDown className="size-4" />
                                  )}
                                </button>
                              )}
                            </div>

                            {state.selected && state.expanded && (
                              <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                                <div>
                                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Reason for Return
                                  </label>
                                  <select
                                    value={state.reason}
                                    onChange={(e) =>
                                      updateUnit(unit.unitId, {
                                        reason: e.target.value as ReturnReason,
                                      })
                                    }
                                    className="h-9 w-full rounded-lg border border-black/10 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:outline-none"
                                  >
                                    {RETURN_REASONS.map((reason) => (
                                      <option key={reason} value={reason}>
                                        {reason}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Additional Comments
                                  </label>
                                  <textarea
                                    value={state.comment}
                                    onChange={(e) =>
                                      updateUnit(unit.unitId, { comment: e.target.value })
                                    }
                                    placeholder="Add details specific to this item..."
                                    rows={2}
                                    className="w-full resize-none rounded-lg border border-black/10 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="mt-4 rounded-[10px] border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Estimated Refund</p>
                <p className="text-lg font-semibold text-slate-900">{formatPrice(totalRefund)}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {selectedItems.length} individual item{selectedItems.length > 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Money Transfer Option</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setRefundMethod('original')}
                className={`flex w-full items-start gap-3 rounded-[10px] border p-3 text-left transition-colors ${
                  refundMethod === 'original'
                    ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    refundMethod === 'original' ? 'border-slate-900' : 'border-slate-300'
                  }`}
                >
                  {refundMethod === 'original' && (
                    <div className="size-2.5 rounded-full bg-slate-900" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Return to Origin</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Refund will be sent back to the original payment method ({originalPaymentMethod})
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRefundMethod('bank_transfer')}
                className={`flex w-full items-start gap-3 rounded-[10px] border p-3 text-left transition-colors ${
                  refundMethod === 'bank_transfer'
                    ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    refundMethod === 'bank_transfer' ? 'border-slate-900' : 'border-slate-300'
                  }`}
                >
                  {refundMethod === 'bank_transfer' && (
                    <div className="size-2.5 rounded-full bg-slate-900" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Add Bank Account</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Transfer refund amount directly to customer&apos;s bank account
                  </p>
                </div>
              </button>
            </div>

            {refundMethod === 'bank_transfer' && (
              <div className="mt-3 space-y-3 rounded-[10px] border border-slate-200 bg-white p-3">
                <p className="text-sm font-medium text-slate-700">Bank Account Details</p>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={bankAccount.accountHolderName}
                    onChange={(e) => updateBankField('accountHolderName', e.target.value)}
                    placeholder="Enter account holder name"
                    className="h-9 w-full rounded-lg border border-black/10 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankAccount.accountNumber}
                    onChange={(e) => updateBankField('accountNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter account number"
                    className="h-9 w-full rounded-lg border border-black/10 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">IFSC Code</label>
                    <input
                      type="text"
                      value={bankAccount.ifscCode}
                      onChange={(e) =>
                        updateBankField('ifscCode', e.target.value.toUpperCase().slice(0, 11))
                      }
                      placeholder="e.g. HDFC0001234"
                      className="h-9 w-full rounded-lg border border-black/10 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">Bank Name</label>
                    <input
                      type="text"
                      value={bankAccount.bankName}
                      onChange={(e) => updateBankField('bankName', e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="h-9 w-full rounded-lg border border-black/10 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[10px] bg-blue-50 p-4">
            <h3 className="text-base font-semibold text-blue-900">Return Policy</h3>
            <ul className="mt-2 space-y-1">
              {RETURN_POLICY.map((item) => (
                <li key={item} className="text-sm text-blue-800">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            Submit Return Request
          </button>
        </div>
      </div>
    </div>
  )
}
