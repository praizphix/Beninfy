'use client'

import Link from 'next/link'
import Image from 'next/image'
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


export default function HeroSection() {
  const locale = useLocale()
  const t = useTranslations('hero')

  return (
    <section className="relative h-[614px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Benin landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-10 w-full">
        <div className="max-w-2xl">
          <motion.span
            className="text-secondary-fixed font-semibold text-sm uppercase tracking-widest mb-4 block"
            {...fadeUp(0)}
          >
            {t('badge')}
          </motion.span>
          <motion.h1
            className="text-white text-5xl font-bold mb-6 leading-tight"
            {...fadeUp(0.12)}
          >
            {t('title')} {t('titleHighlight')}
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg mb-8"
            {...fadeUp(0.24)}
          >
            {t('subtitle')}
          </motion.p>
          <motion.div
            className="flex gap-4"
            {...fadeUp(0.36)}
          >
            <Link
              href={`/${locale}/rides`}
              className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl flex items-center gap-2 font-semibold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              {t('ctaBook')} <span className="material-symbols-outlined">arrow_downward</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
