import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'

export default function Footer() {
  const locale = useLocale()

  return (
    <footer className="bg-surface-dim border-t border-outline-variant py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link href={`/${locale}`} className="block mb-4">
            <Image
              src="/logo.png"
              alt="Beninfy"
              width={110}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <p className="text-body-sm text-on-surface-variant pr-8 leading-relaxed">
            Premium West African transport and logistics. Reliable, safe, and exclusive cross-border solutions.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cursor-pointer hover:text-primary text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="cursor-pointer hover:text-primary text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">language</span>
            </a>
            <a href="mailto:info@beninfy.com" aria-label="Email" className="cursor-pointer hover:text-primary text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-label-md font-bold mb-4 uppercase tracking-wider text-on-surface">
            Services
          </h4>
          <ul className="flex flex-col gap-3 text-label-md text-on-surface-variant">
            {[
              { label: 'Private Rides', href: '/rides' },
              { label: 'VIP Escorts', href: '/rides' },
              { label: 'Group Tours', href: '/tours' },
              { label: 'Corporate Logistics', href: '/fleet' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={`/${locale}${href}`} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-label-md font-bold mb-4 uppercase tracking-wider text-on-surface">
            Resources
          </h4>
          <ul className="flex flex-col gap-3 text-label-md text-on-surface-variant">
            <li>
              <Link href={`/${locale}/border-info`} className="font-bold text-secondary hover:underline">
                Border Protocols
              </Link>
            </li>
            {[
              { label: 'Fleet Information', href: '/fleet' },
              { label: 'Tours & Packages', href: '/tours' },
              { label: 'Safety FAQ', href: '/about' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={`/${locale}${href}`} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-label-md font-bold mb-4 uppercase tracking-wider text-on-surface">
            Company
          </h4>
          <ul className="flex flex-col gap-3 text-label-md text-on-surface-variant">
            {[
              { label: 'About Us', href: '/about' },
              { label: 'Contact Support', href: '/about#contact' },
              { label: 'Privacy Policy', href: '/#' },
              { label: 'Terms of Service', href: '/#' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={`/${locale}${href}`} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 mt-16 pt-8 border-t border-outline-variant/40 flex flex-col md:flex-row justify-between items-center gap-2 text-body-sm text-on-surface-variant">
        <p>© {new Date().getFullYear()} Beninfy Logistics. Premium West African Transport.</p>
        <div className="flex gap-6 text-label-sm">
          <span>Lagos: +234 800 BENINFY</span>
          <span>Cotonou: +229 97 000 000</span>
        </div>
      </div>
    </footer>
  )
}
