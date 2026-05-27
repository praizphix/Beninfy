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



const ROUTES = ['Lagos → Cotonou', 'Cotonou → Lagos', 'Lagos → Lomé', 'Accra → Lagos', 'Cotonou → Abuja']


export default function HeroSection() {
  const locale = useLocale()
  const t = useTranslations('hero')

  return (
    <section className="relative min-h-[600px] flex items-center pt-20 pb-36 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Hero Background"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
          className="object-cover"
        />
      </div>
      
      {/* Heavy overlay to reduce busyness and fix "rusty" look */}
      <div className="absolute inset-0 bg-gray-950/75 z-0 backdrop-blur-[4px]" />

      <div className="mx-auto max-w-[1280px] px-4 md:px-10 w-full text-white z-10 relative">
        {/* Headline */}
        <div className="max-w-xl mb-10">
          <motion.h1
            className="text-display-md md:text-display-lg text-white mb-4 leading-tight"
            {...fadeUp(0)}
          >
            {t('title')}<br />{t('titleHighlight')}
          </motion.h1>
          <motion.p
            className="text-body-md md:text-body-lg opacity-80"
            {...fadeUp(0.12)}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        

        {/* CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          {...fadeUp(0.36)}
        >
          <Link
            href={`/${locale}/rides`}
            className="rounded-xl bg-primary px-6 py-3.5 text-headline-sm text-on-primary shadow-lg hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.02] active:scale-95 transition-all"
          >
            {t('ctaBook')}
          </Link>
          <Link
            href={`/${locale}/tours`}
            className="rounded-xl border-2 border-secondary-container/80 text-secondary-container px-6 py-3.5 text-headline-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all"
          >
            {t('ctaExplore')}
          </Link>
        </motion.div>
      </div>

      </section>
  )
}
