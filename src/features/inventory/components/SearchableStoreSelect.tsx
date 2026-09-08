import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface SearchableStoreSelectProps {
  label: string
  value: string
  options: string[]
  allLabel?: string
  allowEmpty?: boolean
  onChange: (value: string) => void
}

export function SearchableStoreSelect({
  label,
  value,
  options,
  allLabel = 'All',
  allowEmpty = true,
  onChange,
}: SearchableStoreSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const sorted = useMemo(
    () => [...options].sort((a, b) => a.localeCompare(b)),
    [options],
  )

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((option) => option.toLowerCase().includes(q))
  }, [appliedQuery, sorted])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const display = value || allLabel

  return (
    <div ref={rootRef} className="relative min-w-[200px]">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span className="truncate">{display}</span>
        <ChevronDown className="size-4 shrink-0 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                placeholder={`Search ${label.toLowerCase()}`}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setAppliedQuery(query)
                  }
                }}
                className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-sm text-slate-700 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setAppliedQuery(query)}
              className="h-8 shrink-0 rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              Search
            </button>
          </div>
          <div className="mt-2 max-h-52 overflow-y-auto">
            {allowEmpty && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
                className={`flex w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  !value ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {allLabel}
              </button>
            )}
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className={`flex w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  value === option
                    ? 'bg-slate-100 font-medium text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-3 text-sm text-slate-500">No stores match that search.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
