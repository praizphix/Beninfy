'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function WhyBeninfy() {
  const t = useTranslations('why')
  return (
    <section className="py-20 bg-surface-container-low">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-display-lg text-primary mb-4">{t('sectionTitle')}</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-body-lg">
            {t('sectionSubtitle')}
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 md:h-[560px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Large hero card */}
          <motion.div
            variants={{ hidden: { opacity: 0, x: -32 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
            className="md:col-span-2 md:row-span-2 bg-primary text-on-primary rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group"
          >
            <span className="material-symbols-outlined text-[72px] opacity-10 absolute -top-4 -right-4 group-hover:scale-125 transition-transform duration-500">
              security
            </span>
            <div>
              <h3 className="text-headline-lg mb-4">{t('heroCardTitle')}</h3>
              <p className="text-body-lg opacity-90 leading-relaxed">
                {t('heroCardDesc')}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-primary bg-primary-container flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-primary-container">
                      person
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-label-md opacity-80">{t('heroCardAgents')}</span>
            </div>
          </motion.div>

          {/* Gold card */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
            className="md:col-span-2 bg-secondary-container text-on-secondary-container rounded-3xl p-8 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-headline-md mb-2">{t('borderCardTitle')}</h3>
              <p className="text-body-md opacity-80">
                {t('borderCardDesc')}
              </p>
            </div>
            <span className="material-symbols-outlined text-[48px] text-secondary group-hover:rotate-12 transition-transform shrink-0 ml-4">
              assignment_ind
            </span>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
            className="bg-surface-container-highest rounded-3xl p-8 flex flex-col justify-center group"
          >
            <span className="material-symbols-outlined text-primary text-[40px] mb-4">lock</span>
            <h3 className="text-headline-sm mb-2">{t('privateCardTitle')}</h3>
            <p className="text-body-sm text-on-surface-variant">
              {t('privateCardDesc')}
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
            className="bg-surface-container-lowest rounded-3xl p-8 flex flex-col justify-center border border-outline-variant group"
          >
            <span className="material-symbols-outlined text-primary text-[40px] mb-4">
              airport_shuttle
            </span>
            <h3 className="text-headline-sm mb-2">{t('fleetCardTitle')}</h3>
            <p className="text-body-sm text-on-surface-variant">
              {t('fleetCardDesc')}
            </p>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-outline-variant"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {[
            { value: '5', labelKey: 'statsRoutes' },
            { value: '10K+', labelKey: 'statsPassengers' },
            { value: '4', labelKey: 'statsCountries' },
            { value: '24/7', labelKey: 'statsSupport' },
          ].map(({ value, labelKey }) => (
            <motion.div
              key={labelKey}
              className="text-center"
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
            >
              <div className="text-display-lg text-primary">{value}</div>
              <div className="text-label-md text-on-surface-variant mt-1">{t(labelKey)}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
