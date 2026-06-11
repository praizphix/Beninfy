'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'

const EASE = [0.22, 1, 0.36, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  } as const
}

export default function HeroSection() {
  const locale = useLocale()
  const t = useTranslations('hero')

  return (
    <section className="relative min-h-[530px] md:min-h-[614px] flex flex-col justify-end md:justify-center overflow-hidden pb-16 md:pb-0">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Benin landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-75 md:brightness-100"
        />
        {/* Mobile Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:hidden"></div>
        {/* Desktop Gradient overlay */}
        <div className="hidden md:block absolute inset-0 bg-primary/30 mix-blend-multiply"></div>
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-10 w-full mb-8 md:mb-0">
        <div className="max-w-2xl">
          {/* Desktop Badge */}
          <motion.span
            className="hidden md:block text-secondary-fixed font-semibold text-sm uppercase tracking-widest mb-4"
            {...fadeUp(0)}
          >
            {t('badge')}
          </motion.span>
          
          {/* Headline */}
          <motion.h1
            className="text-white text-[48px] leading-[56px] md:text-5xl font-bold mb-4 md:mb-6 drop-shadow-lg md:drop-shadow-none"
            {...fadeUp(0.12)}
          >
            {t('title')}<br className="md:hidden" /> <span className="text-secondary-fixed md:text-white">{t('titleHighlight')}</span>
          </motion.h1>
          
          {/* Desktop Subtitle */}
          <motion.p
            className="hidden md:block text-white/80 text-lg mb-8"
            {...fadeUp(0.24)}
          >
            {t('subtitle')}
          </motion.p>
          
          {/* Desktop CTA */}
          <motion.div
            className="hidden md:flex gap-4"
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
