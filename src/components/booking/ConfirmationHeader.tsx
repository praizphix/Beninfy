'use client'

import { motion } from 'framer-motion'

interface Props {
  passengerName: string
  bookingRef: string
}

export default function ConfirmationHeader({ passengerName, bookingRef }: Props) {
  return (
    <section className="text-center mb-12">
      {/* Animated check circle */}
      <motion.div
        className="inline-flex items-center justify-center w-24 h-24 bg-primary-container rounded-full mb-6 shadow-lg border-4 border-surface"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <motion.span
          className="material-symbols-outlined text-on-primary-container text-[48px] icon-fill"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
        >
          check_circle
        </motion.span>
      </motion.div>

      <motion.h1
        className="text-display-lg text-primary mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      >
        Booking Confirmed!
      </motion.h1>

      <motion.p
        className="text-body-lg text-on-surface-variant"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
      >
        Thank you, {passengerName}. Beninfy&apos;s premium logistics service is on your side.
      </motion.p>

      <motion.div
        className="mt-5 inline-block bg-secondary-container px-6 py-2.5 rounded-full border border-secondary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
      >
        <span className="text-label-md text-on-secondary-container">Reference: #{bookingRef}</span>
      </motion.div>
    </section>
  )
}
