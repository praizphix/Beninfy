'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

interface RouteMapSVGProps {
  from: string
  to: string
  /** Duration in hours, e.g. "~6 hrs" */
  duration?: string
  /** Distance label, e.g. "~140 km" */
  distance?: string
  className?: string
}

const W = 360
const H = 100
const PATH_D = `M 28 65 C 80 10, 280 10, 332 65`

/** Inline car icon (top-view silhouette) */
function CarIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
      <rect x="2" y="3" width="14" height="7" rx="2" fill="#3e004c" />
      <rect x="4" y="1.5" width="10" height="5" rx="1.5" fill="#7c3aed" />
      {/* headlights */}
      <circle cx="16" cy="6" r="1.2" fill="#fbbf24" />
      {/* wheels */}
      <circle cx="5" cy="10.5" r="1.5" fill="#1f2937" />
      <circle cx="13" cy="10.5" r="1.5" fill="#1f2937" />
    </svg>
  )
}

export default function RouteMapSVG({ from, to, duration, distance, className }: RouteMapSVGProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const progress = useMotionValue(0)
  const [pos, setPos] = useState({ x: 28, y: 65 })
  const [angle, setAngle] = useState(0)

  // Animate vehicle along the SVG path using getTotalLength / getPointAtLength
  useEffect(() => {
    const unsubscribe = progress.on('change', (p) => {
      const el = pathRef.current
      if (!el) return
      const len = el.getTotalLength()
      const pt = el.getPointAtLength(p * len)
      const pt2 = el.getPointAtLength(Math.min((p + 0.01) * len, len))
      const dx = pt2.x - pt.x
      const dy = pt2.y - pt.y
      setPos({ x: pt.x, y: pt.y })
      setAngle(Math.atan2(dy, dx) * (180 / Math.PI))
    })

    // Start animation after mount
    const ctrl = animate(progress, [0, 1], {
      duration: 5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 1.5,
      repeatType: 'loop',
    })

    return () => {
      unsubscribe()
      ctrl.stop()
    }
  }, [progress])

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        viewBox={`0 0 ${W} ${H + 30}`}
        width="100%"
        style={{ overflow: 'visible' }}
        aria-label={`Route from ${from} to ${to}`}
      >
        {/* Road shadow / base */}
        <path
          d={PATH_D}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Road surface */}
        <path
          d={PATH_D}
          stroke="#d1d5db"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Animated road draw – purple progress */}
        <motion.path
          d={PATH_D}
          stroke="#7c3aed"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />

        {/* Center dashes on road */}
        <path
          d={PATH_D}
          stroke="#fbbf24"
          strokeWidth="1"
          strokeDasharray="8 12"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Hidden path ref for getPointAtLength */}
        <path ref={pathRef} d={PATH_D} stroke="none" fill="none" />

        {/* Origin city dot + label */}
        <motion.circle
          cx="28" cy="65" r="7"
          fill="#3e004c"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        />
        <circle cx="28" cy="65" r="3.5" fill="#fff" />

        {/* Destination city dot + label */}
        <motion.circle
          cx="332" cy="65" r="7"
          fill="#735c00"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        />
        <circle cx="332" cy="65" r="3.5" fill="#fff" />

        {/* City labels */}
        <motion.text
          x="28" y="85"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#3e004c"
          fontFamily="inherit"
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 85 }}
          transition={{ delay: 0.5 }}
        >
          {from}
        </motion.text>
        <motion.text
          x="332" y="85"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#735c00"
          fontFamily="inherit"
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 85 }}
          transition={{ delay: 0.7 }}
        >
          {to}
        </motion.text>

        {/* Mid-route label */}
        {(duration || distance) && (
          <motion.text
            x="180" y="20"
            textAnchor="middle"
            fontSize="8"
            fill="#6b7280"
            fontFamily="inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[duration, distance].filter(Boolean).join(' · ')}
          </motion.text>
        )}

        {/* Moving vehicle */}
        <g
          transform={`translate(${pos.x - 9}, ${pos.y - 6}) rotate(${angle}, 9, 6)`}
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
        >
          <rect x="1" y="2" width="16" height="8" rx="2" fill="#3e004c" />
          <rect x="3" y="0.5" width="10" height="5.5" rx="1.5" fill="#7c3aed" />
          <circle cx="16.5" cy="7" r="1.2" fill="#fbbf24" />
          <circle cx="4.5" cy="10.5" r="1.4" fill="#1f2937" />
          <circle cx="13.5" cy="10.5" r="1.4" fill="#1f2937" />
        </g>
      </svg>
    </div>
  )
}
