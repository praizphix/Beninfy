'use client'

import CountUp from 'react-countup'
import { motion, type Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { BusFront, Clock3, MapPinned, Route, ShieldCheck } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const stages = [
  { city: 'Lagos', country: 'NG', x: '8%', y: '68%' },
  { city: 'Seme', country: 'NG/BJ', x: '29%', y: '58%' },
  { city: 'Cotonou', country: 'BJ', x: '47%', y: '50%' },
  { city: 'Lome', country: 'TG', x: '68%', y: '42%' },
  { city: 'Accra', country: 'GH', x: '91%', y: '34%' },
]

const capabilities = [
  { icon: ShieldCheck, key: 'border' },
  { icon: Clock3, key: 'dispatch' },
  { icon: MapPinned, key: 'coverage' },
]

const stats = [
  { value: 50000, suffix: '+', key: 'passengers' },
  { value: 12, suffix: '+', key: 'cities' },
  { value: 98, suffix: '%', key: 'satisfaction' },
  { value: 150, suffix: '+', key: 'monthlyTrips' },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE } },
}

export default function JourneyIntelligence() {
  const t = useTranslations('journey')

  return (
    <section className="relative overflow-hidden bg-[#11151c] py-20 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(62,0,76,0.92),rgba(17,21,28,0.96)_48%,rgba(115,92,0,0.74))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 md:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-label-sm font-medium text-secondary-fixed"
          >
            <Route className="h-4 w-4" aria-hidden="true" />
            {t('badge')}
          </motion.span>
          <motion.h2 variants={fadeUp} className="mt-5 max-w-xl text-display-md text-white md:text-display-lg">
            {t('title')}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-xl text-body-lg leading-8 text-white/72">
            {t('subtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 grid gap-3 sm:grid-cols-3">
            {capabilities.map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-xl border border-white/12 bg-white/[0.07] p-4 backdrop-blur">
                <Icon className="h-5 w-5 text-secondary-fixed" aria-hidden="true" />
                <h3 className="mt-3 text-label-md text-white">{t(`capabilities.${key}.title`)}</h3>
                <p className="mt-1 text-body-sm leading-6 text-white/62">{t(`capabilities.${key}.desc`)}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.key} className="border-l border-white/14 pl-4">
                <div className="text-headline-md text-secondary-fixed">
                  <CountUp end={stat.value} suffix={stat.suffix} enableScrollSpy scrollSpyOnce duration={1.8} separator="," />
                </div>
                <div className="mt-1 text-label-sm text-white/60">{t(`stats.${stat.key}`)}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative min-h-[430px] overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur md:min-h-[520px]"
          initial={{ opacity: 0, scale: 0.96, y: 28 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute left-[8%] right-[9%] top-[34%] h-[3px] origin-left -rotate-[15deg] rounded-full bg-white/20" />
          <motion.div
            className="absolute left-[8%] right-[9%] top-[34%] h-[3px] origin-left -rotate-[15deg] rounded-full bg-secondary-fixed"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.35, ease: EASE }}
          />

          {stages.map((stage, index) => (
            <motion.div
              key={stage.city}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: stage.x, top: stage.y }}
              initial={{ opacity: 0, scale: 0.72 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.42 + index * 0.13, ease: EASE }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#11151c] shadow-lg shadow-black/30">
                <span className="h-3 w-3 rounded-full bg-secondary-fixed shadow-[0_0_0_8px_rgba(254,214,91,0.16)]" />
              </div>
              <div className="mt-3 min-w-24 rounded-xl border border-white/12 bg-black/34 px-3 py-2 text-center backdrop-blur">
                <div className="text-label-md text-white">{stage.city}</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">{stage.country}</div>
              </div>
            </motion.div>
          ))}

          <motion.div
            className="absolute z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-fixed text-on-secondary-container shadow-xl shadow-secondary/25"
            initial={{ left: '8%', top: '68%' }}
            whileInView={{ left: '91%', top: '34%' }}
            viewport={{ once: true }}
            transition={{ duration: 4.5, delay: 0.75, ease: 'easeInOut' }}
          >
            <BusFront className="h-7 w-7" aria-hidden="true" />
          </motion.div>

          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/12 bg-black/34 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-label-sm uppercase tracking-[0.18em] text-secondary-fixed">{t('panelLabel')}</p>
                <p className="mt-1 text-body-sm text-white/64">{t('panelText')}</p>
              </div>
              <div className="hidden rounded-xl bg-white/10 px-4 py-3 text-right sm:block">
                <p className="text-headline-sm text-white">4</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">{t('countries')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
