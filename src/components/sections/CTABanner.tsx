import Link from 'next/link'

export default function CTABanner() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(62,0,76,0.95) 0%, rgba(91,19,107,0.95) 100%), url('https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #fed65b 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #fed65b 0%, transparent 70%)' }}
      />

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-10 text-center text-white">
        <span className="text-secondary-container text-label-md tracking-widest uppercase">
          Get Started Today
        </span>
        <h2 className="text-display-lg text-white mt-3 mb-4">
          Ready to Travel Across West Africa?
        </h2>
        <p className="text-body-lg opacity-80 max-w-2xl mx-auto mb-12">
          Book a private cross-border ride today. Expert border assistance, premium vehicles, and
          bilingual drivers — all included.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/en/rides"
            className="rounded-xl bg-secondary text-on-secondary px-10 py-4 text-headline-sm shadow-lg hover:bg-secondary-container hover:text-on-secondary-container hover:scale-[1.02] active:scale-95 transition-all"
          >
            Book a Ride Now
          </Link>
          <Link
            href="/en/tours"
            className="rounded-xl border-2 border-white/40 text-white px-10 py-4 text-headline-sm hover:bg-white/10 transition-all"
          >
            Explore Tours
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {[
            { icon: 'verified', text: 'Verified Drivers' },
            { icon: 'assignment_ind', text: 'Expert Border Handlers' },
            { icon: 'lock', text: '100% Private Rides' },
            { icon: 'support_agent', text: '24/7 Support' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-label-md opacity-80">
              <span className="material-symbols-outlined icon-fill text-secondary-container text-[18px]">
                {icon}
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
