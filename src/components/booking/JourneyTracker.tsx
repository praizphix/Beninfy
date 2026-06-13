'use client'

import { motion } from 'framer-motion'

interface Step {
  n: number
  label: string
  done?: boolean
  active?: boolean
}

/** Mini inline bus SVG */
function BusSVG() {
  return (
    <svg width="34" height="20" viewBox="0 0 34 20" fill="none" aria-hidden>
      {/* body */}
      <rect x="1" y="2" width="30" height="13" rx="3" fill="#3e004c" />
      {/* windows */}
      <rect x="3" y="4" width="6" height="5" rx="1" fill="#c4b5fd" />
      <rect x="11" y="4" width="6" height="5" rx="1" fill="#c4b5fd" />
      <rect x="19" y="4" width="7" height="5" rx="1" fill="#c4b5fd" />
      {/* underbody */}
      <rect x="1" y="12" width="30" height="3" rx="0" fill="#2d0038" />
      {/* wheels */}
      <circle cx="8" cy="17" r="3" fill="#1f2937" />
      <circle cx="8" cy="17" r="1.5" fill="#6b7280" />
      <circle cx="25" cy="17" r="3" fill="#1f2937" />
      <circle cx="25" cy="17" r="1.5" fill="#6b7280" />
      {/* headlight */}
      <rect x="31" y="7" width="2" height="3" rx="1" fill="#fbbf24" />
      {/* taillight */}
      <rect x="1" y="7" width="2" height="3" rx="1" fill="#ef4444" />
    </svg>
  )
}

export default function JourneyTracker({ steps }: { steps: Step[] }) {
  const activeIndex = steps.findIndex((s) => s.active)
  const currentIndex = activeIndex >= 0 ? activeIndex : steps.filter((s) => s.done).length
  const progress = steps.length > 1 ? currentIndex / (steps.length - 1) : 0

  // Number of dashes to show in road center line
  const DASHES = 9

  return (
    <div className="mb-6 select-none overflow-x-auto px-1 pb-2 md:mb-10">
      <div className="min-w-[440px]">
      {/* Road + vehicle layer */}
      <div className="relative" style={{ height: 56 }}>
        {/* Road surface */}
        <div className="absolute left-0 right-0 top-6 h-7 bg-gray-900 rounded-full overflow-hidden">
          {/* Asphalt texture lines */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(255,255,255,0.15) 18px,rgba(255,255,255,0.15) 19px)',
            }}
          />
          {/* Center dashes */}
          <div className="absolute inset-0 flex items-center justify-between px-5">
            {Array.from({ length: DASHES }).map((_, i) => (
              <motion.div
                key={i}
                className="h-0.5 rounded-full bg-yellow-400"
                style={{ width: 20, opacity: 0.7 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.25 }}
              />
            ))}
          </div>
          {/* Progress fill (completed road) */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, #4a0059, #7c3aed 90%)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${Math.max(progress * 100, 3)}%` }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Step marker circles ON the road */}
        <div className="absolute left-0 right-0 top-6 h-7 flex items-center justify-between px-4 z-10">
          {steps.map((step, i) => {
            const isDone = !!step.done
            const isActive = !!step.active
            return (
              <motion.div
                key={step.n}
                className="relative flex items-center justify-center"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: isDone
                    ? '#22c55e'
                    : isActive
                      ? '#fff'
                      : '#374151',
                  border: isActive ? '2.5px solid #7c3aed' : 'none',
                  boxShadow: isActive
                    ? '0 0 0 3px rgba(124,58,237,0.35), 0 0 12px rgba(124,58,237,0.5)'
                    : isDone
                      ? '0 0 0 2px rgba(34,197,94,0.4)'
                      : 'none',
                  zIndex: 20,
                }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i + 0.2, type: 'spring', stiffness: 280, damping: 20 }}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#7c3aed' }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                ) : (
                  <span className="text-[9px] font-bold text-gray-400">{step.n}</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Animated bus */}
        <motion.div
          className="absolute z-30"
          style={{ top: 0 }}
          initial={{ left: '-2%' }}
          animate={{ left: `calc(${progress * 100}% - 17px)` }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Bounce while active */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BusSVG />
          </motion.div>
        </motion.div>
      </div>

      {/* Step labels below road */}
      <div className="flex justify-between px-1 mt-2">
        {steps.map((step) => (
          <div key={step.n} className="flex flex-col items-center gap-0.5" style={{ minWidth: 50 }}>
            <span
              className="text-[11px] font-semibold text-center leading-tight"
              style={{
                color: step.done ? '#22c55e' : step.active ? '#3e004c' : '#9ca3af',
              }}
            >
              {step.label}
            </span>
            {step.active && (
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#7c3aed' }}>
                Now
              </span>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}
