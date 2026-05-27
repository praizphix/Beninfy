'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export default function RegisterPage() {
  const locale = useLocale()
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Registration failed')
      }
      const { signIn } = await import('next-auth/react')
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (result?.error) throw new Error('Could not sign in')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-screen">
      {/* Left brand panel */}
      <section className="hidden md:flex md:w-1/2 lg:w-7/12 relative bg-primary overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/70 to-primary-container" />
        <div className="relative z-10 p-10 lg:p-14 flex flex-col justify-between h-full">
          <div>
            <Image src="/logo.png" alt="Beninfy" width={140} height={60} className="h-14 w-auto object-contain brightness-0 invert" />
          </div>
          <div className="max-w-md">
            <h2 className="text-display-lg text-primary-fixed mb-5 leading-tight">
              Premium West African Travel Starts Here
            </h2>
            <p className="text-body-lg text-primary-fixed-dim mb-8">
              Create your Beninfy account and unlock exclusive access to Nigeria's finest border crossing service, luxury fleet, and dedicated concierge support.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Instant Booking', 'NGN Pricing', 'Border Facilitation', 'VIP Concierge'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-primary-container/40 text-primary-fixed text-label-sm border border-primary-fixed/20">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-8">
            {[{ n: '5,000+', l: 'Trips Completed' }, { n: '98%', l: 'Customer Satisfaction' }, { n: '24/7', l: 'Live Support' }].map(({ n, l }) => (
              <div key={l}>
                <p className="text-headline-lg text-secondary-fixed font-bold">{n}</p>
                <p className="text-label-md text-primary-fixed-dim">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right: form panel */}
      <section className="w-full md:w-1/2 lg:w-5/12 bg-surface-container-lowest flex items-center justify-center p-6 md:p-10 min-h-screen">
        <div className="w-full max-w-sm flex flex-col">
          {/* Mobile logo */}
          <div className="md:hidden mb-8 flex justify-center">
            <Image src="/logo.png" alt="Beninfy" width={120} height={52} className="h-12 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h3 className="text-headline-lg text-on-surface mb-2">Create account</h3>
            <p className="text-body-md text-on-surface-variant">Join Beninfy and travel in style across West Africa.</p>
          </div>

          {/* Social signup */}
          <div className="flex flex-col gap-3 mb-6">
            <button className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-outline-variant rounded-xl text-label-md text-on-surface hover:bg-surface-container transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="mx-4 text-label-sm text-on-surface-variant">or create with email</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          {/* Registration form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {[
              { id: 'fullName', label: 'Full Name', placeholder: 'James Worinde', type: 'text', auto: 'name' },
              { id: 'email', label: 'Email Address', placeholder: 'name@company.com', type: 'email', auto: 'email' },
              { id: 'phone', label: 'Phone Number', placeholder: '+234 801 234 5678', type: 'tel', auto: 'tel' },
            ].map(({ id, label, placeholder, type, auto }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface" htmlFor={id}>{label}</label>
                <input
                  id={id}
                  type={type}
                  value={form[id as keyof typeof form]}
                  onChange={set(id as keyof typeof form)}
                  placeholder={placeholder}
                  required
                  autoComplete={auto}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 bg-surface border border-outline-variant rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <p className="text-body-sm text-on-surface-variant -mt-1">
              By creating an account you agree to our{' '}
              <Link href={`/${locale}/terms`} className="text-primary hover:underline">Terms of Service</Link> and{' '}
              <Link href={`/${locale}/privacy`} className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-label-md font-semibold hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            {error && <p className="text-body-sm text-error mt-1">{error}</p>}
          </form>

          <p className="text-center text-body-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link href={`/${locale}/login`} className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
