'use client'

import { CrudTable } from '@/components/admin/CrudTable'

interface Driver {
  id: string
  name: string
  phone: string
  email: string | null
  status: string
  homeCity: string | null
  licenseNumber: string | null
  notes: string | null
  [key: string]: unknown
}

export default function AdminDriversPage() {
  return (
    <CrudTable<Driver>
      title="Drivers"
      description="Manage driver records for trip assignment."
      fetchUrl="/api/admin/drivers"
      collectionKey="drivers"
      itemKey="id"
      createUrl="/api/admin/drivers"
      itemUrl={(id) => `/api/admin/drivers/${id}`}
      columns={[
        { header: 'Name', render: (d) => <p className="font-medium text-gray-800">{d.name}</p> },
        { header: 'Phone', render: (d) => d.phone },
        { header: 'Email', render: (d) => d.email ?? '—' },
        { header: 'Status', render: (d) => <span className={d.status === 'available' ? 'text-green-700 text-xs' : 'text-amber-700 text-xs'}>{d.status}</span> },
        { header: 'Home city', render: (d) => d.homeCity ?? '—' },
        { header: 'License', render: (d) => d.licenseNumber ?? '—' },
      ]}
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'status', label: 'Status', type: 'text', required: true, placeholder: 'available, off_duty, inactive' },
        { name: 'homeCity', label: 'Home city', type: 'text' },
        { name: 'licenseNumber', label: 'License number', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      defaultValues={{ status: 'available' }}
    />
  )
}
