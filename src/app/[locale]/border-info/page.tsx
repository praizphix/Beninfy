import Link from 'next/link'
import { borderFees } from '@/data/borderFees'
import { formatNGN } from '@/lib/utils'

const COUNTRY_FLAGS: Record<string, string> = {
  'nigeria-benin': '🇳🇬→🇧🇯',
  'benin-togo': '🇧🇯→🇹🇬',
  'togo-ghana': '🇹🇬→🇬🇭',
}

export default function BorderInfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mt-16">
        {/* Hero */}
        <section className="py-20 bg-primary text-center">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <span className="text-secondary-container text-label-md tracking-widest uppercase">Transparency First</span>
            <h1 className="text-display-lg text-on-primary mt-3 mb-4">Border Protocols & Fees</h1>
            <p className="text-on-primary/80 text-body-lg max-w-2xl mx-auto">
              We handle all border crossings on your behalf. Know exactly what to expect — no hidden fees, no surprises.
            </p>
          </div>
        </section>

        {/* What we handle */}
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <h2 className="text-headline-lg text-center mb-12">What Beninfy Handles For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'assignment_ind', title: 'Document Verification', desc: 'Our agents review your passport, ECOWAS ID, and Yellow Fever certificate before departure.' },
                { icon: 'speed', title: 'Express Processing', desc: 'We navigate official fast-track lanes to minimize your time at border checkpoints.' },
                { icon: 'support_agent', title: 'On-Call Support', desc: '24/7 WhatsApp and phone support throughout your crossing — any time, any border.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-primary text-[28px]">{icon}</span>
                  </div>
                  <h3 className="text-headline-sm mb-2">{title}</h3>
                  <p className="text-on-surface-variant text-body-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Border fee cards */}
        <section className="py-20 max-w-[1280px] mx-auto px-4 md:px-10">
          <h2 className="text-headline-lg text-center mb-3">Per-Border Fee Breakdown</h2>
          <p className="text-on-surface-variant text-body-md text-center mb-12 max-w-2xl mx-auto">
            Fees below are official government charges. Beninfy&apos;s service fee is included in your quoted ride price.
          </p>

          <div className="space-y-8">
            {borderFees.map((border) => (
              <div
                key={border.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm"
              >
                {/* Header */}
                <div className="bg-primary p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{COUNTRY_FLAGS[border.id]}</div>
                    <div>
                      <h3 className="text-headline-md text-on-primary">{border.country}</h3>
                      <p className="text-on-primary/70 text-label-md">{border.border}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="text-label-sm text-on-primary/60">One Way</div>
                      <div className="text-headline-sm text-secondary-container">{formatNGN(border.feePerPersonNGN)}/person</div>
                    </div>
                    <div>
                      <div className="text-label-sm text-on-primary/60">Round Trip</div>
                      <div className="text-headline-sm text-secondary-container">{formatNGN(border.feeRoundTripNGN)}/person</div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Services */}
                  <div>
                    <h4 className="text-label-md text-primary mb-3">Services Included</h4>
                    <ul className="space-y-2">
                      {border.services.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary icon-fill text-[16px]">check_circle</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Documents required */}
                  <div>
                    <h4 className="text-label-md text-primary mb-3">Documents Required</h4>
                    <ul className="space-y-2">
                      {border.documents?.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-secondary text-[16px]">description</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tips */}
                {border.tips && border.tips.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="bg-secondary-container/20 rounded-xl p-4">
                      <h4 className="text-label-md text-secondary mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                        Pro Tips
                      </h4>
                      <ul className="space-y-1.5">
                        {border.tips.map((t) => (
                          <li key={t} className="text-body-sm text-on-surface-variant">• {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface-container-low py-16 text-center">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <h2 className="text-headline-lg mb-4">Ready to Cross the Border?</h2>
            <p className="text-on-surface-variant text-body-lg mb-8">
              Book your private ride and let Beninfy handle every border checkpoint.
            </p>
            <Link
              href="/en/rides"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-10 py-4 rounded-xl text-headline-sm hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              Book a Ride
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
