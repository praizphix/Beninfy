'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'

export default function AdminLoginPage() {
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { signIn, getSession, signOut } = await import('next-auth/react')
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) throw new Error('Invalid email or password')
      const session = await getSession()
      const role = (session?.user as { role?: string } | undefined)?.role
      if (role !== 'admin' && role !== 'super_admin') {
        await signOut({ redirect: false })
        throw new Error('This account does not have backoffice access.')
      }
      router.push(`/${locale}/admin`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1a0420' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <Image src="/logo.png" alt="Beninfy" width={120} height={48} className="h-12 w-auto object-contain mb-3" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Backoffice</p>
            <h1 className="text-2xl font-bold mt-2" style={{ color: '#3e004c' }}>Admin sign in</h1>
            <p className="text-sm text-gray-500 mt-1">Restricted access. Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-purple-700 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                placeholder="admin@beninfy.africa"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-300 focus:border-purple-700 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-colors disabled:opacity-60"
              style={{ background: '#3e004c' }}
            >
              {loading ? 'Signing in…' : 'Sign in to backoffice'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Not an admin?{' '}
            <a href={`/${locale}/login`} className="text-purple-700 hover:underline">Go to user sign in</a>
          </p>
        </div>
        <p className="text-center text-[11px] text-white/40 mt-4">
          Beninfy Backoffice · Activity is monitored.
        </p>
      </div>
    </div>
  )
}
