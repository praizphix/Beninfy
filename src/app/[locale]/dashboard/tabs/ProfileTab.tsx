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
    <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_45px_rgba(62,0,76,0.08)]">
      <div className="border-b border-gray-100 bg-[#fbf7fc] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl bg-[#3e004c] text-[22px] text-[#f4d66c]">person</span>
          <div>
            <h2 className="text-xl font-bold text-[#3e004c]">Profile</h2>
            <p className="mt-1 text-sm text-gray-500">Manage your account details.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSave} className="space-y-5 p-5 sm:p-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-[#fbf7fc] px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-[#3e004c] focus:bg-white focus:ring-2 focus:ring-[#3e004c]/15"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email</label>
          <input
            type="email"
            value={profile.email ?? ''}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-[#fbf7fc] px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-[#3e004c] focus:bg-white focus:ring-2 focus:ring-[#3e004c]/15"
            placeholder="+234 801 234 5678"
          />
        </div>
        {message && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${message.kind === 'ok' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-700'}`}>{message.text}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3e004c] py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(62,0,76,0.18)] transition-colors hover:bg-[#50115f] disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Saving...
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
