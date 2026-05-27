'use client'

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
  basePriceNGN: number | null
  features: string[]
  [key: string]: unknown
}

export default function AdminVehiclesPage() {
  return (
    <CrudTable<Vehicle>
      title="Vehicles"
      description="Manage the fleet catalog."
      fetchUrl="/api/admin/vehicles"
      collectionKey="vehicles"
      itemKey="id"
      createUrl="/api/admin/vehicles"
      itemUrl={(id) => `/api/admin/vehicles/${id}`}
      columns={[
        { header: 'ID', render: (v) => <code className="text-xs text-gray-500">{v.id}</code> },
        { header: 'Name', render: (v) => <p className="font-medium text-gray-800">{v.name}</p> },
        { header: 'Capacity', render: (v) => `${v.capacity} pax` },
        { header: 'Luggage', render: (v) => `${v.luggageCapacity}` },
        { header: 'Base price', render: (v) => v.basePriceNGN ? formatNGN(v.basePriceNGN) : '—' },
        { header: 'Available', render: (v) => v.available ? <span className="text-green-700 text-xs">yes</span> : <span className="text-red-600 text-xs">no</span> },
        { header: 'Badge', render: (v) => v.badge ?? '—' },
      ]}
      fields={[
        { name: 'id', label: 'ID (slug)', type: 'text', required: true, createOnly: true, placeholder: 'e.g. saloon' },
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
