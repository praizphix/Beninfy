'use client'

import { useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminUI'

export default function AdminSettingsPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Password update failed.')
        return
      }
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Password updated successfully.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Settings"
        description="Manage your backoffice account security and keep administrative access protected."
        icon="settings"
      />

      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_45px_rgba(62,0,76,0.08)]">
        <div className="border-b border-gray-100 bg-[#fbf7fc] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[20px] text-[#3e004c] shadow-sm">lock_reset</span>
            <div>
              <h2 className="font-semibold text-[#3e004c]">Change password</h2>
              <p className="text-xs text-gray-500">Use a strong password with at least 8 characters.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Current password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 bg-[#fbf7fc] px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-[#3e004c] focus:bg-white focus:ring-2 focus:ring-[#3e004c]/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">New password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 bg-[#fbf7fc] px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-[#3e004c] focus:bg-white focus:ring-2 focus:ring-[#3e004c]/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Confirm new password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 bg-[#fbf7fc] px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-[#3e004c] focus:bg-white focus:ring-2 focus:ring-[#3e004c]/15"
            />
          </div>

          {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3e004c] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(62,0,76,0.18)] transition-colors hover:bg-[#50115f] disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
