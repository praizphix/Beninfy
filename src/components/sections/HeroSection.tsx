import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[600px] flex items-center pt-20 pb-36"
      style={{
        background:
          "linear-gradient(rgba(24,28,32,0.45), rgba(24,28,32,0.65)), url('https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80') center/cover no-repeat",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 w-full text-white z-10">
        {/* Headline */}
        <div className="max-w-2xl mb-10">
          <h1 className="text-display-lg text-white mb-4">
            Private Cross-Border Travel<br />Across West Africa
          </h1>
          <p className="text-body-lg opacity-80">
            Travel safely between Lagos, Cotonou, Togo &amp; Ghana in premium private vehicles with
            expert border assistance.
          </p>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            { icon: 'verified', label: 'Secure Checkout' },
            { icon: 'language', label: 'Bilingual Drivers' },
            { icon: 'shield', label: 'Border Protocol' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-label-md"
            >
              <span className="material-symbols-outlined text-[18px] icon-fill">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/en/rides"
            className="rounded-xl bg-primary px-8 py-4 text-headline-sm text-on-primary shadow-lg hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.02] active:scale-95 transition-all"
          >
            Book a Ride
          </Link>
          <Link
            href="/en/tours"
            className="rounded-xl border-2 border-secondary-container/80 text-secondary-container px-8 py-4 text-headline-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all"
          >
            Explore Tours
          </Link>
        </div>
      </div>
    </section>
  )
}
