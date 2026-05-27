'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import FlipText from '@/components/shared/FlipText'

const EASE = [0.22, 1, 0.36, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  } as const
}

const TRUST_PILL_ICONS = [
  { icon: 'verified', key: 'trustSecure' },
  { icon: 'language', key: 'trustDrivers' },
  { icon: 'shield', key: 'trustBorder' },
] as const

const ROUTES = ['Lagos → Cotonou', 'Cotonou → Lagos', 'Lagos → Lomé', 'Accra → Lagos', 'Cotonou → Abuja']

/** Simple bus SVG for hero road strip */
function HeroBus() {
  return (
    <svg width="64" height="38" viewBox="0 0 64 38" fill="none" aria-hidden>
      <rect x="2" y="4" width="56" height="24" rx="5" fill="rgba(255,255,255,0.18)" />
      <rect x="6" y="7" width="10" height="9" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="20" y="7" width="10" height="9" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="34" y="7" width="10" height="9" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="2" y="22" width="56" height="6" rx="0" fill="rgba(0,0,0,0.2)" />
      <circle cx="14" cy="33" r="5" fill="rgba(0,0,0,0.4)" />
      <circle cx="14" cy="33" r="2.5" fill="rgba(255,255,255,0.3)" />
      <circle cx="48" cy="33" r="5" fill="rgba(0,0,0,0.4)" />
      <circle cx="48" cy="33" r="2.5" fill="rgba(255,255,255,0.3)" />
      <rect x="58" y="12" width="4" height="6" rx="2" fill="#fbbf24" />
    </svg>
  )
}

export default function HeroSection() {
  const locale = useLocale()
  const t = useTranslations('hero')

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
            {t('title')}<br />{t('titleHighlight')}
          </motion.h1>
          <motion.p
            className="text-body-lg opacity-80"
            {...fadeUp(0.12)}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Trust pills */}
        <motion.div
          className="flex flex-wrap gap-3 mb-10"
          {...fadeUp(0.24)}
        >
          {TRUST_PILL_ICONS.map(({ icon, key }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-label-md"
            >
              <span className="material-symbols-outlined text-[18px] icon-fill">{icon}</span>
              {t(key)}
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
            {t('ctaBook')}
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="rounded-xl border-2 border-secondary-container/80 text-secondary-container px-8 py-4 text-headline-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all"
          >
            {t('ctaExplore')}
          </Link>
        </motion.div>
      </div>

      {/* Animated road strip with bus at bottom of hero */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-14 pointer-events-none">
        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-900/60 backdrop-blur-sm" />
        {/* Center line dashes — scroll animation */}
        <motion.div
          className="absolute bottom-3.5 left-0 flex gap-6"
          style={{ width: '200%' }}
          animate={{ x: [0, '-50%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-0.5 w-8 bg-yellow-400/50 rounded-full shrink-0" />
          ))}
        </motion.div>
        {/* Driving bus */}
        <motion.div
          className="absolute bottom-2"
          animate={{ x: ['110vw', '-80px'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <HeroBus />
        </motion.div>
      </div>
    </section>
  )
}
