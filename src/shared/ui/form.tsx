import type { ReactNode } from 'react'

export function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-slate-100 py-6 first:border-t-0 first:pt-0">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function Field({
  label,
  value,
  placeholder,
  onChange,
  type = 'text',
  disabled = false,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
        {disabled && <span className="ml-2 text-xs font-normal text-slate-400">(locked)</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-slate-300 focus:outline-none ${
          disabled
            ? 'cursor-not-allowed bg-slate-100 text-slate-500'
            : 'bg-white text-slate-700 placeholder:text-slate-400'
        }`}
      />
    </div>
  )
}

export function CurrencyField({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          ₹
        </span>
        <input
          type="number"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`h-9 w-full rounded-lg border border-slate-200 pl-7 pr-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none ${
            readOnly ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white'
          }`}
        />
      </div>
    </div>
  )
}
