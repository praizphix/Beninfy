'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'

export default function Footer() {
  const locale = useLocale()
  const t = useTranslations('footer')

  return (
    <footer className="bg-surface-dim border-t border-outline-variant py-10 md:py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href={`/${locale}`} className="block mb-4">
            <Image
              src="/logo.png"
              alt="Beninfy"
              width={110}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <p className="text-body-sm text-on-surface-variant md:pr-8 leading-relaxed">
            {t('tagline')}
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cursor-pointer hover:text-primary text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="cursor-pointer hover:text-primary text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">language</span>
            </a>
            <a href="mailto:support@beninfy.africa" aria-label="Email" className="cursor-pointer hover:text-primary text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-label-md font-bold mb-4 uppercase tracking-wider text-on-surface">
            {t('services')}
          </h4>
          <ul className="flex flex-col gap-3 text-label-md text-on-surface-variant">
            {[
              { labelKey: 'privateRides', href: '/rides' },
              { labelKey: 'vipEscorts', href: '/rides' },
              { labelKey: 'groupTours', href: '/tours' },
              { labelKey: 'corporateLogistics', href: '/fleet' },
            ].map(({ labelKey, href }) => (
              <li key={labelKey}>
                <Link href={`/${locale}${href}`} className="hover:text-primary transition-colors">
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-label-md font-bold mb-4 uppercase tracking-wider text-on-surface">
            {t('resources')}
          </h4>
          <ul className="flex flex-col gap-3 text-label-md text-on-surface-variant">
            <li>
              <Link href={`/${locale}/border-info`} className="font-bold text-secondary hover:underline">
                {t('borderProtocols')}
              </Link>
            </li>
            {[
              { labelKey: 'fleetInfo', href: '/fleet' },
              { labelKey: 'toursPackages', href: '/tours' },
              { labelKey: 'safetyFaq', href: '/about' },
            ].map(({ labelKey, href }) => (
              <li key={labelKey}>
                <Link href={`/${locale}${href}`} className="hover:text-primary transition-colors">
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-label-md font-bold mb-4 uppercase tracking-wider text-on-surface">
            {t('company')}
          </h4>
          <ul className="flex flex-col gap-3 text-label-md text-on-surface-variant">
            {[
              { labelKey: 'aboutUs', href: '/about' },
              { labelKey: 'contactSupport', href: '/about#contact' },
              { labelKey: 'privacyPolicy', href: '/#' },
              { labelKey: 'termsOfService', href: '/#' },
            ].map(({ labelKey, href }) => (
              <li key={labelKey}>
                <Link href={`/${locale}${href}`} className="hover:text-primary transition-colors">
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 mt-10 md:mt-16 pt-6 md:pt-8 border-t border-outline-variant/40 flex flex-col md:flex-row justify-between items-center gap-3 text-body-sm text-on-surface-variant text-center md:text-left">
        <p>© {new Date().getFullYear()} Beninfy Logistics. {t('tagline')}</p>
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 text-label-sm">
          <span>Lagos: +234 800 BENINFY</span>
          <span>Cotonou: +229 97 000 000</span>
        </div>
      </div>
    </footer>
  )
}
