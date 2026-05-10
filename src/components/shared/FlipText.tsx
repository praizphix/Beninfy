'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FlipTextProps {
  /** Array of strings to cycle through */
  texts: string[]
  /** Milliseconds between flips. Default 2800 */
  interval?: number
  className?: string
  charClassName?: string
}

/** Airport departure-board style flip animation for individual characters */
function FlipChar({ char, delay }: { char: string; delay: number }) {
  return (
    <motion.span
      className="inline-block origin-top"
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: 90, opacity: 0 }}
      transition={{
        rotateX: { duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.12, delay },
      }}
      style={{ perspective: 400 }}
    >
      {char === ' ' ? '\u00a0' : char}
    </motion.span>
  )
}

/** Cycles through a list of texts with a flip-tile departure-board animation */
export default function FlipText({ texts, interval = 2800, className, charClassName }: FlipTextProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % texts.length), interval)
    return () => clearInterval(id)
  }, [texts.length, interval])

  const current = texts[index]

  return (
    <span
      className={`inline-flex overflow-hidden ${className ?? ''}`}
      style={{ perspective: 600 }}
      aria-live="polite"
      aria-label={current}
    >
      <AnimatePresence mode="wait">
        <motion.span key={current} className={`inline-flex ${charClassName ?? ''}`}>
          {current.split('').map((char, i) => (
            <FlipChar key={`${current}-${i}`} char={char} delay={i * 0.03} />
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
