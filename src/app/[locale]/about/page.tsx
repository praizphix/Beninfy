import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mt-16">
        {/* Hero */}
        <section
          className="py-24 text-center relative"
          style={{
            background: "linear-gradient(rgba(62,0,76,0.88), rgba(62,0,76,0.75)), url('https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <h1 className="text-display-lg text-white mb-4">About Beninfy</h1>
            <p className="text-body-lg text-white/80 max-w-2xl mx-auto">
              We are West Africa&apos;s most trusted private cross-border transport and logistics company — connecting Nigeria, Benin, Togo and Ghana with premium vehicles and expert border assistance.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 max-w-[1280px] mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary text-label-md tracking-widest uppercase">Our Story</span>
              <h2 className="text-headline-lg mt-2 mb-4">Built for the West African Traveller</h2>
              <p className="text-on-surface-variant text-body-lg mb-4">
                Beninfy was founded to solve a real problem — cross-border travel between Nigeria, Benin, Togo, and Ghana was unreliable, stressful, and dangerous. We built a service that combines premium vehicles, professional drivers, and expert border handlers to deliver a seamless journey.
              </p>
              <p className="text-on-surface-variant text-body-lg">
                Today, we operate 5 official routes across 4 countries, serving corporate executives, diplomatic missions, families and tourists with the highest standards of safety and comfort.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '5', label: 'Official Routes' },
                { value: '10K+', label: 'Passengers Served' },
                { value: '4', label: 'Countries' },
                { value: '24/7', label: 'Customer Support' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-surface-container-low rounded-2xl p-6 text-center border border-outline-variant">
                  <div className="text-display-lg text-primary">{value}</div>
                  <div className="text-label-md text-on-surface-variant mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <h2 className="text-headline-lg text-center mb-12">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'security', title: 'Safety First', desc: 'Every vehicle is GPS-tracked, every driver verified. Security escorts available for VIP clients.' },
                { icon: 'verified', title: 'Radical Transparency', desc: 'One price, no surprises. Every border fee is disclosed upfront, in Nigerian Naira.' },
                { icon: 'language', title: 'Bilingual Service', desc: 'English and French communication throughout — from booking to border crossing.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-primary text-[28px]">{icon}</span>
                  </div>
                  <h3 className="text-headline-sm mb-3">{title}</h3>
                  <p className="text-on-surface-variant text-body-md">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Routes we serve */}
        <section className="py-20 max-w-[1280px] mx-auto px-4 md:px-10">
          <h2 className="text-headline-lg text-center mb-4">Our Coverage</h2>
          <p className="text-on-surface-variant text-body-md text-center mb-12">Official routes operated by Beninfy</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {[
              { route: 'Lagos → Cotonou', duration: '3.5h', countries: 'NG → BJ' },
              { route: 'Cotonou → Lomé', duration: '3h', countries: 'BJ → TG' },
              { route: 'Lomé → Accra', duration: '4h', countries: 'TG → GH' },
              { route: 'Lagos → Lomé', duration: '6.5h', countries: 'NG → TG' },
              { route: 'Lagos → Accra', duration: '10.5h', countries: 'NG → GH' },
            ].map(({ route, duration, countries }) => (
              <div key={route} className="bg-surface-container-low rounded-xl p-4 text-center border border-outline-variant">
                <div className="text-label-sm text-on-surface-variant mb-1">{countries}</div>
                <div className="text-label-md text-primary">{route}</div>
                <div className="text-label-sm text-secondary mt-1">~{duration}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact section */}
        <section id="contact" className="py-20 bg-primary">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <h2 className="text-headline-lg text-on-primary text-center mb-12">Get In Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'call', title: 'Lagos Office', value: '+234 (0) 800 BENINFY', sub: 'Mon – Sat, 7am – 9pm WAT' },
                { icon: 'call', title: 'Cotonou Office', value: '+229 (0) 97 BENINFY', sub: 'Mon – Sat, 7am – 9pm WAT' },
                { icon: 'alternate_email', title: 'Email Us', value: 'hello@beninfy.com', sub: 'Response within 2 hours' },
              ].map(({ icon, title, value, sub }) => (
                <div key={title} className="bg-primary-container rounded-2xl p-6 text-center">
                  <span className="material-symbols-outlined text-on-primary text-[32px] mb-3 block">{icon}</span>
                  <h3 className="text-label-md text-on-primary/70 mb-1">{title}</h3>
                  <p className="text-headline-sm text-on-primary mb-1">{value}</p>
                  <p className="text-label-sm text-on-primary/60">{sub}</p>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-10 text-center">
              <a
                href="https://wa.me/2348001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-xl text-headline-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[24px]">chat</span>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
