'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export default function AdminSignupPage() {
  const locale = useLocale()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', code: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          code: form.code,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Could not create admin account')

      const { signIn } = await import('next-auth/react')
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (result?.error) throw new Error('Admin created, but sign in failed')
      router.push(`/${locale}/admin`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#1a0420' }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-2xl md:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <Image src="/logo.png" alt="Beninfy" width={120} height={48} className="mb-3 h-12 w-auto object-contain" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Backoffice</p>
            <h1 className="mt-2 text-2xl font-bold" style={{ color: '#3e004c' }}>Create admin account</h1>
            <p className="mt-1 text-sm text-gray-500">Use the private onboarding code to join the Beninfy backoffice.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {[
              { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Admin name' },
              { id: 'email', label: 'Work email', type: 'email', autoComplete: 'email', placeholder: 'admin@beninfy.com' },
              { id: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', placeholder: '+229 97 000 000' },
              { id: 'code', label: 'Admin signup code', type: 'text', autoComplete: 'one-time-code', placeholder: 'Private code' },
            ].map(({ id, label, type, autoComplete, placeholder }) => (
              <div key={id}>
                <label className="mb-1.5 block text-xs font-medium text-gray-600" htmlFor={id}>{label}</label>
                <input
                  id={id}
                  type={type}
                  value={form[id as keyof typeof form]}
                  onChange={set(id as keyof typeof form)}
                  required={id !== 'phone'}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600" htmlFor="admin-password">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: '#3e004c' }}
            >
              {loading ? 'Creating admin...' : 'Create admin account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Already onboarded?{' '}
            <Link href={`/${locale}/admin-login`} className="text-purple-700 hover:underline">Sign in to backoffice</Link>
          </p>
        </div>
        <p className="mt-4 text-center text-[11px] text-white/40">
          Beninfy Backoffice · Admin signup is code protected.
        </p>
      </div>
    </div>
  )
}
