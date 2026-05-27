'use client'

import { CrudTable } from '@/components/admin/CrudTable'
import { formatNGN } from '@/lib/utils'

interface BorderFee {
  id: string
  country: string
  border: string
  feePerPersonNGN: number
  feeRoundTripNGN: number
  popular: boolean
  [key: string]: unknown
}

export default function AdminBorderFeesPage() {
  return (
    <CrudTable<BorderFee>
      title="Border fees"
      description="Manage border crossing fees and services."
      fetchUrl="/api/admin/border-fees"
      collectionKey="borderFees"
      itemKey="id"
      createUrl="/api/admin/border-fees"
      itemUrl={(id) => `/api/admin/border-fees/${id}`}
      columns={[
        { header: 'ID', render: (b) => <code className="text-xs text-gray-500">{b.id}</code> },
        { header: 'Country', render: (b) => <p className="font-medium text-gray-800">{b.country}</p> },
        { header: 'Border', render: (b) => b.border },
        { header: 'Per person', render: (b) => formatNGN(b.feePerPersonNGN) },
        { header: 'Round-trip', render: (b) => formatNGN(b.feeRoundTripNGN) },
        { header: 'Popular', render: (b) => b.popular ? 'yes' : 'no' },
      ]}
      fields={[
        { name: 'id', label: 'ID (slug)', type: 'text', required: true, createOnly: true },
        { name: 'country', label: 'Country', type: 'text', required: true },
        { name: 'countryFr', label: 'Country (FR)', type: 'text' },
        { name: 'border', label: 'Border crossing', type: 'text', required: true },
        { name: 'borderFr', label: 'Border (FR)', type: 'text' },
        { name: 'countries', label: 'Countries involved', type: 'array' },
        { name: 'feePerPersonNGN', label: 'Per person fee (NGN)', type: 'number', required: true },
        { name: 'feeRoundTripNGN', label: 'Round-trip fee (NGN)', type: 'number', required: true },
        { name: 'popular', label: 'Popular', type: 'boolean' },
        { name: 'icon', label: 'Icon (material symbol)', type: 'text' },
        { name: 'services', label: 'Services', type: 'array' },
        { name: 'servicesFr', label: 'Services (FR)', type: 'array' },
        { name: 'documents', label: 'Required documents', type: 'array' },
        { name: 'documentsFr', label: 'Documents (FR)', type: 'array' },
        { name: 'tips', label: 'Tips', type: 'array' },
        { name: 'tipsFr', label: 'Tips (FR)', type: 'array' },
      ]}
    />
  )
}
