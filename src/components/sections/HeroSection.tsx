'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

const EASE = [0.22, 1, 0.36, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  } as const
}

const TRUST_PILLS = [
  { icon: 'verified', label: 'Secure Checkout' },
  { icon: 'language', label: 'Bilingual Drivers' },
  { icon: 'shield', label: 'Border Protocol' },
]

export default function HeroSection() {
  const locale = useLocale()

  return (
    <section
      className="relative min-h-[600px] flex items-center pt-20 pb-36 overflow-hidden"
      style={{
        background:
          "linear-gradient(rgba(24,28,32,0.45), rgba(24,28,32,0.65)), url('https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80') center/cover no-repeat",
      }}
    >
      {/* Subtle animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      <div className="mx-auto max-w-[1280px] px-4 md:px-10 w-full text-white z-10">
        {/* Headline */}
        <div className="max-w-2xl mb-10">
          <motion.h1
            className="text-display-lg text-white mb-4"
            {...fadeUp(0)}
          >
            Private Cross-Border Travel<br />Across West Africa
          </motion.h1>
          <motion.p
            className="text-body-lg opacity-80"
            {...fadeUp(0.12)}
          >
            Travel safely between Lagos, Cotonou, Togo &amp; Ghana in premium private vehicles with
            expert border assistance.
          </motion.p>
        </div>

        {/* Trust pills */}
        <motion.div
          className="flex flex-wrap gap-3 mb-10"
          {...fadeUp(0.24)}
        >
          {TRUST_PILLS.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-label-md"
            >
              <span className="material-symbols-outlined text-[18px] icon-fill">{icon}</span>
              {label}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex flex-wrap gap-3"
          {...fadeUp(0.36)}
        >
          <Link
            href={`/${locale}/rides`}
            className="rounded-xl bg-primary px-8 py-4 text-headline-sm text-on-primary shadow-lg hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.02] active:scale-95 transition-all"
          >
            Book a Ride
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="rounded-xl border-2 border-secondary-container/80 text-secondary-container px-8 py-4 text-headline-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all"
          >
            Explore Tours
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
