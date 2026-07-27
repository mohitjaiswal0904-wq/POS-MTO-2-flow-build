import { Plus, RotateCcw } from 'lucide-react'

export function ActionBar({
  title,
  subtitle,
  onClear,
  onContinue,
  continueLabel,
  secondaryAction,
}: {
  title: string
  subtitle: string
  onClear: () => void
  onContinue: () => void
  continueLabel: string
  secondaryAction?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{subtitle}</p>
        <p className="text-base font-semibold text-slate-800">{title}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="size-4" />
            {secondaryAction.label}
          </button>
        )}
        <button
          type="button"
          onClick={onClear}
          className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="size-4" />
          Start over
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  )
}
