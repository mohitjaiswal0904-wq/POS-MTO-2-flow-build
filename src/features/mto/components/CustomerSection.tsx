import { User } from 'lucide-react'
import type { MtoCustomerInfo } from '@/features/mto/types'
import { Field } from '@/shared/ui'

export function CustomerSection({
  customer,
  onChange,
}: {
  customer: MtoCustomerInfo
  onChange: (next: MtoCustomerInfo) => void
}) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
          <User className="size-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Customer & Order Information</h2>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Customer Name"
            value={customer.customerName}
            placeholder="Enter customer name"
            onChange={(value) => onChange({ ...customer, customerName: value })}
          />
          <Field
            label="Customer Phone"
            value={customer.customerPhone}
            placeholder="Enter phone number"
            onChange={(value) => onChange({ ...customer, customerPhone: value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Customer Address
          </label>
          <textarea
            value={customer.customerAddress}
            onChange={(e) => onChange({ ...customer, customerAddress: e.target.value })}
            placeholder="Enter complete address"
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Customer Email"
            value={customer.customerEmail}
            placeholder="Enter email address"
            onChange={(value) => onChange({ ...customer, customerEmail: value })}
          />
          <Field
            label="Order Number"
            value={customer.orderNumber}
            placeholder="Auto-generated if empty"
            onChange={(value) => onChange({ ...customer, orderNumber: value })}
          />
          <Field
            label="Invoice Number"
            value={customer.invoiceNumber}
            placeholder="Enter invoice number"
            onChange={(value) => onChange({ ...customer, invoiceNumber: value })}
          />
          <Field
            label="Committed Delivery Date"
            type="date"
            value={customer.committedDeliveryDate}
            placeholder=""
            onChange={(value) => onChange({ ...customer, committedDeliveryDate: value })}
          />
        </div>

        <Field
          label="Ship from Store"
          value={customer.shipFromStore}
          placeholder=""
          disabled
          onChange={() => undefined}
        />
      </div>
    </section>
  )
}
