'use client'

import { useEffect, useState, useCallback } from 'react'

export type FieldType = 'text' | 'number' | 'textarea' | 'boolean' | 'array' | 'select'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  // shown only on create
  createOnly?: boolean
}

export interface Column<T> {
  header: string
  render: (item: T) => React.ReactNode
  className?: string
}

interface Props<T extends { id: string }> {
  title: string
  description?: string
  fetchUrl: string
  // returned JSON key, e.g. 'vehicles' for { vehicles: [...] }
  collectionKey: string
  itemKey: string
  createUrl?: string
  itemUrl?: (id: string) => string
  columns: Column<T>[]
  fields?: FieldDef[]
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  defaultValues?: Partial<Record<string, unknown>>
}

export function CrudTable<T extends { id: string } & Record<string, unknown>>({
  title,
  description,
  fetchUrl,
  collectionKey,
  createUrl,
  itemUrl,
  columns,
  fields = [],
  canCreate = true,
  canEdit = true,
  canDelete = true,
  defaultValues = {},
}: Props<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<{ mode: 'create' | 'edit'; item?: T } | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const modalFormId = `${collectionKey}-crud-modal-form`
  const singularTitle = title.endsWith('ies')
    ? `${title.slice(0, -3)}y`
    : title.endsWith('s')
      ? title.slice(0, -1)
      : title

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    const scrollY = window.scrollY
    const previousBodyPosition = document.body.style.position
    const previousBodyTop = document.body.style.top
    const previousBodyWidth = document.body.style.width
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior

    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.position = previousBodyPosition
      document.body.style.top = previousBodyTop
      document.body.style.width = previousBodyWidth
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll
      window.scrollTo(0, scrollY)
    }
  }, [open])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setItems((data[collectionKey] ?? []) as T[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [fetchUrl, collectionKey])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    const initial: Record<string, unknown> = { ...defaultValues }
    for (const f of fields) {
      if (initial[f.name] === undefined) {
        if (f.type === 'boolean') initial[f.name] = false
        else if (f.type === 'array') initial[f.name] = ''
        else if (f.type === 'number') initial[f.name] = ''
        else if (f.type === 'select') initial[f.name] = f.options?.[0]?.value ?? ''
        else initial[f.name] = ''
      } else if (f.type === 'array' && Array.isArray(initial[f.name])) {
        initial[f.name] = (initial[f.name] as string[]).join('\n')
      }
    }
    setForm(initial)
    setOpen({ mode: 'create' })
  }

  const openEdit = (item: T) => {
    const initial: Record<string, unknown> = {}
    for (const f of fields) {
      const v = item[f.name]
      if (f.type === 'array') initial[f.name] = Array.isArray(v) ? (v as string[]).join('\n') : ''
      else if (f.type === 'boolean') initial[f.name] = !!v
      else if (v === null || v === undefined) initial[f.name] = ''
      else initial[f.name] = v
    }
    setForm(initial)
    setOpen({ mode: 'edit', item })
  }

  const close = () => { setOpen(null); setForm({}) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!open) return
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {}
      for (const f of fields) {
        const raw = form[f.name]
        if (open.mode === 'edit' && f.createOnly) continue
        if (f.type === 'number') {
          if (raw === '' || raw === null || raw === undefined) {
            if (f.required) throw new Error(`${f.label} required`)
            continue
          }
          const n = Number(raw)
          if (Number.isNaN(n)) throw new Error(`${f.label} must be a number`)
          payload[f.name] = n
        } else if (f.type === 'boolean') {
          payload[f.name] = !!raw
        } else if (f.type === 'array') {
          const list = String(raw ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
          payload[f.name] = list
        } else {
          const s = String(raw ?? '').trim()
          if (!s && f.required) throw new Error(`${f.label} required`)
          payload[f.name] = s === '' ? null : s
        }
      }
      const url = open.mode === 'create' ? createUrl! : itemUrl!(open.item!.id)
      const method = open.mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      await load()
      close()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this item?')) return
    setDeleting(id)
    try {
      const res = await fetch(itemUrl!(id), { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#3e004c' }}>{title}</h1>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        {canCreate && createUrl && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: '#3e004c' }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                {columns.map((c) => (
                  <th key={c.header} className={`text-left px-5 py-3 ${c.className ?? ''}`}>{c.header}</th>
                ))}
                {(canEdit || canDelete) && <th className="px-5 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-5 py-10 text-center text-gray-400">No items.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  {columns.map((c) => (
                    <td key={c.header} className={`px-5 py-3 ${c.className ?? ''}`}>{c.render(item)}</td>
                  ))}
                  {(canEdit || canDelete) && (
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {canEdit && itemUrl && (
                        <button onClick={() => openEdit(item)} className="text-xs text-purple-700 hover:underline mr-3">Edit</button>
                      )}
                      {canDelete && itemUrl && (
                        <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="text-xs text-red-600 hover:underline disabled:opacity-50">
                          {deleting === item.id ? '…' : 'Delete'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-black/40 p-3 sm:items-center sm:p-4" onClick={close}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:h-[calc(100dvh-2rem)]"
          >
            <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h2 className="font-semibold" style={{ color: '#3e004c' }}>{open.mode === 'create' ? `New ${singularTitle}` : `Edit ${singularTitle}`}</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={close} className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button
                  type="submit"
                  form={modalFormId}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#3e004c' }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={close} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
              </div>
            </div>
            <form id={modalFormId} onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="admin-modal-scroll min-h-0 flex-1 space-y-4 overflow-y-scroll overscroll-contain p-6 pb-8">
                {fields.map((f) => {
                  if (open.mode === 'edit' && f.createOnly) return null
                  const value = form[f.name] ?? ''
                  if (f.type === 'textarea') {
                    return (
                      <div key={f.name}>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}{f.required && ' *'}</label>
                        <textarea
                          value={String(value)}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          rows={4}
                          className="min-h-24 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder={f.placeholder}
                        />
                      </div>
                    )
                  }
                  if (f.type === 'array') {
                    return (
                      <div key={f.name}>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label} <span className="text-gray-400 font-normal">(one per line)</span></label>
                        <textarea
                          value={String(value)}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          rows={4}
                          className="min-h-24 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder={f.placeholder}
                        />
                      </div>
                    )
                  }
                  if (f.type === 'boolean') {
                    return (
                      <label key={f.name} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!value}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                        />
                        {f.label}
                      </label>
                    )
                  }
                  if (f.type === 'select') {
                    return (
                      <div key={f.name}>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}{f.required && ' *'}</label>
                        <select
                          value={String(value)}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          required={f.required && open.mode === 'create'}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        >
                          {f.options?.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    )
                  }
                  return (
                    <div key={f.name}>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}{f.required && ' *'}</label>
                      <input
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={String(value)}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        required={f.required && open.mode === 'create'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder={f.placeholder}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4">
                <button type="button" onClick={close} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50" style={{ background: '#3e004c' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
