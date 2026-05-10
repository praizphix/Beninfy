'use client'

import { motion } from 'framer-motion'

interface Step {
  n: number
  label: string
  done?: boolean
  active?: boolean
}

interface Props {
  steps: Step[]
}

export default function BookingSteps({ steps }: Props) {
  return (
    <motion.div
      className="flex items-center mb-10 max-w-lg"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      {steps.map(({ n, label, done, active }, i) => (
        <div key={n} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <motion.div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-label-sm font-semibold ${
                done
                  ? 'bg-primary text-on-primary'
                  : active
                  ? 'bg-primary text-on-primary ring-[3px] ring-offset-[3px] ring-primary/30'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.07 }}
            >
              {done ? (
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
              ) : n}
            </motion.div>
            <span className={`text-[11px] font-medium leading-none ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
              {label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <motion.div
              className={`flex-1 h-px mx-3 mb-5 ${done ? 'bg-primary' : 'bg-outline-variant'}`}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 + i * 0.07 }}
            />
          )}
        </div>
      ))}
    </motion.div>
  )
}
