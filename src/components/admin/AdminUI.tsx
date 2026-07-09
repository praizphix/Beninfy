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

type AdminModalProps = {
  open: boolean
  title: string
  eyebrow?: string
  description?: string
  icon?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  maxWidth?: 'md' | 'lg' | 'xl'
}

const modalWidths = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
}

export const adminInputClass =
  'w-full rounded-xl border border-gray-200 bg-[#fbf7fc] px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#3e004c] focus:bg-white focus:ring-2 focus:ring-[#3e004c]/15'

export const adminCompactInputClass =
  'rounded-lg border border-gray-200 bg-[#fbf7fc] px-2 py-2 text-xs outline-none transition focus:border-[#3e004c] focus:bg-white focus:ring-2 focus:ring-[#3e004c]/15'

export const adminLabelClass = 'mb-1.5 block text-xs font-semibold text-gray-600'

export const adminPrimaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#3e004c] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(62,0,76,0.18)] transition-colors hover:bg-[#50115f] disabled:cursor-not-allowed disabled:opacity-60'

export const adminSecondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50'

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

export function AdminModal({
  open,
  title,
  eyebrow = 'Backoffice',
  description,
  icon = 'edit_square',
  children,
  footer,
  onClose,
  maxWidth = 'lg',
}: AdminModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-[#16001d]/55 p-3 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-[calc(100dvh-1.5rem)] w-full ${modalWidths[maxWidth]} flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_30px_80px_rgba(22,0,29,0.35)] sm:max-h-[calc(100dvh-2rem)]`}
      >
        <div className="shrink-0 border-b border-gray-100 bg-[#fbf7fc] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[20px] text-[#3e004c] shadow-sm">
                {icon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">{eyebrow}</p>
                <h2 className="mt-1 truncate text-lg font-bold text-[#3e004c]">{title}</h2>
                {description && <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
        <div className="admin-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">{children}</div>
        {footer && <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-6">{footer}</div>}
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
