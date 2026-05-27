'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface ProfileData {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
}

export default function ProfileTab() {
  const { status, update } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.user) return
        setProfile(data.user)
        setName(data.user.name ?? '')
        setPhone(data.user.phone ?? '')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [status])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() ? phone.trim() : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      setProfile(data.user)
      setMessage({ kind: 'ok', text: 'Profile updated' })
      await update()
    } catch (err) {
      setMessage({ kind: 'err', text: err instanceof Error ? err.message : 'Update failed' })
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    )
  }
  if (!profile) return null

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant max-w-xl mx-auto">
      <h2 className="text-headline-sm mb-2">Profile</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">Manage your account details.</p>
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input
            type="email"
            value={profile.email ?? ''}
            disabled
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="+234 801 234 5678"
          />
        </div>
        {message && (
          <p className={`text-xs ${message.kind === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-wait"
          style={{ background: '#3e004c' }}
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Saving…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save changes
            </>
          )}
        </button>
      </form>
    </section>
  )
}
