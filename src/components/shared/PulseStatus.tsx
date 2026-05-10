'use client'

import { motion } from 'framer-motion'

type StatusType = 'on-time' | 'en-route' | 'boarding' | 'delayed' | 'arrived' | 'cancelled'

const STATUS_CONFIG: Record<
  StatusType,
  { label: string; color: string; bg: string; ring: string }
> = {
  'on-time':   { label: 'On Time',   color: '#16a34a', bg: '#dcfce7', ring: '#86efac' },
  'en-route':  { label: 'En Route',  color: '#2563eb', bg: '#dbeafe', ring: '#93c5fd' },
  'boarding':  { label: 'Boarding',  color: '#7c3aed', bg: '#ede9fe', ring: '#c4b5fd' },
  'delayed':   { label: 'Delayed',   color: '#d97706', bg: '#fef3c7', ring: '#fcd34d' },
  'arrived':   { label: 'Arrived',   color: '#0891b2', bg: '#cffafe', ring: '#67e8f9' },
  'cancelled': { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5' },
}

interface PulseStatusProps {
  status: StatusType
  showIcon?: boolean
  className?: string
}

/** Transport status badge with a pulsing dot indicator */
export default function PulseStatus({ status, showIcon = true, className }: PulseStatusProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none ${className ?? ''}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {showIcon && (
        <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
          {/* Pulsing ring */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: cfg.ring }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Solid center dot */}
          <span
            className="relative w-2 h-2 rounded-full"
            style={{ background: cfg.color }}
          />
        </span>
      )}
      {cfg.label}
    </span>
  )
}

/** Departure board row — shows route + time + status */
interface DepartureRowProps {
  from: string
  to: string
  time: string
  status: StatusType
  vehicle?: string
}

export function DepartureRow({ from, to, time, status, vehicle }: DepartureRowProps) {
  return (
    <motion.div
      className="flex items-center gap-4 px-4 py-3 bg-gray-900 rounded-xl border border-gray-800 font-mono"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Time */}
      <span className="text-yellow-400 font-bold text-sm w-12 shrink-0">{time}</span>
      {/* Route */}
      <span className="text-white text-sm flex-1 truncate">
        {from} <span className="text-gray-500 mx-1">→</span> {to}
      </span>
      {/* Vehicle */}
      {vehicle && (
        <span className="text-gray-400 text-xs shrink-0 hidden md:block">{vehicle}</span>
      )}
      {/* Status */}
      <PulseStatus status={status} />
    </motion.div>
  )
}
