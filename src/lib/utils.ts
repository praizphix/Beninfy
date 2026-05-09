import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'NGN' | 'XOF' = 'NGN') {
  return new Intl.NumberFormat(currency === 'XOF' ? 'fr-BJ' : 'en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Alias for Naira formatting: returns e.g. "₦160,000" */
export const formatNGN = (amount: number) => formatCurrency(amount, 'NGN')

export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}
