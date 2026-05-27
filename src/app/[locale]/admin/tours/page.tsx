'use client'

import { CrudTable } from '@/components/admin/CrudTable'
import { formatNGN } from '@/lib/utils'

interface Tour {
  id: string
  title: string
  country: string
  durationDays: number
  startingFromNGN: number
  highlights: string[]
  [key: string]: unknown
}

export default function AdminToursPage() {
  return (
    <CrudTable<Tour>
      title="Tours"
      description="Manage tour packages."
      fetchUrl="/api/admin/tours"
      collectionKey="tours"
      itemKey="id"
      createUrl="/api/admin/tours"
      itemUrl={(id) => `/api/admin/tours/${id}`}
      columns={[
        { header: 'ID', render: (t) => <code className="text-xs text-gray-500">{t.id}</code> },
        { header: 'Title', render: (t) => <p className="font-medium text-gray-800">{t.title}</p> },
        { header: 'Country', render: (t) => t.country },
        { header: 'Days', render: (t) => t.durationDays },
        { header: 'From', render: (t) => formatNGN(t.startingFromNGN) },
        { header: 'Highlights', render: (t) => <span className="text-xs text-gray-500">{t.highlights.length}</span> },
      ]}
      fields={[
        { name: 'id', label: 'ID (slug)', type: 'text', required: true, createOnly: true },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'titleFr', label: 'Title (FR)', type: 'text' },
        { name: 'destination', label: 'Destination', type: 'text' },
        { name: 'destinationFr', label: 'Destination (FR)', type: 'text' },
        { name: 'country', label: 'Country', type: 'text', required: true },
        { name: 'countryFr', label: 'Country (FR)', type: 'text' },
        { name: 'durationDays', label: 'Duration (days)', type: 'number', required: true },
        { name: 'startingFromNGN', label: 'Starting price (NGN)', type: 'number', required: true },
        { name: 'image', label: 'Image URL', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'descriptionFr', label: 'Description (FR)', type: 'textarea' },
        { name: 'highlights', label: 'Highlights', type: 'array' },
        { name: 'highlightsFr', label: 'Highlights (FR)', type: 'array' },
      ]}
    />
  )
}
