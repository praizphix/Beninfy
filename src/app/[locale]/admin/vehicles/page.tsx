'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { CrudTable } from '@/components/admin/CrudTable'
import { formatNGN } from '@/lib/utils'

interface Vehicle {
  id: string
  name: string
  nameFr: string | null
  capacity: number
  luggageCapacity: number
  available: boolean
  badge: string | null
  image: string | null
  basePriceNGN: number | null
  features: string[]
  [key: string]: unknown
}

function VehicleImageUploader({ vehicle, onUploaded }: { vehicle: Vehicle; onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('image', file)
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}/image`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data.error ?? 'Image upload failed')
        return
      }
      onUploaded()
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3 min-w-[230px]">
      <div className="h-16 w-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
        {vehicle.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">No image</div>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload image'}
        </button>
        <p className="mt-1 text-[10px] text-gray-400">JPEG, PNG, WebP, AVIF · Max 6MB</p>
      </div>
    </div>
  )
}

export default function AdminVehiclesPage() {
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <CrudTable<Vehicle>
      key={reloadKey}
      title="Vehicles"
      description="Manage booking categories and pricing buckets. Slugs are unique: use separate categories like “rav4-2010” or “highlander” when models need different pricing."
      fetchUrl="/api/admin/vehicles"
      collectionKey="vehicles"
      itemKey="id"
      createUrl="/api/admin/vehicles"
      itemUrl={(id) => `/api/admin/vehicles/${id}`}
      columns={[
        { header: 'Image', render: (v) => <VehicleImageUploader vehicle={v} onUploaded={() => setReloadKey((key) => key + 1)} /> },
        { header: 'ID', render: (v) => <code className="text-xs text-gray-500">{v.id}</code> },
        { header: 'Name', render: (v) => <p className="font-medium text-gray-800">{v.name}</p> },
        { header: 'Capacity', render: (v) => `${v.capacity} pax` },
        { header: 'Luggage', render: (v) => `${v.luggageCapacity}` },
        { header: 'Base price', render: (v) => v.basePriceNGN ? formatNGN(v.basePriceNGN) : '—' },
        { header: 'Available', render: (v) => v.available ? <span className="text-green-700 text-xs">yes</span> : <span className="text-red-600 text-xs">no</span> },
        { header: 'Badge', render: (v) => v.badge ?? '—' },
      ]}
      fields={[
        { name: 'id', label: 'Unique category slug', type: 'text', required: true, createOnly: true, placeholder: 'e.g. highlander, not an existing slug like suv' },
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'nameFr', label: 'Name (FR)', type: 'text' },
        { name: 'capacity', label: 'Capacity', type: 'number', required: true },
        { name: 'luggageCapacity', label: 'Luggage capacity', type: 'number' },
        { name: 'available', label: 'Available for booking', type: 'boolean' },
        { name: 'badge', label: 'Badge', type: 'text' },
        { name: 'badgeFr', label: 'Badge (FR)', type: 'text' },
        { name: 'basePriceNGN', label: 'Base price (NGN)', type: 'number' },
        { name: 'image', label: 'Image URL', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'descriptionFr', label: 'Description (FR)', type: 'textarea' },
        { name: 'features', label: 'Features', type: 'array' },
        { name: 'featuresFr', label: 'Features (FR)', type: 'array' },
      ]}
    />
  )
}
