'use client'

import { useEffect, useState, useCallback } from 'react'

interface UserRow {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: 'user' | 'admin' | 'super_admin'
  createdAt: string
  _count: { bookings: number }
}

const ROLE_LABEL: Record<UserRow['role'], string> = {
  user: 'User',
  admin: 'Admin',
  super_admin: 'Super admin',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [viewerRole, setViewerRole] = useState<UserRow['role'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'admin' as 'admin' | 'user' })
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSuper = viewerRole === 'super_admin'

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const res = await fetch(`/api/admin/users?${params.toString()}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setViewerRole(data.viewerRole ?? null)
    setLoading(false)
  }, [q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const setRole = async (id: string, role: UserRow['role']) => {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Failed to update role')
        return
      }
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u))
    } finally { setBusy(null) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this user? Their bookings remain but become orphaned.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Failed to delete')
        return
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } finally { setBusy(null) }
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          role: form.role,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to create user')
        return
      }
      setShowCreate(false)
      setForm({ name: '', email: '', password: '', phone: '', role: 'admin' })
      await load()
    } finally { setSubmitting(false) }
  }

  const submitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetTarget) return
    setResetError(null)
    setResetting(true)
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResetError(data.error ?? 'Password reset failed')
        return
      }
      setResetTarget(null)
      setResetPassword('')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#3e004c' }}>Users</h1>
          <p className="text-sm text-gray-500">
            {isSuper ? 'Manage customers and admin team.' : 'View customer accounts. Role changes require super admin.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {isSuper && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg text-sm text-white"
              style={{ background: '#3e004c' }}
            >
              + Add user
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Phone</th>
              <th className="text-left px-5 py-3">Bookings</th>
              <th className="text-left px-5 py-3">Joined</th>
              <th className="text-left px-5 py-3">Role</th>
              {isSuper && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isSuper ? 7 : 6} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={isSuper ? 7 : 6} className="px-5 py-10 text-center text-gray-400">No users.</td></tr>
            ) : users.map((u) => {
              const isThisSuper = u.role === 'super_admin'
              return (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-medium text-gray-800">{u.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-700">{u.email ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-700">{u.phone ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-700">{u._count.bookings}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {isSuper && !isThisSuper ? (
                      <select
                        value={u.role}
                        onChange={(e) => setRole(u.id, e.target.value as UserRow['role'])}
                        disabled={busy === u.id}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        isThisSuper ? 'bg-purple-50 text-purple-700' :
                        u.role === 'admin' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>{ROLE_LABEL[u.role]}</span>
                    )}
                  </td>
                  {isSuper && (
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {!isThisSuper && (
                        <>
                          <button
                            onClick={() => {
                              setResetTarget(u)
                              setResetPassword('')
                              setResetError(null)
                            }}
                            disabled={busy === u.id}
                            className="text-xs text-purple-700 hover:underline disabled:opacity-50 mr-3"
                          >Reset password</button>
                          <button
                            onClick={() => remove(u.id)}
                            disabled={busy === u.id}
                            className="text-xs text-red-600 hover:underline disabled:opacity-50"
                          >Delete</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-1" style={{ color: '#3e004c' }}>Add user</h2>
            <p className="text-xs text-gray-500 mb-4">Create a team member or customer account.</p>
            <form onSubmit={submitCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Password</label>
                <input
                  required
                  type="text"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="At least 8 chars"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Phone (optional)</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setError(null) }}
                  className="px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
                  style={{ background: '#3e004c' }}
                >{submitting ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-1" style={{ color: '#3e004c' }}>Reset password</h2>
            <p className="text-xs text-gray-500 mb-4">
              Set a new temporary password for {resetTarget.email ?? resetTarget.name ?? 'this user'}.
            </p>
            <form onSubmit={submitPasswordReset} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">New password</label>
                <input
                  required
                  type="text"
                  minLength={8}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="At least 8 chars"
                />
              </div>
              {resetError && <p className="text-xs text-red-600">{resetError}</p>}
              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setResetTarget(null); setResetPassword(''); setResetError(null) }}
                  className="px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
                  style={{ background: '#3e004c' }}
                >{resetting ? 'Saving...' : 'Reset password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
