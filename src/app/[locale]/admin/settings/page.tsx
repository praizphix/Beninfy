'use client'

import { useState } from 'react'

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
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#3e004c' }}>Settings</h1>
        <p className="text-sm text-gray-500">Manage your backoffice account security.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold mb-1" style={{ color: '#3e004c' }}>Change password</h2>
        <p className="text-xs text-gray-500 mb-5">Use a strong password with at least 8 characters.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Current password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">New password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm new password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ background: '#3e004c' }}
          >
            {saving ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
