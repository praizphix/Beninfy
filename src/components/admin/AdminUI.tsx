import type { ReactNode } from 'react'

type AdminPageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  icon?: string
  actions?: ReactNode
}

type AdminStatCardProps = {
  label: string
  value: ReactNode
  sub?: string
  icon: string
  tone?: 'purple' | 'gold' | 'green' | 'blue'
}

const statTones = {
  purple: 'bg-[#f8effa] text-[#3e004c]',
  gold: 'bg-[#fff7d6] text-[#735c00]',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-sky-50 text-sky-700',
}

export function AdminPageHeader({ eyebrow = 'Backoffice', title, description, icon = 'space_dashboard', actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_45px_rgba(62,0,76,0.08)]">
      <div className="relative px-4 py-5 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#3e004c,#7b3f89,#e0b94f)]" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3e004c] text-[22px] text-[#f4d66c]">
              {icon}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal text-[#3e004c]">{title}</h1>
              {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  )
}

export function AdminStatCard({ label, value, sub, icon, tone = 'purple' }: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_14px_35px_rgba(62,0,76,0.07)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">{label}</span>
        <span className={`material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl text-[20px] ${statTones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export function AdminStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const tone =
    normalized === 'confirmed' || normalized === 'paid' || normalized === 'available'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : normalized === 'cancelled' || normalized === 'failed' || normalized === 'inactive'
        ? 'bg-red-50 text-red-700 ring-red-100'
        : normalized === 'completed'
          ? 'bg-gray-100 text-gray-700 ring-gray-200'
          : 'bg-amber-50 text-amber-700 ring-amber-100'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${tone}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
